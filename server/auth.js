import { createRemoteJWKSet, jwtVerify } from "jose";
import { HttpError } from "./validation.js";
let jwks;
export async function authenticate(req) {
  const token = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || "")?.[1];
  if (!token) throw new HttpError(401, "Sign in to continue");
  const { NEON_AUTH_JWKS_URL, NEON_AUTH_ISSUER, NEON_AUTH_AUDIENCE } = process.env;
  if (!NEON_AUTH_JWKS_URL || !NEON_AUTH_ISSUER || !NEON_AUTH_AUDIENCE)
    throw new HttpError(503, "Authentication is not configured");
  jwks ||= createRemoteJWKSet(new URL(NEON_AUTH_JWKS_URL));
  return verifyIdentity(token, jwks, NEON_AUTH_ISSUER, NEON_AUTH_AUDIENCE);
}
export async function verifyIdentity(token, keys, issuer, audience) {
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer,
      audience,
      requiredClaims: ["sub", "exp", "iat"],
      algorithms: ["EdDSA", "RS256", "ES256"],
    });
    if (typeof payload.sub !== "string" || !payload.sub) throw new Error("Missing subject");
    return payload;
  } catch {
    throw new HttpError(401, "Session expired. Please sign in again.");
  }
}
