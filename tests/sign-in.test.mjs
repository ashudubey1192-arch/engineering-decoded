import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
const calls = [];
let session = null,
  restores = 0,
  failure = null;
const invoke = async (method, body) => {
  calls.push({ method, body });
  return failure ? { error: { message: failure } } : { data: {} };
};
globalThis.__signInTest = {
  requireAuth: () => ({
    emailOtp: { sendVerificationOtp: (body) => invoke("send", body) },
    signIn: {
      emailOtp: (body) => invoke("verify", body),
      social: (body) => invoke("social", body),
    },
  }),
  authResult: async (promise) => {
    const result = await promise;
    if (result.error) throw new Error(result.error.message);
    return result.data;
  },
  restoreSession: async () => {
    restores++;
  },
  getSession: () => session,
};
globalThis.window = { location: { origin: "https://app.example" } };
registerHooks({
  load(url, context, next) {
    if (url.endsWith("/src/services/api.js"))
      return {
        format: "module",
        shortCircuit: true,
        source:
          "export const {requireAuth,authResult,restoreSession,getSession}=globalThis.__signInTest;",
      };
    return next(url, context);
  },
});
const { sendLoginCode, verifyLoginCode, socialSignIn } = await import("../src/services/signIn.js");
test("email code delivery uses sign-in OTP without creating an app session", async () => {
  await sendLoginCode(" person@example.com ");
  assert.deepEqual(calls.pop(), {
    method: "send",
    body: { email: "person@example.com", type: "sign-in" },
  });
  assert.equal(restores, 0);
});
test("invalid code shape is rejected without calling Neon", async () => {
  const before = calls.length;
  for (const code of ["12345", "abcdef", "1234567"])
    await assert.rejects(verifyLoginCode("person@example.com", code), /six-digit/);
  assert.equal(calls.length, before);
});
test("rejected and expired OTPs cannot restore an authenticated session", async () => {
  failure = "Invalid or expired code";
  const before = restores;
  await assert.rejects(verifyLoginCode("person@example.com", "123456"), /Invalid or expired/);
  assert.equal(restores, before);
  failure = null;
});
test("accepted code restores server-authorized user and admin sessions", async () => {
  for (const [role, destination] of [
    ["USER", "/"],
    ["ADMIN", "/admin"],
  ]) {
    session = { user: { id: "verified-user", role } };
    assert.equal(await verifyLoginCode(" person@example.com ", " 012345 "), destination);
    assert.deepEqual(calls.at(-1), {
      method: "verify",
      body: { email: "person@example.com", otp: "012345" },
    });
  }
  session = null;
  await assert.rejects(verifyLoginCode("person@example.com", "123456"), /could not be completed/);
});
test("Google and GitHub use trusted same-origin callbacks", async () => {
  for (const provider of ["google", "github"]) {
    await socialSignIn(provider);
    assert.deepEqual(calls.at(-1), {
      method: "social",
      body: {
        provider,
        callbackURL: "https://app.example/account",
        errorCallbackURL: "https://app.example/login?error=oauth",
      },
    });
  }
  await assert.rejects(socialSignIn("unknown"), /Unsupported/);
  failure = "Provider unavailable";
  await assert.rejects(socialSignIn("github"), /Provider unavailable/);
  failure = null;
});
