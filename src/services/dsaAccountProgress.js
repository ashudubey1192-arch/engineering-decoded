import { useSyncExternalStore } from "react";
import { api, getSession } from "./api.js";
import {
  freshProgress,
  mergeProgress,
  progressEntries,
  progressFields,
  nextReview,
} from "./dsaLearningState.js";
const baseKey = "engineering-decoded:dsa-practice:v1";
const empty = freshProgress();
let snapshot = empty,
  loaded = false,
  timer,
  syncing = false,
  generation = 0,
  revision = 0;
const listeners = new Set();
const owner = () => getSession()?.user?.id || "guest";
const storageKey = (account) => (account === "guest" ? baseKey : `${baseKey}:${account}`);
function read(account) {
  const result = { ...freshProgress(), owner: account };
  try {
    const data = JSON.parse(window.localStorage.getItem(storageKey(account)) || "{}");
    for (const field of [...progressFields, "stamps"]) {
      const value = data?.[field];
      result[field] = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }
  } catch {
    result.storageAvailable = false;
  }
  return result;
}
function getSnapshot() {
  if (typeof window !== "undefined" && (!loaded || snapshot.owner !== owner())) {
    snapshot = read(owner());
    loaded = true;
    generation++;
    syncing = false;
  }
  return snapshot;
}
function publish(persist = true) {
  if (persist) {
    try {
      window.localStorage.setItem(storageKey(snapshot.owner), JSON.stringify(snapshot));
      snapshot.storageAvailable = true;
    } catch {
      snapshot.storageAvailable = false;
    }
  }
  listeners.forEach((notify) => notify());
}
function queueSync() {
  if (snapshot.owner === "guest") return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => syncDsaProgress(), 1200);
}
export async function syncDsaProgress() {
  getSnapshot();
  if (snapshot.owner === "guest" || syncing) return;
  syncing = true;
  const account = snapshot.owner,
    version = generation,
    startedRevision = revision;
  const valid = () => version === generation && owner() === account;
  const controller = new window.AbortController(),
    timeout = window.setTimeout(() => controller.abort(), 20000);
  const options = { signal: controller.signal };
  snapshot = { ...snapshot, syncStatus: "Syncing…" };
  publish(false);
  try {
    const entries = await api("/dsa/progress", options);
    if (!valid()) return;
    snapshot = mergeProgress(snapshot, entries);
    publish();
    const upload = progressEntries(snapshot);
    for (let i = 0; i < upload.length; i += 100) {
      const result = await api("/dsa/progress", {
        ...options,
        method: "PUT",
        body: JSON.stringify({ entries: upload.slice(i, i + 100) }),
      });
      if (!valid()) return;
      snapshot = mergeProgress(snapshot, result);
    }
    snapshot = {
      ...snapshot,
      syncStatus:
        revision === startedRevision ? "Synced to your account" : "Saving latest changes…",
    };
    publish();
  } catch {
    if (valid()) {
      snapshot = {
        ...snapshot,
        syncStatus: "Sync unavailable — changes kept on this device. Retry when connected.",
      };
      publish(false);
    }
  } finally {
    window.clearTimeout(timeout);
    if (valid()) {
      syncing = false;
      if (revision !== startedRevision) queueSync();
    }
  }
}
function subscribe(listener) {
  listeners.add(listener);
  const sessionChanged = () => {
    const before = snapshot.owner;
    getSnapshot();
    if (before !== snapshot.owner) {
      publish(false);
      queueSync();
    }
  };
  const storageChanged = (event) => {
    if (event.key === "engineering-decoded-session") {
      sessionChanged();
      return;
    }
    if (event.key === storageKey(owner()) || event.key === null) {
      snapshot = read(owner());
      publish(false);
    }
  };
  window.addEventListener("storage", storageChanged);
  window.addEventListener("ed-session", sessionChanged);
  window.addEventListener("online", syncDsaProgress);
  if (listeners.size === 1) queueSync();
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener("ed-session", sessionChanged);
    window.removeEventListener("online", syncDsaProgress);
  };
}
export function updateDsaProgress(field, id, value) {
  if (!progressFields.includes(field)) throw new Error("Unknown progress category");
  const current = getSnapshot(),
    stored = current.storageAvailable ? read(current.owner) : current;
  const latest = mergeProgress(current, progressEntries(stored)),
    key = `${field}:${id}`;
  snapshot = {
    ...latest,
    [field]: { ...latest[field], [id]: value },
    syncStatus: latest.owner === "guest" ? "Local only" : "Changes waiting to sync",
    stamps: { ...latest.stamps, [key]: Math.max(Date.now(), (latest.stamps[key] || 0) + 1) },
  };
  revision++;
  publish();
  queueSync();
}
export function recordDsaQuiz(id, correct) {
  const state = getSnapshot();
  updateDsaProgress("quizzes", id, {
    correct,
    attempts: (Number(state.quizzes[id]?.attempts) || 0) + 1,
  });
  updateDsaProgress("reviews", id, nextReview(state.reviews[id], correct));
}
export function importGuestProgress() {
  if (getSnapshot().owner === "guest" || snapshot.syncStatus !== "Synced to your account") return;
  const entries = progressEntries(read("guest")).filter(
    (entry) => !(entry.entryKey in snapshot[entry.category]),
  );
  for (const entry of entries)
    updateDsaProgress(entry.category, entry.entryKey, JSON.parse(entry.value));
}
export function useDsaProgress() {
  return useSyncExternalStore(subscribe, getSnapshot, () => empty);
}
export function dsaLessonKey(courseSlug, lessonSlug) {
  return `${courseSlug}/${lessonSlug}`;
}
