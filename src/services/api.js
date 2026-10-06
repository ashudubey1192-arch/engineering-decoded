const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api";
const SESSION_KEY = "engineering-decoded-session";
export const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
};
const notifySession = () => {
  if (typeof window !== "undefined" && window.dispatchEvent)
    window.dispatchEvent(new window.Event("ed-session"));
};
export const setSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifySession();
};
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  notifySession();
};
export async function api(path, options = {}) {
  const session = getSession();
  let response = await window.fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...options.headers,
    },
  });
  const publicAuthRequest = [
    "/auth/login",
    "/auth/register",
    "/auth/google",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
  ].includes(path);
  if (response.status === 401 && session?.refreshToken && !publicAuthRequest) {
    if (getSession()?.user?.id !== session.user?.id)
      throw new Error("Account changed during request");
    const refreshed = await window.fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      signal: options.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    if (refreshed.ok) {
      const next = await refreshed.json();
      if (getSession()?.user?.id !== session.user?.id)
        throw new Error("Account changed during request");
      setSession(next);
      response = await window.fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${next.accessToken}`,
          ...options.headers,
        },
      });
    } else if (getSession()?.user?.id === session.user?.id) clearSession();
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}
export const saveArticleProgress = (payload) =>
  getSession()
    ? api("/progress", { method: "PUT", body: JSON.stringify(payload) })
    : Promise.resolve(null);
