import test from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../api/index.js";
import { authenticate } from "../server/auth.js";
import { validateEntries, validateArticle, HttpError } from "../server/validation.js";
process.env.DATABASE_URL = "postgresql://test.invalid/test";
function response() {
  return {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(n) {
      this.code = n;
      return this;
    },
    json(v) {
      this.body = v;
      return this;
    },
    end() {
      return this;
    },
  };
}
function fixture(account = { id: "owner", role: "USER", active: true }) {
  const calls = [];
  const sql = async (strings, ...values) => {
    const query = strings.join("?");
    calls.push({ query, values });
    return query.includes("SELECT id, role, active") ? [account] : [];
  };
  return {
    calls,
    handler: createHandler({ verify: async () => ({ sub: "owner" }), connect: () => sql }),
  };
}
test("missing credentials fail before database access", async () => {
  const res = response();
  await createHandler({
    connect: () => {
      throw Error("must not connect");
    },
  })({ url: "/api/progress", method: "GET", headers: {} }, res);
  assert.equal(res.code, 401);
  await assert.rejects(
    authenticate({ headers: { authorization: "Basic secret" } }),
    (e) => e.status === 401,
  );
});
test("unauthorized admin writes never reach UPDATE", async () => {
  const { handler, calls } = fixture();
  const res = response();
  await handler({ url: "/api/admin/users/other", method: "PATCH", body: { role: "ADMIN" } }, res);
  assert.equal(res.code, 403);
  assert.ok(!calls.some((c) => c.query.includes("UPDATE")));
});
test("disabled accounts cannot read progress", async () => {
  const { handler, calls } = fixture({ id: "owner", role: "USER", active: false });
  const res = response();
  await handler({ url: "/api/dsa/progress", method: "GET" }, res);
  assert.equal(res.code, 403);
  assert.equal(calls.length, 2);
});
test("reads and deletes scope ownership to verified identity, ignoring body", async () => {
  for (const [url, method] of [
    ["/api/progress", "GET"],
    ["/api/progress/42", "DELETE"],
    ["/api/dsa/progress", "GET"],
  ]) {
    const { handler, calls } = fixture();
    const res = response();
    await handler({ url, method, body: { userId: "victim" } }, res);
    assert.ok([200, 204].includes(res.code));
    const last = calls.at(-1);
    assert.ok(last.query.includes("user_id"));
    assert.ok(last.values.includes("owner"));
    assert.ok(!last.values.includes("victim"));
  }
});
test("Vercel rewrite routes and unknown API paths return JSON", async () => {
  const { handler } = fixture();
  let res = response();
  await handler({ url: "/api?route=dsa/progress", method: "GET" }, res);
  assert.equal(res.code, 200);
  res = response();
  await handler({ url: "/api/unknown", method: "GET" }, res);
  assert.equal(res.code, 404);
  assert.equal(res.headers["Cache-Control"], "no-store");
});
test("DSA batches reject dangerous keys, stale-invalid clocks, malformed JSON and duplicate keys", () => {
  const valid = { category: "drafts", entryKey: "two-sum", value: '"source"', updatedAt: 1000 };
  assert.equal(validateEntries([valid], 1000).length, 1);
  for (const patch of [
    { entryKey: "__proto__" },
    { category: "admin" },
    { updatedAt: 301001 },
    { value: "invalid" },
    { updatedAt: 0 },
    { value: "x".repeat(24001) },
  ])
    assert.throws(() => validateEntries([{ ...valid, ...patch }], 1000), HttpError);
  assert.throws(() => validateEntries([valid, valid], 1000), HttpError);
  assert.throws(() => validateEntries(Array(101).fill(valid), 1000), HttpError);
});
test("invalid writes are rejected before any progress mutation", async () => {
  const { handler, calls } = fixture();
  const res = response();
  await handler(
    { url: "/api/dsa/progress", method: "PUT", body: { entries: [{ category: "admin" }] } },
    res,
  );
  assert.equal(res.code, 400);
  assert.ok(!calls.some((c) => c.query.includes("save_dsa")));
});
test("article validation rejects out of range values", () => {
  const b = {
    moduleSlug: "dsa",
    courseSlug: "arrays",
    sectionSlug: "intro",
    articleSlug: "start",
    progressPercent: 100,
    lastPosition: 0,
    completed: true,
  };
  assert.equal(validateArticle(b), b);
  for (const patch of [
    { progressPercent: 101 },
    { lastPosition: -1 },
    { completed: "true" },
    { articleSlug: "" },
  ])
    assert.throws(() => validateArticle({ ...b, ...patch }), HttpError);
});

test("JWT verification rejects wrong audience, issuer, expiry and forged signatures", async () => {
  const { generateKeyPair, SignJWT } = await import("jose");
  const { verifyIdentity } = await import("../server/auth.js");
  const { publicKey, privateKey } = await generateKeyPair("ES256");
  const make = (
    issuer = "https://auth.example",
    audience = "app",
    expires = "2m",
    key = privateKey,
  ) =>
    new SignJWT({})
      .setProtectedHeader({ alg: "ES256" })
      .setSubject("owner")
      .setIssuedAt()
      .setIssuer(issuer)
      .setAudience(audience)
      .setExpirationTime(expires)
      .sign(key);
  assert.equal(
    (await verifyIdentity(await make(), publicKey, "https://auth.example", "app")).sub,
    "owner",
  );
  const other = await generateKeyPair("ES256");
  for (const token of [
    await make("https://evil.example"),
    await make(undefined, "other-app"),
    await make(undefined, undefined, "-1s"),
    await make(undefined, undefined, undefined, other.privateKey),
  ]) {
    await assert.rejects(
      verifyIdentity(token, publicKey, "https://auth.example", "app"),
      (e) => e.status === 401,
    );
  }
});

test("runner is optional and validates requests before forwarding code", async () => {
  const { runner } = await import("../server/runner.js");
  delete process.env.JAVA_RUNNER_URL;
  delete process.env.JAVA_RUNNER_TOKEN;
  assert.equal((await runner("status", {})).available, false);
  await assert.rejects(runner("run", {}), (e) => e.status === 503);
  process.env.JAVA_RUNNER_URL = "https://runner.example";
  process.env.JAVA_RUNNER_TOKEN = "test-server-secret";
  let called = false;
  await assert.rejects(
    runner("run", { code: "source", tests: [] }, async () => {
      called = true;
    }),
    (e) => e.status === 400,
  );
  assert.equal(called, false);
  const result = await runner(
    "run",
    { code: "source", tests: [{ label: "case", input: "", expected: "ok" }] },
    async (url, options) => {
      assert.equal(url.href, "https://runner.example/run");
      assert.equal(options.headers.Authorization, "Bearer test-server-secret");
      return { ok: true, json: async () => ({ passed: true }) };
    },
  );
  assert.equal(result.passed, true);
  delete process.env.JAVA_RUNNER_URL;
  delete process.env.JAVA_RUNNER_TOKEN;
});
