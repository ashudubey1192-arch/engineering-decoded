import assert from "node:assert/strict";
const storage = new Map(),
  remote = new Map();
const localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
let queued = 0,
  holdGet = null,
  holdPut = null;
globalThis.localStorage = localStorage;
globalThis.window = {
  localStorage,
  AbortController,
  setTimeout: () => ++queued,
  clearTimeout: () => {},
  dispatchEvent: () => {},
  Event,
  fetch: async (url, options) => {
    const user = options.headers.Authorization.replace("Bearer ", "");
    if (holdGet && !options.method) await holdGet;
    if (options.method === "PUT") {
      if (holdPut) await holdPut;
      const rows = remote.get(user) || [];
      for (const entry of JSON.parse(options.body).entries) {
        const i = rows.findIndex(
          (e) => e.category === entry.category && e.entryKey === entry.entryKey,
        );
        if (i < 0) rows.push(entry);
        else if (entry.updatedAt > rows[i].updatedAt) rows[i] = entry;
      }
      remote.set(user, rows);
    }
    return {
      ok: true,
      status: 200,
      json: async () => JSON.parse(JSON.stringify(remote.get(user) || [])),
    };
  },
};
const { setSession, clearSession, api } = await import("../src/services/api.js");
const { updateDsaProgress, syncDsaProgress, importGuestProgress } =
  await import("../src/services/dsaProgress.js");
const key = "engineering-decoded:dsa-practice:v1";
const state = (user) => JSON.parse(storage.get(user ? `${key}:${user}` : key));
updateDsaProgress("drafts", "guest-task", "guest code");
setSession({ user: { id: "A" }, accessToken: "A" });
updateDsaProgress("drafts", "task", "account A");
await syncDsaProgress();
assert.equal(JSON.parse(remote.get("A").find((e) => e.entryKey === "task").value), "account A");
assert.equal(state("A").drafts["guest-task"], undefined);
importGuestProgress();
assert.equal(state("A").drafts["guest-task"], "guest code");
setSession({ user: { id: "B" }, accessToken: "B" });
updateDsaProgress("drafts", "task", "account B");
await syncDsaProgress();
assert.equal(state("B").drafts.task, "account B");
assert.equal(state("B").drafts["guest-task"], undefined);
assert.equal(state("A").drafts.task, "account A");

let release;
holdGet = new Promise((resolve) => {
  release = resolve;
});
setSession({ user: { id: "A" }, accessToken: "A" });
const pending = syncDsaProgress();
setSession({ user: { id: "B" }, accessToken: "B" });
updateDsaProgress("drafts", "task", "B while A is downloading");
release();
await pending;
holdGet = null;
assert.equal(state("B").drafts.task, "B while A is downloading");

holdPut = new Promise((resolve) => {
  release = resolve;
});
const uploading = syncDsaProgress();
await new Promise((resolve) => setImmediate(resolve));
updateDsaProgress("drafts", "task", "typed during upload");
release();
await uploading;
holdPut = null;
assert.equal(state("B").drafts.task, "typed during upload");
await syncDsaProgress();
assert.equal(
  JSON.parse(remote.get("B").find((e) => e.entryKey === "task").value),
  "typed during upload",
);
assert.ok(queued > 0);
clearSession();
updateDsaProgress("solved", "guest-only", true);
assert.equal(state().drafts["guest-task"], "guest code");
assert.equal(state().drafts.task, undefined);

setSession({ user: { id: "A" }, accessToken: "expired", refreshToken: "A-refresh" });
window.fetch = async (url) => {
  if (url.endsWith("/auth/refresh")) {
    setSession({ user: { id: "B" }, accessToken: "B" });
    return { ok: true, json: async () => ({ user: { id: "A" }, accessToken: "A" }) };
  }
  return { status: 401 };
};
await assert.rejects(api("/dsa/progress"), /Account changed/);
assert.equal(JSON.parse(storage.get("engineering-decoded-session")).user.id, "B");
delete globalThis.window;
delete globalThis.localStorage;
console.log(
  "Verified account separation, guest import, stale responses, edits during sync, and account-switch refresh protection.",
);
