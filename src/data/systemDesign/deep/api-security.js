import { deep } from "../schema.js";

export default {
  "api-security--authentication-vs-authorization": deep({
    anim: ["Who are you, then may you do this", "u:User Asha | n:Authentication | z:Authorization | r:Invoice 77:owner Ravi, m:Invoice 12:owner Asha", [
      ["u>n", "password + code", "Authentication checks proof of identity. It answers one question: who is this?", "n=+user = Asha"],
      ["u>z", "GET /invoices/12", "Authorization takes the identity, the action and the **object**.", "z=check owner"],
      ["z>m", "owner = Asha", "Asha owns invoice 12, so access is allowed.", "m=+200 OK"],
      ["u>z", "GET /invoices/77", "Asha changes the id in the URL. She is still perfectly authenticated.", "z=check owner"],
      ["z>u", "403", "Ravi owns 77, so access is denied. Skipping this check is the most common API hole (broken object-level authorization).", "r=protected; u=~403"],
      ["u>n", "expired token", "Later the token expires. Identity is unknown again, so the answer is 401 and no permission check even runs.", "n=!401"],
    ]],
    more: [
      ["Factors", "Something you know, have, or are. Passkeys combine device possession with a local gesture and resist phishing, because the key is bound to the site's domain."],
      ["Authorization models", "RBAC by role, ABAC by attributes (department, time, amount), ReBAC by relationship (editor of the folder that contains this file)."],
      ["Deny by default", "Start from no access, grant explicitly, and centralise the decision so that every endpoint uses the same code. Log denials; they reveal probing."],
    ],
    use: "Every endpoint: identify the caller first, then check this caller against this object and action.",
    avoid: "Relying on hidden buttons or unguessable ids in place of a server-side check.",
    answer: "403: identity was known (logged in) but the role does not permit admin data. 401: the expired token means identity cannot be established, so the caller must authenticate again before permission is even considered.",
    qa: [
      ["What is broken object-level authorization?", "The API checks that the user is logged in but not that the requested object belongs to them, so changing an id reveals other people's data. Fix by checking ownership on every object access."],
      ["Where should authorization be enforced in microservices?", "Coarse checks at the gateway, object-level checks in the owning service. Policies can be central (a policy engine) while decisions happen locally."],
    ],
  }),
  "api-security--session-vs-token-based-auth": deep({
    anim: ["Logout with a session and with a token", "u:Browser | a:API server | s:Session store:empty, k:Public key", [
      ["u>a", "login", "With **sessions** the server creates a record and gives the browser a random id in a cookie.", "s=sid 5f = Asha"],
      ["u>a", "cookie sid 5f", "Each request sends only the id.", "a=lookup"],
      ["a>s", "who is 5f?", "The server asks the store every time: one extra lookup, but the answer is always current.", "a=+Asha"],
      ["a>s", "logout", "Logout deletes the record. The very next request is refused.", "s=+5f deleted"],
      ["u>a", "signed token", "With **tokens** the identity travels in the token itself.", "a=verify"],
      ["a>k", "check signature", "Any server verifies it locally with a public key and no lookup. It scales easily across regions.", "a=+no lookup"],
      ["u>a", "after logout", "But a token stays valid until it expires. Keep it short (5-15 min), plus a refresh token you **can** revoke.", "a=~valid 10 min"],
    ]],
    more: [
      ["Storage in browsers", "Prefer HttpOnly, Secure, SameSite cookies. Tokens in localStorage can be read by any injected script."],
      ["CSRF and XSS", "Cookies are sent automatically, so they need CSRF protection. Bearer headers do not, but stolen tokens can be replayed elsewhere."],
      ["Hybrid", "A backend-for-frontend keeps tokens server-side and gives the browser only a session cookie, combining revocation with token-based APIs behind it."],
    ],
    use: "Sessions for web apps under one domain; tokens for mobile, third parties and many services.",
    avoid: "Long-lived tokens without revocation, or large claims that go stale.",
    answer: "Tokens fit better: 30 stateless servers can verify a signature locally and a mobile app has no natural cookie session. You give up instant revocation (and current data): a token stays valid until expiry unless you add a denylist or short lifetimes with refresh tokens.",
    qa: [
      ["How does refresh token rotation help?", "Each refresh returns a new refresh token and invalidates the old one. If a stolen old token is used, the server detects reuse and revokes the whole family."],
      ["Do sessions prevent horizontal scaling?", "Not if stored in a shared store. Only sessions in local memory do, because they tie a user to one server."],
    ],
  }),
  "api-security--jwt": deep({
    anim: ["Why editing a JWT does not work", "u:User | i:Issuer:private key | a:API:public key | x:Attacker", [
      ["u>i", "login", "The issuer creates header and payload: `role: user`, expiry in 10 minutes.", "i=payload ready"],
      ["i>u", "signed JWT", "It signs `header.payload` with its private key and appends the signature.", "u=+token"],
      ["u>a", "Bearer token", "The API recomputes the check with the public key, then verifies issuer, audience and expiry.", "a=+role user"],
      ["x", "edit payload", "An attacker decodes the payload (it is only base64) and changes it to `role: admin`.", "x=role admin"],
      ["x>a", "edited token", "The signature was made for the old bytes and no longer matches. The attacker has no private key.", "a=!401 bad sig"],
      ["x>a", "alg none", "A classic trick: claim that no signature is used. The API accepts **only** algorithms it configured, so it fails.", "x=!rejected"],
    ]],
    more: [
      ["Claims to check", "`iss`, `aud`, `exp`, `nbf` and the key id. Skipping `aud` lets a token made for one service be used at another."],
      ["Key rotation", "Publish keys at a JWKS URL with ids. Add the new key, sign with it, and remove the old key only after its last token expires."],
      ["HS256 or RS256", "HS256 shares one secret, so every verifier can also forge. Use asymmetric signing when more than one party verifies."],
    ],
    use: "Short-lived access tokens checked by many services without a lookup.",
    avoid: "Sessions that need instant logout, sensitive data (it is readable), or big permission lists.",
    answer: "The signature: changing one character changes the signed bytes, and the attacker cannot produce a new signature without the private key. Instant logout is hard because verification uses no server state, so a valid token stays valid until `exp` unless you add a denylist.",
    qa: [
      ["How can you revoke a JWT early?", "Keep lifetimes short and revoke the refresh token; add a denylist of token ids until expiry; or keep a per-user token version and reject older ones. Each adds a lookup."],
      ["Is a JWT encrypted?", "A normal JWT (JWS) is signed, not encrypted; anyone can read it. JWE encrypts it. Do not put secrets in a JWS."],
    ],
  }),
  "api-security--oauth-oauth2": deep({
    anim: ["Authorization Code flow with PKCE", "u:User browser | app:Photo app | as:Auth server | api:Photos API", [
      ["app>u", "redirect + hash", "The app makes a random verifier, keeps it, and sends only its **hash** in the redirect.", "app=verifier kept"],
      ["u>as", "login + consent", "The user signs in at the auth server, not in the app, and approves `photos.read`.", "as=+consent"],
      ["as>u", "code C1", "The browser is redirected back with a short-lived, single-use code.", "u=code C1"],
      ["u>app", "code C1", "The code passes through the browser, where it might leak through logs or history.", "app=code C1"],
      ["app>as", "C1 + verifier", "Server to server, the app exchanges the code **plus the original verifier**. A thief with only the code fails.", "as=+hash matches"],
      ["as>app", "access token", "The token is delivered directly and never touches the address bar.", "app=+token 10 min"],
      ["app>api", "Bearer token", "The API checks scope `photos.read`. A delete attempt would get 403.", "api=+photos"],
    ]],
    more: [
      ["OAuth is not login", "OAuth delegates access. OpenID Connect adds an ID token that says who signed in. Using a plain access token as proof of identity is a known mistake."],
      ["Grants to use today", "Authorization Code + PKCE for users, Client Credentials for services, Device Code for TVs. Implicit and password grants are obsolete."],
      ["Protect the redirect", "Register exact redirect URIs, use `state` against CSRF and `nonce` against replay. An open redirect turns into token theft."],
    ],
    use: "Letting an app act on a user's data in another system with limited, revocable scope.",
    avoid: "First-party single apps with one backend, where a session is simpler.",
    answer: "The browser redirect is exposed (history, logs, extensions), so only a short single-use code goes there, and the token travels on a direct TLS call where the app can authenticate. PKCE ties the code to the client that started the flow: a stolen code is useless without the secret verifier.",
    qa: [
      ["What is the difference between scope and permission?", "A scope limits what the app may ask on the user's behalf. The API must still check the user's own permission on the object: the effective right is the intersection."],
      ["How does a service call another with no user?", "Client Credentials: it authenticates as itself and gets a token with its own scopes. Prefer workload identity or mTLS over long-lived secrets."],
    ],
  }),
  "api-security--single-sign-on-sso": deep({
    anim: ["One login, two applications", "u:Browser | w:Wiki app, m:Mail app | idp:Identity provider", [
      ["u>w", "open wiki", "Asha opens the wiki without a session.", "w=no session"],
      ["w>idp", "redirect", "The wiki sends the browser to the identity provider with its own client id.", "idp=ask login"],
      ["u>idp", "password + MFA", "She signs in once. The provider sets **its own** session cookie.", "idp=+session"],
      ["idp>w", "signed assertion", "The provider returns a signed statement: this is Asha, for the wiki, valid 5 minutes.", "w=+logged in"],
      ["u>m", "open mail", "Later she opens mail, which also redirects to the provider.", "m=no session"],
      ["idp>m", "no prompt", "The provider still has her session, so it answers immediately. No password is typed.", "m=+logged in"],
    ]],
    more: [
      ["SAML or OpenID Connect", "SAML is XML based and common in enterprises. OIDC is JSON over OAuth, better for mobile and single-page apps. Both deliver a signed identity."],
      ["Provisioning", "SSO logs people in; SCIM creates and disables accounts. Without it, a leaver may keep a local account or API token."],
      ["Single logout is hard", "Ending the provider session does not end each app's session. Use short app sessions or back-channel logout."],
    ],
    use: "Companies with many apps that want one policy for MFA, joiners and leavers.",
    avoid: "Making everything depend on one provider without an emergency access plan.",
    answer: "The app receives a signed assertion or ID token from the identity provider. It trusts it by verifying the signature with the provider's published key and checking issuer, audience and expiry. Risk: if the provider is down or compromised, every connected app is affected.",
    qa: [
      ["How do you prepare for an identity provider outage?", "Break-glass accounts with strong factors kept offline, sensible session lengths so active users continue, multi-region provider setup, and rehearsed access to critical consoles."],
      ["What is the difference between SSO and a password manager?", "A password manager stores separate credentials for each app. SSO removes per-app credentials and lets a central party decide and revoke access."],
    ],
  }),
};
