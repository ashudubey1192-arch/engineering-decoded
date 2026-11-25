import { deep } from "../schema.js";

export default {
  "advanced-security--ssl-tls": deep({
    anim: ["A TLS 1.3 handshake in one round trip", "c:Browser | n:Network | s:Server:certificate | a:Attacker", [
      ["c>s", "hello + key share", "The browser sends supported ciphers and its half of a Diffie-Hellman key.", "s=has both halves"],
      ["s", "derive key", "The server combines both halves to a shared secret. The secret itself never travels.", "s=+session key"],
      ["s>c", "key share + cert", "It returns its half, its certificate and a **signature** over the handshake, already encrypted.", "c=verifying"],
      ["c", "check chain", "The browser checks name, expiry, trusted issuer and signature. Then it derives the same key.", "c=+session key"],
      ["c>s", "GET / (AES)", "Data now uses fast symmetric encryption with integrity.", "s=+encrypted data"],
      ["a>n", "record all", "An attacker records everything and steals the server's private key next year. Useless: the session keys were temporary (**forward secrecy**).", "a=!cannot decrypt; n=recorded"],
    ]],
    more: [
      ["Three promises", "Confidentiality (nobody reads), integrity (nobody changes), authentication (it is really this domain). It does not promise that the site is honest."],
      ["Certificates in practice", "Automate renewal, monitor expiry, include the full chain, use short lifetimes. Expired certificates remain a top cause of outages."],
      ["Resumption and 0-RTT", "Returning clients can skip a round trip. 0-RTT data can be replayed by an attacker, so allow it only for safe, idempotent requests."],
    ],
    use: "All traffic, inside and outside the network.",
    avoid: "Old versions (below 1.2), custom crypto, and disabling certificate checks 'for testing'.",
    answer: "Asymmetric operations are hundreds to thousands of times slower and limited to small data, but they allow two strangers to agree on a secret and prove identity. Symmetric ciphers are extremely fast, so once the key is shared they protect the bulk data.",
    qa: [
      ["What is forward secrecy?", "Session keys come from temporary Diffie-Hellman values that are thrown away, so stealing the long-term key later cannot decrypt recorded traffic."],
      ["What is mutual TLS?", "Both sides present certificates. It authenticates services to each other, with short-lived certificates issued automatically to workloads."],
    ],
  }),
  "advanced-security--encryption-at-rest": deep({
    anim: ["Envelope encryption and a stolen disk", "a:App | k:KMS:master key M | d:Data key | s:Disk:empty | t:Thief", [
      ["a>k", "new data key", "The app asks the key service for a data key.", "k=M never leaves"],
      ["k>d", "plain + wrapped", "It returns the key twice: in plain, and **encrypted by the master key** (wrapped).", "d=plain + wrapped"],
      ["a>s", "data + wrapped key", "The app encrypts the data, stores it with the wrapped key and forgets the plain key.", "s=ciphertext; d=wrapped only"],
      ["t>s", "steals disk", "A thief takes the disk: ciphertext and a wrapped key.", "t=!ciphertext only"],
      ["t>k", "unwrap?", "Without permission at the key service the key cannot be unwrapped. Had the key been stored beside the data, all would be lost.", "k=+denied + logged"],
      ["a>k", "unwrap", "The app has permission: unwrap, decrypt, read. Each use is logged.", "a=+reads data"],
    ]],
    more: [
      ["Levels", "Disk (lost hardware), database or file (stolen backups), field (curious administrators, injection). Each protects against a different thief."],
      ["Rotation", "Rotate the master key by re-wrapping data keys: no need to re-encrypt terabytes. Rotate data keys gradually when data is rewritten."],
      ["Crypto-shredding", "One key per customer: deleting the key makes all copies, including backups, unreadable."],
    ],
    use: "All stored personal, financial or confidential data, including backups and logs.",
    avoid: "Believing that it stops an attacker who controls the running app: the app can decrypt.",
    answer: "If the key lies beside the data, whoever steals the disk or backup also gets the key and encryption is useless. Keeping keys in a separate service requires a second, audited permission that can be revoked.",
    qa: [
      ["How do you search encrypted fields?", "Store a keyed hash (blind index) for exact match, use deterministic encryption with care because equal values show, or limit search to a protected service."],
      ["What is envelope encryption good for?", "Bulk data is encrypted locally with fast data keys, while the master key stays in the key service. Rotation and access control happen on the small wrapped keys."],
    ],
  }),
  "advanced-security--secrets-management": deep({
    anim: ["Rotating a database password without downtime", "v:Secret manager:pw v1 | a1:Service A, a2:Service B | d:Database:user1 | o:Rotator", [
      ["a1>v", "get db secret", "Each service proves its identity (workload identity) and gets the password at run time.", "a1=pw v1; a2=pw v1"],
      ["a1>d", "login v1", "Nothing is in code, images or environment files.", "d=user1 v1"],
      ["o>d", "create user2", "Rotation: the rotator creates a **second** user with a new password.", "d=user1 + user2"],
      ["o>v", "store v2", "The new secret becomes the current version.", "v=pw v2"],
      ["v>a1,a2", "refresh", "Services refresh and reconnect with v2, at their own pace.", "a1=+pw v2; a2=+pw v2"],
      ["o>d", "drop user1", "When nobody uses user1 it is removed. With hardcoded passwords this would have needed a release of every service at once.", "d=+user2 only"],
    ]],
    more: [
      ["Best secret: none", "Workload identity and short-lived tokens remove stored secrets. Dynamic credentials created per service and valid for an hour are the next best."],
      ["Secret zero", "Something must authenticate to the manager. Use the platform's identity (instance or pod identity) and not another stored secret."],
      ["Leak response", "Revoke first, then investigate. Scan repositories and images for secrets, and treat anything that was ever committed as public."],
    ],
    use: "Passwords, API keys, certificates, signing keys.",
    avoid: "Secrets in Git, container images, tickets, chat or logs.",
    answer: "Services fetch the secret at run time, so rotation is one change in the manager and they pick it up. Hardcoded secrets require finding every copy and changing, testing and redeploying every service at the same time.",
    qa: [
      ["Are environment variables safe for secrets?", "Better than code, but they leak through crash dumps, child processes and debug pages. Prefer mounted files in memory or direct fetch with short lifetimes."],
      ["What if the secret manager is down?", "Cache secrets in memory with a grace period, run it highly available, stagger renewals, and make sure that a restart storm does not need it all at once."],
    ],
  }),
  "advanced-security--password-management": deep({
    anim: ["Cracking a leaked table: fast hash and slow hash", "u:User:Sunny123 | s:Server:salt 7f | t1:SHA-256 table, t2:Argon2 table | x:Attacker", [
      ["u>s", "sign up", "The server creates a random **salt** for this user.", "s=salt 7f"],
      ["s>t1", "SHA-256", "Version 1 stores SHA-256(salt + password): computed in a microsecond.", "t1=fast hash"],
      ["x>t1", "10B guesses/s", "The table leaks. A graphics card tries ten billion guesses per second.", "t1=!cracked in 1 s"],
      ["s>t2", "Argon2id", "Version 2 uses a hash that needs 64 MB of memory and 200 ms **on purpose**.", "t2=slow hash"],
      ["x>t2", "~100 guesses/s", "The same card manages perhaps a few hundred per second, as memory is the limit.", "t2=+years to crack"],
      ["u>s", "login 200 ms", "A real user does not notice 200 ms. The salt makes equal passwords look different and precomputed tables useless.", "s=+ok"],
    ]],
    more: [
      ["Policy that works", "Length over complexity, check against known leaked passwords, no forced rotation, allow paste and managers, offer passkeys."],
      ["Pepper", "A secret key mixed in and kept outside the database (in a key service) makes a leaked table alone useless."],
      ["Login protection", "Limit attempts per account and per source, use generic error messages, add a second factor, and detect credential stuffing."],
    ],
    use: "Only if you must store passwords. An identity provider or passkeys are often better.",
    avoid: "Inventing schemes, plain or reversible storage, emailing passwords.",
    answer: "It is designed to be fast, so an attacker with a leaked table can try billions of guesses per second on cheap hardware. Password hashes must be deliberately slow and memory-hard (Argon2id, scrypt, bcrypt), with a unique salt per user.",
    qa: [
      ["How do you upgrade old hashes?", "At the next login you briefly know the password, so verify with the old hash and store the new one. For inactive users wrap the old hash inside the new one."],
      ["How should password reset work?", "A random single-use token with short expiry, stored hashed, sent to the verified address, the same response whether the account exists or not, and all sessions ended afterwards."],
    ],
  }),
  "advanced-security--rbac": deep({
    anim: ["Changing one role for 500 people", "u1:Asha, u2:Ravi + 499 | r:Role Support:view order | p:Policy check | o:Refund action", [
      ["u1>p", "refund order", "Asha works in Support. The role may only view orders.", "p=role Support"],
      ["p>r", "has refund?", "The policy looks at the **role's** permissions and not at the person.", "r=view order"],
      ["p>u1", "denied", "Support may not refund.", "u1=~403"],
      ["r", "add refund", "Management decides that Support may refund. One change on one role.", "r=view + refund"],
      ["u2>p", "refund", "All 500 people have the permission at once, without touching a single user.", "u2=+allowed; u1=+allowed"],
      ["p>o", "limit 100?", "May they refund any amount? That depends on an attribute (amount): RBAC alone cannot say it, so add a rule.", "o=~needs ABAC"],
    ]],
    more: [
      ["Role explosion", "Support-EU-Night-Senior... When roles multiply by attributes, use ABAC rules (region, amount, time) with a small set of roles."],
      ["Separation of duties", "Creating and approving a payment must be different roles, and nobody may hold both."],
      ["Review", "People change jobs and keep old roles. Review regularly, give time-limited elevation, and remove unused permissions based on logs."],
    ],
    use: "Permissions that follow job functions.",
    avoid: "Rules about individual objects, such as document sharing: use relationship-based control.",
    answer: "Users only refer to the role, and permissions are stored once at the role. Changing the role's permission set changes what the check returns for every holder at the next request.",
    qa: [
      ["RBAC, ABAC or ReBAC?", "RBAC: job functions. ABAC: conditions on attributes such as region and amount. ReBAC: relationships between users and objects such as editor of a folder. Real systems combine them."],
      ["How do you handle permission checks at scale?", "Cache decisions briefly, evaluate policies locally with replicated data, invalidate on change, and log each decision for audit."],
    ],
  }),
  "advanced-security--saml": deep({
    anim: ["Login to an app without giving it a password", "u:Browser | sp:HR app (SP) | idp:Company IdP", [
      ["u>sp", "open app", "The user opens the HR app and has no session.", "sp=no session"],
      ["sp>u", "AuthnRequest", "The app (service provider) redirects the browser to the company's identity provider.", "u=redirected"],
      ["u>idp", "password + MFA", "The user logs in **at the identity provider**. The app never sees this page.", "idp=+verified"],
      ["idp>u", "signed assertion", "The provider creates an XML assertion: subject, audience HR app, valid 5 minutes, and signs it.", "u=carries assertion"],
      ["u>sp", "POST assertion", "The browser delivers it to the app.", "sp=verifying"],
      ["sp", "check signature", "The app checks signature, audience, times, request id and that it was not used before. Then it creates its own session.", "sp=+logged in"],
    ]],
    more: [
      ["Trust setup", "Both sides exchange metadata: URLs and certificates. Certificate rollover is the classic outage: publish the new one in advance and accept both."],
      ["Dangerous details", "XML signature wrapping attacks, unsigned parts, missing audience checks. Use a maintained library, and process only the signed element."],
      ["SAML or OIDC", "SAML: browser-based enterprise SSO, XML. OIDC: JSON and OAuth, suits mobile and APIs. New projects usually choose OIDC and support SAML for customers who need it."],
    ],
    use: "Enterprise customers with existing SAML identity providers.",
    avoid: "Mobile apps and APIs, where OIDC fits better.",
    answer: "The user enters the password only at the identity provider. The application receives a signed assertion and verifies the signature with the provider's public certificate, so it trusts the statement and never handles the password.",
    qa: [
      ["What is IdP-initiated login and why is it riskier?", "The provider sends an assertion without a request from the app. There is no request id to match, so injection or replay of assertions is easier. Prefer SP-initiated."],
      ["How do you deprovision users with SAML?", "SAML only acts at login. Use SCIM or directory sync to disable accounts and end sessions and API tokens when someone leaves."],
    ],
  }),
};
