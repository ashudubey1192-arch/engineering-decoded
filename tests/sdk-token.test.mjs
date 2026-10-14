import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { createAuthClient } from "@neondatabase/auth";
const paths = [];
globalThis.fetch = async (url) => {
  const path = new URL(url).pathname;
  paths.push(path);
  if (path === "/auth/get-session")
    return Response.json({
      user: { id: "test-user", email: "test@example.com" },
      session: { id: "session", userId: "test-user", expiresAt: "2099-01-01T00:00:00Z" },
    });
  if (path === "/auth/token") return Response.json({ token: "test-jwt" });
  return Response.json({ message: "Unknown auth endpoint" }, { status: 404 });
};
globalThis.__sdkAuth = createAuthClient("https://auth.example/auth");
registerHooks({
  load(url, context, next) {
    if (url.endsWith("/src/services/neonAuth.js"))
      return {
        format: "module",
        shortCircuit: true,
        source: "export const auth=globalThis.__sdkAuth;",
      };
    return next(url, context);
  },
});
globalThis.window = {
  fetch: async (url, options) => {
    assert.equal(url, "/api/progress");
    assert.equal(options.headers.Authorization, "Bearer test-jwt");
    return Response.json([]);
  },
};
const { api } = await import("../src/services/api.js");
test("actual installed Neon SDK obtains API token through /token, not a dynamic unknown route", async () => {
  assert.deepEqual(await api("/progress"), []);
  assert.ok(paths.includes("/auth/token"));
  assert.ok(paths.every((path) => ["/auth/get-session", "/auth/token"].includes(path)));
});
