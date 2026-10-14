import { auth } from "./neonAuth.js";
let session = null;
let sessionVersion = 0;
export const getSession = () => session;
const notify = () => window.dispatchEvent(new window.Event("ed-session"));
export function setSession(value) {
  sessionVersion++;
  session = value;
  notify();
}
export function clearSession() {
  sessionVersion++;
  session = null;
  notify();
}
export function requireAuth() {
  if (!auth) throw new Error("Sign-in is not configured. Set VITE_NEON_AUTH_URL.");
  return auth;
}
export async function authResult(promise) {
  const result = await promise;
  if (result.error) throw new Error(result.error.message || "Authentication failed");
  return result.data;
}
export async function restoreSession() {
  if (!auth) return;
  const version = sessionVersion;
  const data = await authResult(auth.getSession());
  if (version !== sessionVersion) return;
  if (!data?.user) {
    clearSession();
    return;
  }
  const user = await api("/auth/me");
  if (version !== sessionVersion) return;
  setSession({ user });
}
export async function api(path, options = {}) {
  if (path === "/auth/logout") {
    sessionVersion++;
    await authResult(requireAuth().signOut());
    clearSession();
    return null;
  }
  const owner = session?.user?.id;
  const version = sessionVersion;
  const client = requireAuth();
  const current = await authResult(client.getSession());
  if (owner && current?.user?.id !== owner && path !== "/auth/me") {
    clearSession();
    throw new Error("Account changed. Please retry after signing in.");
  }
  // This SDK version shares its session cache with /token. Force the token
  // request so it cannot return a cached session object instead of a JWT.
  const tokenData = await authResult(
    client.token({ fetchOptions: { headers: { "X-Force-Fetch": "true" } } }),
  );
  const token = tokenData?.token;
  if (version !== sessionVersion) throw new Error("Account changed during request");
  if (!token) throw new Error("Sign in to continue");
  const response = await window.fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) clearSession();
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}
export const saveArticleProgress = (payload) =>
  getSession()
    ? api("/progress", { method: "PUT", body: JSON.stringify(payload) })
    : Promise.resolve(null);
