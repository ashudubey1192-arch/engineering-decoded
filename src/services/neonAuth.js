import { createAuthClient } from "@neondatabase/auth";
const authUrl = import.meta.env?.VITE_NEON_AUTH_URL;
export const auth = authUrl
  ? createAuthClient(authUrl, { fetchOptions: { credentials: "include" } })
  : null;
