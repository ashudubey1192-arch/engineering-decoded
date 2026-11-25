import { lesson } from "../schema.js";

export default {
  "api-security--api-keys-and-hmac-signatures": lesson({
    intro: "An API key says **who is calling**. An HMAC signature goes further: it proves that the caller knows a secret and that the request was **not changed or replayed**, without ever sending the secret.",
    scene: "A partner logs full request headers for debugging. The log file leaks, and with it the API key, which was sent in every request. With signed requests the log would contain only signatures that had expired five minutes later.",
    parts: [
      ["API keys", "A long random string that identifies a project or partner. Simple, but a bearer secret: whoever has it can use it. Give it scopes, rate limits, an owner and an expiry date."],
      ["Store keys like passwords", "Keep only a hash of the key and show it once at creation. Use a recognisable prefix (`shop_live_`) so leak scanners can find it."],
      ["How HMAC signing works", "Both sides share a secret. The client computes HMAC-SHA256 over a canonical text: method, path, query, time, nonce and body hash, and sends the result. The server computes it again and compares."],
      ["What it protects against", "Reading the request does not reveal the secret; changing any signed part breaks the signature; an old timestamp or a repeated nonce is refused."],
      ["HMAC or public key", "HMAC needs a shared secret on both sides. With asymmetric signatures the server stores only a public key, so a server leak does not allow forging."],
    ],
    anim: ["A signed request, a changed one and a replay", "c:Partner:secret S | a:API:secret S | n:Nonce store:empty | x:Attacker", [
      ["c", "HMAC(S, text)", "The partner builds the text `POST /pay, 10h00, nonce 7, body hash` and signs it with S.", "c=sig 4e9a"],
      ["c>a", "request + 4e9a", "Only the signature travels. The secret never leaves the partner.", "a=recomputing"],
      ["a>n", "nonce 7 new", "The API recomputes the same signature, checks the time (within 5 minutes) and stores the nonce.", "n=7; a=+accepted"],
      ["x>a", "amount 10 to 9000", "An attacker changes the body and keeps the signature.", "x=changed body"],
      ["a>x", "401 bad sig", "The body hash is different, so the signature no longer matches.", "x=!refused"],
      ["x>a", "exact copy", "Now the attacker replays the original request unchanged.", "x=replay"],
      ["a>n", "nonce 7 seen", "The signature is right, but nonce 7 was used before (and after 5 minutes the time is too old).", "x=!refused; n=+7 seen"],
    ]],
    example: [
      ["Issue", "Create key id `pk_81` and secret S; show S once, store it encrypted (HMAC needs the original)."],
      ["Canonical text", "Method, path, sorted query, timestamp, nonce and SHA-256 of the body, joined by new lines."],
      ["Sign", "`signature = HMAC_SHA256(S, text)`; send key id, timestamp, nonce and signature in headers."],
      ["Verify", "Look up S by key id, check the time within 300 seconds, recompute, compare in constant time, store the nonce for 10 minutes."],
      ["Rotate", "Allow two active secrets per partner; they switch when ready, then the old one is removed."],
    ],
    code: `import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const sha = (text) => createHash("sha256").update(text).digest("hex");
export const sign = (secret, { method, path, time, nonce, body }) =>
  createHmac("sha256", secret)
    .update([method, path, time, nonce, sha(body)].join("\\n"))
    .digest("hex");

export function verify(secret, request, signature, now = Date.now()) {
  if (Math.abs(now - request.time) > 300_000) return false;   // too old
  const expected = Buffer.from(sign(secret, request));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}`,
    use: "Server-to-server partners, webhooks, payment APIs, signed URLs.",
    avoid: "Browsers and mobile apps as holders of shared secrets: they can be extracted. Use OAuth there.",
    mistakes: [["Signing parsed data", "Re-serialising JSON changes spaces and order. Sign and verify the raw bytes."], ["Ordinary string compare", "It stops at the first difference and leaks timing. Use a constant-time compare."], ["Keys in URLs", "URLs land in logs, history and referrers. Use headers."]],
    check: "Your webhook receiver verifies the signature but does not check the timestamp or event id. Which attack still works?",
    answer: "Replay: an attacker who recorded a valid signed request can send it again at any time, and it verifies. Include a timestamp in the signed text and refuse old ones, and remember event ids or nonces.",
    qa: [["API key, HMAC or mutual TLS?", "Keys are simplest, HMAC adds integrity and replay protection at application level, mTLS authenticates the connection with certificates. Combine mTLS or TLS with signatures for high-value partners."], ["How do signed URLs work?", "The server signs path, expiry and allowed method. Anyone with the URL can use it until it expires, and changing any part invalidates it. Good for uploads and private downloads."]],
    take: "A key identifies, a signature proves. Sign the exact bytes, include time, and compare safely.",
  }),
};
