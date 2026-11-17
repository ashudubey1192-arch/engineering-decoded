// Frontend security lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const securityLessons = {
  "security--security-overview": fsd({
    intro:
      "Frontend security is about one uncomfortable fact: everything you ship to the browser is visible and changeable by the user, and the browser also runs content from other origins, extensions, and third-party scripts. Good frontend design limits what an attacker can inject, what injected code could reach, and what the server trusts from the client.",
    concepts: [
      "The browser is hostile territory for secrets and trust decisions. Any check done only in JavaScript can be bypassed with devtools, so authorization, pricing, and validation must also happen on the server. Client checks are for user experience.",
      "The same-origin policy is the browser's core boundary. Scripts from https://app.example.com cannot read responses or DOM from https://bank.example unless that origin opts in with CORS or postMessage. Most attacks try to run code inside your origin (XSS) or trick the browser into acting with your credentials from another origin (CSRF, clickjacking).",
      "Defense in depth stacks layers: output encoding and sanitization stop injection, Content Security Policy limits what injected code can do, cookie flags and token design limit what stolen access is worth, and dependency hygiene limits supply-chain risk.",
    ],
    code: `// A threat model checklist for a new feature, kept next to the design doc.
const threatModel = {
  feature: "Product reviews with rich text",
  assets: ["session cookie", "user profile data", "review content"],
  entryPoints: ["review editor", "review API", "third-party embed of reviews"],
  threats: {
    injection: "Stored XSS through review HTML",
    framing: "Reviews page framed by another site for clickjacking",
    forgery: "Cross-site POST creating reviews as the victim",
    supplyChain: "Rich-text editor package compromised",
  },
  mitigations: {
    injection: "Sanitize on save with an allowlist, render via sanitizer, strict CSP",
    framing: "frame-ancestors 'self'",
    forgery: "SameSite=Lax cookies + CSRF token on state-changing requests",
    supplyChain: "Lockfile, npm audit in CI, pinned versions, SRI for CDN assets",
  },
};`,
    walkthrough:
      "Writing the threat model as data forces the team to name assets worth protecting, every way input enters the system, and a concrete mitigation per threat. Reviews accept rich text, so stored XSS is the headline risk; the mitigation combines sanitization with CSP so a sanitizer bug does not become a full compromise.",
    flow: ["List assets and entry points", "Name each threat", "Layer mitigations"],
    mistake:
      "Hiding an API key or admin flag in frontend code and assuming obfuscation protects it. Bundles are public; anything in them should be treated as published.",
    exercise:
      "A teammate proposes hiding the Delete button for non-admins and calling it done. What is missing?",
    answer:
      "The server must check the user's role on the DELETE request itself. Hiding the button only improves the interface; anyone can send the request with devtools or curl.",
    deepDive: [
      {
        heading: "The main threat families covered in this module",
        points: [
          "Injection: XSS, server-side JavaScript injection, unsafe HTML from users or APIs.",
          "Cross-origin abuse: CSRF, clickjacking through iframes, misconfigured CORS.",
          "Transport and storage: missing HTTPS, tokens in localStorage, overly broad cookies.",
          "Supply chain: vulnerable or malicious npm packages and tampered CDN files.",
          "Server-reaching frontend features: SSRF through URL previews or image proxies.",
        ],
      },
    ],
    animation: {
      title: "Layers an attack must pass",
      nodes: [
        ["attacker", "Attacker", "crafted input"],
        ["validate", "Validation", "server rules"],
        ["encode", "Encoding", "safe rendering"],
        ["csp", "CSP", "script allowlist"],
        ["cookie", "Cookie flags", "HttpOnly, SameSite"],
      ],
      steps: [
        ["attacker", "validate", "payload", "An attacker submits a review containing a script payload."],
        ["validate", "encode", "slips by", "Suppose validation misses it; the content is stored."],
        ["encode", "csp", "escaped", "Output encoding renders the payload as text, so nothing executes."],
        ["csp", "cookie", "blocked", "Even if a bug lets markup through, CSP refuses to run the inline script."],
        ["cookie", "attacker", "nothing", "HttpOnly cookies stay unreadable to scripts, so there is no session to steal."],
      ],
    },
  }),

  "security--cross-site-scripting-xss": fsd({
    intro:
      "Cross-site scripting happens when attacker-controlled data is interpreted as code inside your page. Once a script runs in your origin it can read the DOM, call your APIs with the user's session, and rewrite the page. Preventing XSS is mostly about choosing safe sinks and treating every string as text unless you deliberately sanitize it.",
    concepts: [
      "Stored XSS saves the payload in your database, such as a comment, and attacks everyone who views it. Reflected XSS bounces the payload off a URL parameter into the response. DOM-based XSS never touches the server: client code reads location.hash or postMessage data and writes it into a dangerous sink.",
      "Sinks decide safety. textContent, setAttribute for safe attributes, and JSX text interpolation treat data as text. innerHTML, outerHTML, insertAdjacentHTML, document.write, eval, setTimeout with strings, and href or src with javascript: URLs interpret data as code.",
      "When you must render user HTML, sanitize with a maintained allowlist sanitizer such as DOMPurify immediately before insertion, and back it with a Content Security Policy and Trusted Types so a missed case is still contained.",
    ],
    code: `import DOMPurify from "dompurify";

// ✅ Text: React escapes interpolated strings automatically.
function Comment({ author, text }) {
  return <p><strong>{author}</strong>: {text}</p>;
}

// ✅ Rich text: sanitize right before rendering, with a narrow allowlist.
function RichReview({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href"],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ✅ URLs: only allow http(s) links from user data.
function SafeLink({ href, children }) {
  const url = new URL(href, window.location.origin);
  const safe = ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  return <a href={safe} rel="noopener noreferrer">{children}</a>;
}

// ❌ DOM XSS: never write URL data into innerHTML.
// document.querySelector("#greet").innerHTML = "Hi " + location.hash.slice(1);`,
    walkthrough:
      "Plain comments go through JSX text, which escapes angle brackets and quotes. Rich reviews go through DOMPurify with an allowlist so script tags, event handler attributes, and style tricks are removed. Links are parsed and restricted to http and https because a javascript: URL in an href executes on click even though React escapes the text. The commented-out line shows the classic DOM XSS bug.",
    flow: ["Find every untrusted source", "Route it to a text sink", "Sanitize only when HTML is required"],
    mistake:
      "Sanitizing once on input and then trusting the stored value forever. Data also arrives from imports, old records, and other services, and sanitizer rules improve over time. Sanitize or encode at output, in the context where the data is used.",
    exercise:
      'A search page shows "Results for <query>" by reading the q parameter and setting innerHTML. What payload proves the bug, and what is the one-line fix?',
    answer:
      'A URL such as ?q=<img src=x onerror=alert(1)> runs the handler when the image fails to load. Set textContent instead of innerHTML, or render {query} in JSX, so the browser shows the characters rather than parsing them.',
    deepDive: [
      {
        heading: "Encoding depends on context",
        points: [
          "HTML body: escape & < > \" '.",
          "HTML attribute: quote the attribute and escape quotes; never build event handler attributes from data.",
          "URL: encodeURIComponent for parameters and allowlist the scheme.",
          "JavaScript: never build code from strings; pass data via JSON in a data attribute or a script of type application/json.",
          "CSS: avoid injecting user values into style; if necessary, allowlist values.",
        ],
      },
      {
        heading: "Trusted Types",
        code: `// Enforced by: Content-Security-Policy: require-trusted-types-for 'script'
const policy = trustedTypes.createPolicy("sanitize", {
  createHTML: (input) => DOMPurify.sanitize(input),
});
element.innerHTML = policy.createHTML(userHtml); // raw strings now throw`,
      },
    ],
    animation: {
      title: "A stored XSS attempt, defused",
      nodes: [
        ["attacker", "Attacker", "posts comment"],
        ["api", "API + DB", "stores text"],
        ["render", "Render", "JSX text sink"],
        ["browser", "Victim browser", "reads comment"],
        ["csp", "CSP", "backstop"],
      ],
      steps: [
        ["attacker", "api", "<img onerror>", "The attacker posts a comment containing an image tag with an onerror handler."],
        ["api", "render", "raw string", "The API stores and returns the string; it is just data so far."],
        ["render", "browser", "escaped", "JSX renders it as text, so the browser shows the characters instead of an image."],
        ["browser", "csp", "if bypassed", "If some path used innerHTML, CSP without unsafe-inline still blocks the handler."],
        ["csp", "attacker", "report", "A CSP violation report alerts the team to the injection attempt."],
      ],
    },
  }),

  "security--iframe-protection": fsd({
    intro:
      "Iframes cut both ways. Other sites can frame your app invisibly and trick users into clicking real buttons, which is clickjacking. And your app may embed third-party content that should not be able to navigate your page, read your data, or open popups. Both directions have precise browser controls.",
    concepts: [
      "Clickjacking overlays your page in a transparent iframe under a decoy button. Prevent it by telling the browser who may frame you: Content-Security-Policy: frame-ancestors 'self' (modern) or X-Frame-Options: DENY or SAMEORIGIN (legacy).",
      "When you embed others, the sandbox attribute starts with almost no capabilities and lets you add back only what is needed, such as allow-scripts or allow-popups. Avoid combining allow-scripts with allow-same-origin for same-origin content, since that lets the frame remove its own sandbox.",
      "Cross-frame communication uses postMessage. Always specify the exact target origin when sending, and check event.origin and the message shape when receiving. Never use '*' for messages that contain data.",
    ],
    code: `<!-- Embedding a third-party video widget with minimum privileges -->
<iframe
  src="https://player.videos.example/embed/abc"
  title="Product demo video"
  sandbox="allow-scripts allow-presentation"
  allow="fullscreen; picture-in-picture"
  referrerpolicy="strict-origin-when-cross-origin"
  loading="lazy"
></iframe>

<script>
  // Receiving messages from the widget
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://player.videos.example") return;
    if (event.data?.type !== "video:ended") return;
    showNextVideoSuggestion();
  });
</script>

# Response header on YOUR pages so others cannot frame them
Content-Security-Policy: frame-ancestors 'self' https://partner.example`,
    walkthrough:
      "The embedded player can run its own scripts and go fullscreen, but cannot submit forms, open popups, or navigate the top window, because those sandbox tokens were not granted. Messages from it are accepted only from its exact origin and only with an expected type. Your own pages send frame-ancestors so only your origin and one named partner may embed them.",
    flow: ["Decide who may frame you", "Sandbox what you embed", "Verify every message origin"],
    mistake:
      "Relying on frame-busting JavaScript such as if (top !== self) top.location = self.location. Attackers can block it with the sandbox attribute on their iframe. Use the response header instead.",
    exercise:
      "Your payment confirmation page must be embeddable only inside your own checkout at https://shop.example. What header do you send?",
    answer:
      "Content-Security-Policy: frame-ancestors https://shop.example. Optionally add X-Frame-Options: SAMEORIGIN for very old browsers if the origins match; frame-ancestors takes precedence where supported.",
    deepDive: [
      {
        heading: "Useful sandbox tokens",
        points: [
          "allow-scripts: run JavaScript inside the frame.",
          "allow-forms: submit forms.",
          "allow-popups: window.open and target=_blank.",
          "allow-same-origin: keep the frame's real origin for cookies and storage.",
          "allow-top-navigation-by-user-activation: navigate the parent only after a click.",
        ],
      },
    ],
    animation: {
      title: "Clickjacking blocked by frame-ancestors",
      nodes: [
        ["evil", "Decoy site", "fake button"],
        ["browser", "Browser", "loads iframe"],
        ["app", "Your app", "sends header"],
        ["user", "User", "clicks decoy"],
      ],
      steps: [
        ["evil", "browser", "iframe", "The decoy page tries to load your settings page in an invisible iframe."],
        ["browser", "app", "request", "The browser requests your page as a framed document."],
        ["app", "browser", "frame-ancestors", "Your response says only 'self' may frame this page."],
        ["browser", "evil", "refused", "The browser refuses to render the frame, leaving an empty box."],
        ["user", "evil", "click", "The user's click lands on the decoy only, never on your real button."],
      ],
    },
  }),

  "security--security-headers": fsd({
    intro:
      "Security headers are instructions from the server that turn on browser protections for your pages. A handful of well-chosen headers block whole categories of attacks, from script injection to protocol downgrade to MIME confusion, without changing application code. They belong in your CDN or server configuration and in your design checklist.",
    concepts: [
      "Content-Security-Policy is the most powerful. It lists which sources may provide scripts, styles, images, frames, and connections. A strict policy using nonces or hashes stops injected inline scripts from running.",
      "Strict-Transport-Security forces HTTPS for your domain for a period, preventing downgrade and cookie theft on hostile networks. X-Content-Type-Options: nosniff stops the browser guessing content types, so an uploaded text file cannot run as script.",
      "Referrer-Policy controls how much of the URL leaks to other sites, Permissions-Policy turns off powerful features you do not use, and Cross-Origin-Opener-Policy isolates your window from cross-origin popups.",
    ],
    code: `// Express middleware setting a strong baseline (helmet can do this too)
import crypto from "node:crypto";

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.nonce = nonce; // templates add nonce="..." to their script tags

  res.set({
    "Content-Security-Policy": [
      "default-src 'self'",
      \`script-src 'self' 'nonce-\${nonce}' 'strict-dynamic'\`,
      "style-src 'self'",
      "img-src 'self' https://images.cdn.example data:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "object-src 'none'",
      "report-to csp",
    ].join("; "),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  });
  next();
});`,
    walkthrough:
      "Each response gets a fresh nonce, and only script tags carrying it may run, so injected scripts are blocked. strict-dynamic lets those trusted scripts load their own dependencies. HSTS pins HTTPS for two years, nosniff prevents MIME confusion, the referrer policy sends only the origin cross-site, and Permissions-Policy disables hardware features the app never uses.",
    flow: ["Start in report-only", "Fix violations", "Enforce and monitor"],
    mistake:
      "Turning on an enforcing CSP in one go on a large existing app. Inline scripts, analytics snippets, and third-party widgets break in production. Ship Content-Security-Policy-Report-Only first, collect reports, fix or allow the legitimate sources, then enforce.",
    exercise:
      "Your CSP allows script-src 'self' https://cdn.jsdelivr.net. Why is that weaker than it looks?",
    answer:
      "Anyone can publish a package to that public CDN, so an attacker who finds an injection point can load their own script from an allowed host. Prefer nonces or hashes with strict-dynamic, or self-host the files.",
    deepDive: [
      {
        heading: "Checking your headers",
        points: [
          "Inspect a response in the Network panel or with curl -I.",
          "Use securityheaders-style scanners or Lighthouse in CI to catch regressions.",
          "Collect CSP reports through the Reporting API and alert on spikes, which often reveal attacks or broken deploys.",
        ],
      },
    ],
    animation: {
      title: "Headers switching on protections",
      nodes: [
        ["server", "Server", "adds headers"],
        ["browser", "Browser", "reads policy"],
        ["csp", "CSP", "nonce check"],
        ["hsts", "HSTS", "HTTPS only"],
        ["reports", "Reports", "violations"],
      ],
      steps: [
        ["server", "browser", "headers", "The HTML response carries CSP, HSTS, nosniff, and other policy headers."],
        ["browser", "hsts", "remember", "HSTS is cached so future http:// visits upgrade before any request leaves."],
        ["browser", "csp", "script?", "Before each script runs, the browser checks the source and nonce against CSP."],
        ["csp", "browser", "allow", "Scripts with the right nonce run normally."],
        ["csp", "reports", "violation", "An injected script without a nonce is blocked and reported."],
      ],
    },
  }),

  "security--client-side-storage-security": fsd({
    intro:
      "Where you keep tokens and personal data in the browser decides what an attacker gets after a single XSS bug or a shared computer. localStorage, sessionStorage, IndexedDB, and cookies differ in who can read them, when they are sent, and how long they live. Choose storage by threat, not by convenience.",
    concepts: [
      "Any script in your origin can read localStorage, sessionStorage, and IndexedDB. A token stored there is stolen by any successful XSS, including through a compromised third-party script.",
      "HttpOnly cookies cannot be read by JavaScript at all. With Secure (HTTPS only) and SameSite=Lax or Strict, they are the safest place for session identifiers, although they must be paired with CSRF protection for state-changing requests.",
      "Minimize what you store. Do not cache sensitive personal data offline unless needed, clear storage on logout, and give long-lived data an expiry. Storage is not encrypted against someone with access to the device.",
    ],
    code: `// Server sets the session cookie: invisible to JavaScript
Set-Cookie: __Host-session=9f8c…; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=3600

// Client: keep the short-lived access token in memory only
let accessToken = null;

export async function authFetch(input, init = {}) {
  if (!accessToken) accessToken = await refreshAccessToken();
  const response = await fetch(input, {
    ...init,
    headers: { ...init.headers, Authorization: \`Bearer \${accessToken}\` },
  });
  if (response.status === 401) {
    accessToken = await refreshAccessToken(); // refresh cookie is HttpOnly
    return fetch(input, { ...init, headers: { ...init.headers, Authorization: \`Bearer \${accessToken}\` } });
  }
  return response;
}

async function refreshAccessToken() {
  const r = await fetch("/auth/refresh", { method: "POST", credentials: "include" });
  if (!r.ok) throw new Error("signed out");
  return (await r.json()).accessToken;
}

export function logout() {
  accessToken = null;
  localStorage.removeItem("draft-cart");
  return fetch("/auth/logout", { method: "POST", credentials: "include" });
}`,
    walkthrough:
      "The refresh credential lives in an HttpOnly, Secure, SameSite cookie with the __Host- prefix, which also forbids a Domain attribute. The short-lived access token lives in a JavaScript variable, so it disappears on reload and is never written to storage. An XSS bug could still make requests while the page is open, but it cannot exfiltrate a long-lived credential.",
    flow: ["Classify the data", "Pick the narrowest storage", "Expire and clear it"],
    mistake:
      "Storing a JWT with a 30-day expiry in localStorage. One XSS bug, or one malicious npm dependency, sends it to an attacker who can then use it from anywhere for a month.",
    exercise:
      "Which storage would you use for: a UI theme preference, a refresh token, and an unsent message draft?",
    answer:
      "Theme: localStorage, since it is harmless. Refresh token: HttpOnly Secure SameSite cookie. Draft: sessionStorage or IndexedDB depending on size and whether it should survive the tab closing, cleared on send and on logout.",
    deepDive: [
      {
        heading: "Cookie prefixes",
        points: [
          "__Secure-: the cookie must be set with Secure from an HTTPS page.",
          "__Host-: Secure, Path=/, and no Domain attribute, so subdomains cannot set or overwrite it.",
        ],
      },
    ],
    animation: {
      title: "What an XSS bug can reach",
      nodes: [
        ["xss", "Injected script", "runs in origin"],
        ["local", "localStorage", "JWT stored"],
        ["memory", "Memory token", "5 min expiry"],
        ["cookie", "HttpOnly cookie", "refresh token"],
        ["attacker", "Attacker server", "exfiltration"],
      ],
      steps: [
        ["xss", "local", "read", "The injected script reads localStorage and finds a long-lived JWT."],
        ["local", "attacker", "steal", "It sends the JWT away; the attacker can now use it for weeks."],
        ["xss", "memory", "limited", "A token kept in memory expires in minutes and is gone on reload."],
        ["xss", "cookie", "denied", "document.cookie does not expose HttpOnly cookies, so the refresh token stays put."],
        ["cookie", "attacker", "no access", "Without the cookie the attacker cannot mint new tokens from elsewhere."],
      ],
    },
  }),

  "security--secure-communication-with-https": fsd({
    intro:
      "HTTPS wraps HTTP in TLS so traffic is encrypted, tamper-evident, and sent to the server you intended. Without it, anyone on the network path, such as public Wi-Fi or a compromised router, can read passwords, inject scripts into your pages, or steal cookies. Modern browser features such as service workers and geolocation require it.",
    concepts: [
      "TLS gives three guarantees: confidentiality through encryption, integrity through message authentication, and authenticity through the server's certificate chain, which the browser validates against trusted certificate authorities.",
      "The TLS 1.3 handshake agrees on keys in one round trip using ephemeral Diffie-Hellman, giving forward secrecy: recorded traffic stays safe even if the server's private key leaks later.",
      "Mixed content, an HTTPS page loading HTTP scripts or iframes, is blocked because it would let an attacker inject code. Redirect HTTP to HTTPS, send HSTS, and use upgrade-insecure-requests while migrating old links.",
    ],
    code: `# nginx: redirect everything to HTTPS and serve modern TLS only
server {
  listen 80;
  server_name shop.example;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl;
  http2 on;
  server_name shop.example;

  ssl_certificate     /etc/letsencrypt/live/shop.example/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/shop.example/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;

  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
  add_header Content-Security-Policy "upgrade-insecure-requests" always;
}`,
    walkthrough:
      "Port 80 only redirects, so no page is ever served in plain text. Port 443 serves HTTP/2 over TLS 1.2 or 1.3 with an automatically renewed certificate. HSTS tells browsers to skip HTTP entirely in future visits, and upgrade-insecure-requests rewrites any lingering http:// subresource URLs to https:// during migration.",
    flow: ["Redirect HTTP", "Serve TLS 1.2+", "Pin with HSTS"],
    mistake:
      "Setting HSTS with includeSubDomains and preload before every subdomain supports HTTPS. Internal or legacy subdomains become unreachable for months, and preload list removal is slow.",
    exercise:
      "A user on café Wi-Fi types shop.example without https for the first time. Even with HSTS configured, what is the remaining risk and how does preloading address it?",
    answer:
      "The very first request goes over HTTP before the browser has seen the HSTS header, so an attacker could intercept it and strip the redirect. HSTS preloading ships your domain in the browser's built-in list so even the first visit uses HTTPS.",
    deepDive: [
      {
        heading: "Certificates in practice",
        points: [
          "Automate issuance and renewal (ACME, for example Let's Encrypt) and alert well before expiry.",
          "Serve the full chain so all clients can validate it.",
          "Certificate Transparency logs let you monitor for certificates issued for your domains by mistake or by attackers.",
        ],
      },
    ],
    animation: {
      title: "A TLS 1.3 connection",
      nodes: [
        ["browser", "Browser", "ClientHello"],
        ["server", "Server", "certificate"],
        ["ca", "Trust store", "root CAs"],
        ["channel", "Encrypted HTTP", "keys agreed"],
      ],
      steps: [
        ["browser", "server", "hello + key", "The browser sends supported ciphers and its key share."],
        ["server", "browser", "cert + key", "The server answers with its key share and a signed certificate chain."],
        ["browser", "ca", "verify", "The browser checks the chain against trusted roots and the hostname."],
        ["ca", "channel", "trusted", "Both sides derive the same session keys; nothing secret crossed the wire."],
        ["channel", "server", "GET /", "HTTP requests now travel encrypted and integrity-protected."],
      ],
    },
  }),

  "security--dependency-security": fsd({
    intro:
      "A typical frontend ships hundreds of npm packages you did not write. Each one runs with the same privileges as your own code in the browser, and many run install scripts on developer machines and CI. Dependency security means knowing what you ship, keeping it patched, and limiting the damage one bad package can do.",
    concepts: [
      "Known vulnerabilities are tracked as advisories. npm audit, Dependabot, Renovate, and similar tools match your lockfile against them. Prioritize by reachability: a vulnerable function you never call is lower risk than one that parses user input.",
      "Malicious packages are a different threat: typosquats such as reakt, hijacked maintainer accounts, and dependency confusion where a public package shadows a private name. Lockfiles, scoped private registries, and reviewing new dependencies reduce the risk.",
      "Fewer, well-maintained dependencies are the strongest control. Before adding a package, check its size, maintenance, downloads, and transitive dependencies; a ten-line utility is often better written yourself.",
    ],
    code: `# CI pipeline steps for dependency hygiene (GitHub Actions style)
- name: Install exactly what the lockfile says
  run: npm ci --ignore-scripts        # no install scripts from transitive packages

- name: Fail on high severity advisories in production dependencies
  run: npm audit --omit=dev --audit-level=high

- name: Verify registry signatures and provenance
  run: npm audit signatures

# .npmrc: keep private package names on the private registry
@shop:registry=https://npm.internal.shop.example/

# renovate.json: small, frequent, reviewable updates
{
  "extends": ["config:recommended"],
  "minimumReleaseAge": "3 days",
  "packageRules": [{ "matchUpdateTypes": ["patch"], "automerge": true }]
}`,
    walkthrough:
      "npm ci installs the exact lockfile tree and fails if package.json and the lockfile disagree. Skipping install scripts blocks a common malware vector. The audit gate fails the build only for high-severity issues in shipped code, keeping noise low. Scoped registries prevent dependency confusion, and waiting a few days before adopting new releases lets the community catch hijacked versions.",
    flow: ["Lock exact versions", "Scan continuously", "Update in small steps"],
    mistake:
      "Running npm install in CI. It may resolve newer versions than the ones you tested, so builds stop being reproducible and a freshly compromised release can slip in.",
    exercise:
      "npm audit reports a critical issue in a package used only by your test runner. Should it block the production deploy?",
    answer:
      "Usually not the deploy itself, because dev dependencies are not shipped to users, which is why the gate uses --omit=dev. It still matters for developer machines and CI secrets, so fix it promptly through a normal update.",
    deepDive: [
      {
        heading: "Third-party scripts are dependencies too",
        paragraphs: [
          "Analytics, chat widgets, and A/B testing snippets loaded from vendor domains can change at any moment without a code review. Load as few as possible, isolate them in sandboxed iframes where you can, restrict them with CSP, and use Subresource Integrity for any static file you load from a CDN.",
        ],
      },
    ],
    animation: {
      title: "A compromised release stopped in CI",
      nodes: [
        ["registry", "npm registry", "new release"],
        ["bot", "Renovate", "waits 3 days"],
        ["ci", "CI", "npm ci + audit"],
        ["review", "Code review", "lockfile diff"],
        ["prod", "Production", "bundle"],
      ],
      steps: [
        ["registry", "bot", "v2.3.1", "A hijacked maintainer account publishes a malicious patch release."],
        ["bot", "registry", "wait", "The update bot waits for the minimum release age before proposing it."],
        ["registry", "ci", "advisory", "During the wait, an advisory is published and the audit step now fails."],
        ["ci", "review", "blocked", "The pull request is red, and the lockfile diff shows exactly what changed."],
        ["review", "prod", "safe build", "Production keeps shipping the previously locked, known-good version."],
      ],
    },
  }),

  "security--compliance-and-regulation": fsd({
    intro:
      "Privacy and accessibility laws shape frontend architecture directly. Regulations such as the GDPR in Europe, CCPA and CPRA in California, India's DPDP Act, HIPAA for US health data, and PCI DSS for card data decide what you may collect, when you may set cookies or load trackers, and how users exercise their rights. Engineering for compliance is mostly engineering for data minimization and consent.",
    concepts: [
      "Consent gates processing. Under GDPR-style rules, non-essential cookies and trackers must not load until the user agrees, the choice must be as easy to refuse as to accept, and it must be recorded and revocable.",
      "Data minimization and purpose limitation mean collecting only what a feature needs, keeping it only as long as necessary, and not reusing it silently. Frontends often leak data through analytics events, URLs, and error logs.",
      "Card data under PCI DSS should never touch your servers or your JavaScript if you can avoid it. Hosted payment fields in a provider's iframe keep your scope small, which is a design decision, not a paperwork task.",
    ],
    code: `// Load analytics only after explicit consent, and remember the choice.
const CONSENT_KEY = "consent.v2";

export function getConsent() {
  try { return JSON.parse(localStorage.getItem(CONSENT_KEY)) ?? null; } catch { return null; }
}

export function saveConsent(choice) {
  const record = { ...choice, decidedAt: new Date().toISOString(), version: 2 };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
  navigator.sendBeacon("/api/consent-log", JSON.stringify(record)); // proof of consent
  applyConsent(record);
}

function applyConsent({ analytics, marketing }) {
  if (analytics) import("./analytics.js").then((m) => m.start({ anonymizeIp: true }));
  if (marketing) loadScript("https://ads.example/pixel.js");
}

// Scrub personal data before it leaves the browser in logs or events
export const scrub = (event) => ({
  ...event,
  url: event.url.replace(/([?&](email|phone|token)=)[^&]+/g, "$1[redacted]"),
});

const existing = getConsent();
existing ? applyConsent(existing) : showConsentBanner({ onSave: saveConsent });`,
    walkthrough:
      "Nothing optional loads until a choice exists. Analytics is dynamically imported only when consented, marketing pixels likewise. The choice is versioned so a new policy can prompt again, logged server side as evidence, and personal data is scrubbed from URLs before any event or error report is sent.",
    flow: ["Ask before tracking", "Collect the minimum", "Honor rights and retention"],
    mistake:
      "Loading the tag manager in the page head and then showing a consent banner. The trackers have already fired and set cookies before the user could say no.",
    exercise:
      "Product wants session replay recordings to debug checkout. What frontend controls would you insist on before shipping it?",
    answer:
      "Load it only after consent, mask all input fields and personal text by default, exclude payment fields entirely, sample a small share of sessions, set a short retention period, and document the purpose in the privacy notice.",
    deepDive: [
      {
        heading: "User rights you may need to build UI for",
        points: [
          "Access and export: download my data.",
          "Rectification: edit my profile.",
          "Erasure: delete my account, including backups after a retention window.",
          "Objection and withdrawal: change consent as easily as it was given.",
        ],
      },
    ],
    animation: {
      title: "Consent-gated tracking",
      nodes: [
        ["page", "Page load", "no trackers"],
        ["banner", "Consent UI", "accept / reject"],
        ["log", "Consent log", "proof"],
        ["analytics", "Analytics", "loaded lazily"],
      ],
      steps: [
        ["page", "banner", "ask", "The page renders with only essential cookies and shows the consent choice."],
        ["banner", "log", "record", "The user's decision is stored with a version and timestamp."],
        ["log", "analytics", "if yes", "Only an explicit yes triggers the analytics import."],
        ["banner", "page", "if no", "A no leaves the page untouched and nothing extra loads."],
        ["analytics", "banner", "withdraw", "A settings link reopens the choice so consent can be withdrawn later."],
      ],
    },
  }),

  "security--input-validation-and-sanitization": fsd({
    intro:
      "Validation decides whether input is acceptable; sanitization transforms input so it is safe for a particular use. Frontends validate for fast feedback and good UX, and servers validate again because the client can be bypassed. Both should use allowlists of what is expected rather than blocklists of what looks bad.",
    concepts: [
      "Validate structure at the boundary with a schema: types, lengths, formats, ranges, and allowed values. Share the schema between client and server where possible so rules do not drift.",
      "Sanitize for the destination, not in general. HTML sanitization differs from SQL parameterization, shell escaping, or URL encoding. Most injection bugs come from applying the wrong one or none at the point of use.",
      "Treat API responses and third-party data as input too. A compromised or buggy service can return HTML or URLs that your UI must not trust.",
    ],
    code: `import { z } from "zod";

// shared/schemas.js: one source of truth for client and server
export const ReviewInput = z.object({
  productId: z.string().regex(/^p_[a-z0-9]{8}$/),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(10).max(4000),
  website: z.string().url().startsWith("https://").optional(),
});

// Client: instant feedback, no network needed
const result = ReviewInput.safeParse(formValues);
if (!result.success) showFieldErrors(result.error.flatten().fieldErrors);

// Server: the authoritative check, then safe storage and rendering
app.post("/api/reviews", async (req, res) => {
  const parsed = ReviewInput.safeParse(req.body);
  if (!parsed.success) return res.status(422).json(parsed.error.flatten());
  await db.query(
    "INSERT INTO reviews (product_id, rating, title, body) VALUES ($1, $2, $3, $4)",
    [parsed.data.productId, parsed.data.rating, parsed.data.title, parsed.data.body],
  );
  res.sendStatus(201);
});`,
    walkthrough:
      "One zod schema defines the allowed shape. The client uses it to show field errors as the user types; the server repeats the exact same check and returns 422 with structured errors. Values reach the database only through parameterized queries, and the body will be rendered as text later, so no HTML sanitization is needed at all for this feature.",
    flow: ["Define an allowlist schema", "Validate on client and server", "Encode at each destination"],
    mistake:
      "Blocklisting characters such as < and > in a name field. It rejects legitimate names and still misses payloads that use other contexts. Validate the expected shape, then encode for output.",
    exercise:
      "A form accepts a profile website URL. List two validation rules and one output rule.",
    answer:
      "Validation: it must parse as a URL and use https (or http), and it must fit a reasonable length. Output: render it in an href only after re-checking the scheme, and add rel=\"noopener noreferrer\" with target=_blank, so a javascript: URL can never execute.",
    deepDive: [
      {
        heading: "Validation rules that age well",
        points: [
          "Constrain length on every string; unbounded input is a denial-of-service vector.",
          "Prefer enums for choices and reject unknown fields to avoid mass-assignment bugs.",
          "Normalize before validating: trim whitespace and apply Unicode normalization for usernames.",
          "Return field-level errors in a consistent shape so the UI can map them to inputs.",
        ],
      },
    ],
    animation: {
      title: "Input through validation and encoding",
      nodes: [
        ["form", "Form", "user input"],
        ["client", "Client schema", "fast feedback"],
        ["server", "Server schema", "authoritative"],
        ["db", "Database", "parameterized"],
        ["view", "View", "text sink"],
      ],
      steps: [
        ["form", "client", "values", "Each keystroke is checked against the shared schema for instant hints."],
        ["client", "server", "POST", "The submitted body is validated again, because clients can be bypassed."],
        ["server", "form", "422", "Invalid input returns field errors that map back onto the form."],
        ["server", "db", "$1, $2", "Valid data is stored through parameters, never string concatenation."],
        ["db", "view", "render", "When displayed, the title and body are rendered as text, not HTML."],
      ],
    },
  }),

  "security--server-side-request-forgery-ssrf": fsd({
    intro:
      "Server-side request forgery tricks your server into making requests on the attacker's behalf. Frontend features often create SSRF risk without anyone noticing: link previews, image proxies, PDF renderers, webhook URL fields, and server-side rendering that fetches a user-supplied URL. The server sits inside your network, so it can reach things the attacker cannot.",
    concepts: [
      "The classic target is internal metadata and admin services, such as the cloud metadata address 169.254.169.254, localhost admin panels, or databases on private IP ranges that are not exposed to the internet.",
      "Blocklisting by hostname is fragile. Attackers use redirects, alternative IP encodings such as decimal or IPv6 forms, and DNS records that resolve to private addresses, sometimes only on the second lookup.",
      "Robust defenses resolve the hostname, reject private and link-local ranges, connect to the vetted IP, disable or re-check redirects, restrict ports and schemes, and run fetchers in an isolated network segment with egress rules.",
    ],
    code: `// Link preview endpoint with SSRF defenses (Node.js)
import dns from "node:dns/promises";
import ipaddr from "ipaddr.js";

async function assertPublicUrl(raw) {
  const url = new URL(raw);
  if (!["https:", "http:"].includes(url.protocol)) throw new Error("scheme");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("port");

  const addresses = await dns.lookup(url.hostname, { all: true });
  for (const { address } of addresses) {
    const range = ipaddr.parse(address).range();
    if (range !== "unicast") throw new Error(\`blocked range: \${range}\`); // private, loopback, linkLocal…
  }
  return { url, address: addresses[0].address };
}

app.get("/api/preview", async (req, res) => {
  try {
    const { url } = await assertPublicUrl(req.query.url);
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(3000) });
    if (response.status >= 300 && response.status < 400) return res.status(422).end(); // re-validate instead
    const html = (await response.text()).slice(0, 200_000);
    res.json(extractOpenGraph(html));
  } catch {
    res.status(422).json({ message: "URL not allowed" });
  }
});`,
    walkthrough:
      "The endpoint parses the URL, limits schemes and ports, resolves the hostname, and rejects any address outside public unicast space. Redirects are not followed automatically, since a public URL could redirect to an internal one. A timeout and a size cap protect against slow or huge responses. In production you would also pin the connection to the validated IP to defeat DNS rebinding.",
    flow: ["Parse and restrict URL", "Resolve and check IPs", "Fetch with limits"],
    mistake:
      "Validating the hostname string and then letting fetch resolve it again. Between the check and the request, a DNS rebinding attack can change the answer to 127.0.0.1.",
    exercise:
      "Your SSR server renders a page using an image URL from the query string to compute its dimensions. Why is that an SSRF risk and what is a safer design?",
    answer:
      "The server fetches whatever URL the attacker passes, including internal addresses. Only allow images from your own storage or CDN by ID, or route external fetches through an isolated proxy with the checks above and no access to the internal network.",
    deepDive: [
      {
        heading: "Defense in the infrastructure",
        points: [
          "Require IMDSv2 tokens on cloud instances so simple GETs to metadata fail.",
          "Run URL fetchers in a separate network with outbound-only internet access.",
          "Log every outbound fetch with the requesting user for investigation.",
        ],
      },
    ],
    animation: {
      title: "A link preview that refuses internal targets",
      nodes: [
        ["user", "Attacker", "pastes URL"],
        ["api", "Preview API", "validates"],
        ["dns", "DNS", "resolves host"],
        ["internal", "Metadata", "169.254.169.254"],
        ["web", "Public site", "og:tags"],
      ],
      steps: [
        ["user", "api", "url", "The attacker submits a URL whose hostname resolves to the metadata address."],
        ["api", "dns", "lookup", "The API resolves the hostname before making any request."],
        ["dns", "api", "link-local", "The answer is in the link-local range, so the request is rejected."],
        ["api", "internal", "never sent", "No request ever reaches the internal metadata service."],
        ["api", "web", "public URL", "A normal public URL passes the checks and is fetched with a timeout."],
      ],
    },
  }),

  "security--server-side-javascript-injection-ssji": fsd({
    intro:
      "Server-side JavaScript injection happens when a Node.js server evaluates user input as code. Unlike XSS, the code runs on your server with access to the file system, environment variables, and the network. It usually sneaks in through eval-style APIs, template engines, dynamic requires, or unsafe object merging.",
    concepts: [
      "eval, new Function, vm.runInContext, setTimeout with a string, and child_process.exec with interpolated strings all turn data into code or commands. There is almost always a data-only alternative such as JSON.parse or execFile with an argument array.",
      "Server-side template injection is a close cousin. If user input becomes part of a template rather than a variable passed into it, template syntax can reach JavaScript. Always compile fixed templates and pass user data as context.",
      "Prototype pollution lets input like {\"__proto__\": {\"isAdmin\": true}} modify Object.prototype through a naive deep merge, changing behavior across the whole process. Use null-prototype objects, schema validation, and safe merge utilities.",
    ],
    code: `import { execFile } from "node:child_process";

// ❌ Dangerous: input becomes code or shell
app.get("/calc", (req, res) => res.send(String(eval(req.query.expr))));
app.get("/thumb", (req, res) => exec(\`convert \${req.query.file} -resize 200 out.png\`));

// ✅ Data stays data
const operations = { add: (a, b) => a + b, multiply: (a, b) => a * b };
app.get("/calc", (req, res) => {
  const op = operations[req.query.op];
  const [a, b] = [Number(req.query.a), Number(req.query.b)];
  if (!op || !Number.isFinite(a) || !Number.isFinite(b)) return res.sendStatus(400);
  res.json({ result: op(a, b) });
});

app.get("/thumb", (req, res) => {
  const file = path.basename(String(req.query.file)); // no path traversal
  execFile("convert", [\`uploads/\${file}\`, "-resize", "200", "out.png"], (err) =>
    err ? res.sendStatus(500) : res.sendFile("out.png", { root: "." }),
  );
});

// ✅ Prototype-pollution-safe merge
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    target[key] = source[key];
  }
  return target;
}`,
    walkthrough:
      "The calculator replaces eval with a lookup table of allowed operations and numeric parsing, so the only behavior possible is the behavior you wrote. The thumbnail endpoint uses execFile with an argument array, so no shell parses the input, and basename stops path traversal. The merge helper skips keys that would reach the prototype chain.",
    flow: ["Find code-evaluating sinks", "Replace with data APIs", "Validate shapes and keys"],
    mistake:
      "Assuming input validation alone makes eval safe. Attackers find encodings and expressions that pass filters; removing the eval is the real fix.",
    exercise:
      "A Next.js API route builds a MongoDB query directly from req.body, which accepts {\"password\": {\"$ne\": null}}. What class of bug is this and how do you prevent it?",
    answer:
      "It is an injection of query operators (NoSQL injection), closely related to SSJI because input changes the meaning of a query. Validate that fields are plain strings with a schema, reject objects where scalars are expected, and use sanitizing options in the database driver.",
    deepDive: [
      {
        heading: "Lint and review for it",
        points: [
          "Enable lint rules that flag eval, new Function, and string arguments to setTimeout.",
          "Search the codebase for child_process.exec and template compilation from variables.",
          "Run Node.js with --disallow-code-generation-from-strings where your dependencies allow it.",
        ],
      },
    ],
    animation: {
      title: "From eval to a lookup table",
      nodes: [
        ["request", "Request", "?expr=..."],
        ["eval", "eval()", "runs anything"],
        ["process", "Node process", "env, fs, net"],
        ["table", "Operation map", "add, multiply"],
        ["result", "Response", "number only"],
      ],
      steps: [
        ["request", "eval", "payload", "An attacker sends an expression that reads process.env."],
        ["eval", "process", "executes", "eval runs it with full server privileges, leaking secrets."],
        ["request", "table", "op=add", "The fixed design accepts only an operation name and two numbers."],
        ["table", "result", "a + b", "Only code you wrote can run, so the result is always just a number."],
      ],
    },
  }),

  "security--permissions-policy": fsd({
    intro:
      "Permissions-Policy, formerly Feature Policy, lets a site declare which powerful browser features it and its embedded frames may use: camera, microphone, geolocation, payment, fullscreen, USB, and more. It shrinks the damage a compromised script or a malicious ad can do, and it documents your app's capabilities in one header.",
    concepts: [
      "The header lists features with allowlists. camera=() disables the camera for the page and all frames; geolocation=(self) allows only your own origin; fullscreen=(self \"https://player.videos.example\") also allows a named embed.",
      "Iframes need both the parent's policy and the allow attribute. <iframe allow=\"camera\"> requests the feature for that frame, but the parent header still has to permit that origin.",
      "Policies only remove capabilities. Users must still grant permission prompts for features like camera, and the policy guarantees that a third-party frame cannot even ask.",
    ],
    code: `# Response header for a shop that only uses geolocation for store finder
Permissions-Policy: camera=(), microphone=(), geolocation=(self),
  payment=(self "https://pay.provider.example"), fullscreen=(self "https://player.videos.example"),
  usb=(), serial=()

<!-- The video embed may go fullscreen because both the header and allow agree -->
<iframe src="https://player.videos.example/embed/abc" allow="fullscreen"></iframe>

<!-- An ad frame cannot request geolocation: the header limits it to self -->
<iframe src="https://ads.example/slot" sandbox="allow-scripts"></iframe>

<script>
  // Feature detection respects the policy
  if (document.featurePolicy?.allowsFeature("geolocation")) showStoreFinder();
</script>`,
    walkthrough:
      "The header disables camera, microphone, USB, and serial everywhere, allows geolocation only for your origin, and grants payment and fullscreen to two specific partners. The ad iframe could include a script that calls navigator.geolocation, but the browser rejects it without prompting the user.",
    flow: ["Inventory features used", "Deny everything else", "Grant frames explicitly"],
    mistake:
      "Adding allow=\"camera; microphone\" to every iframe by default because one embed needed it. Grant only per frame and per feature, and keep the header restrictive.",
    exercise:
      "A support chat widget is embedded in an iframe and needs file uploads and screen sharing, but not the camera. What do you set?",
    answer:
      "Allow display-capture for the widget's origin in the Permissions-Policy header and add allow=\"display-capture\" to its iframe, while keeping camera=() and microphone=(). File inputs do not need a permission feature.",
    deepDive: [
      {
        heading: "Rolling it out",
        points: [
          "Start with features you clearly never use: camera, microphone, USB, serial, MIDI.",
          "Use Permissions-Policy-Report-Only and the Reporting API to discover uses you forgot.",
          "Review the policy when adding any new embed or browser API.",
        ],
      },
    ],
    animation: {
      title: "A frame asking for a disabled feature",
      nodes: [
        ["header", "Policy header", "camera=()"],
        ["page", "Your page", "top document"],
        ["ad", "Ad iframe", "third party"],
        ["browser", "Browser", "enforces"],
      ],
      steps: [
        ["header", "page", "policy", "The page loads with a header that disables the camera for everyone."],
        ["page", "ad", "embed", "An ad iframe loads inside the page."],
        ["ad", "browser", "getUserMedia", "Its script tries to open the camera."],
        ["browser", "ad", "denied", "The browser rejects the call immediately and never shows a prompt."],
      ],
    },
  }),

  "security--subresource-integrity-sri": fsd({
    intro:
      "Subresource Integrity lets the browser verify that a script or stylesheet loaded from another server is exactly the file you expected. You publish a cryptographic hash in the integrity attribute; if the CDN serves anything else, even one changed byte, the browser refuses to run it. It protects you from compromised or tampered CDNs.",
    concepts: [
      "The integrity attribute holds an algorithm and base64 digest, such as sha384-…. The browser hashes the downloaded bytes and compares. A mismatch blocks the resource and fires an error event.",
      "Cross-origin resources need crossorigin=\"anonymous\" and a CORS-enabled response so the browser is allowed to inspect the bytes for hashing.",
      "SRI only works for static, versioned files. A URL whose content changes on every deploy, such as a vendor's latest analytics script, cannot be pinned; host a copy yourself or isolate it instead.",
    ],
    code: `<!-- Pin an exact library version from a CDN -->
<script
  src="https://cdn.example.net/chart-lib@4.4.1/dist/chart.umd.min.js"
  integrity="sha384-BASE64_DIGEST_OF_THIS_EXACT_FILE"
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>

<!-- Compute the hash locally when upgrading -->
<!-- openssl dgst -sha384 -binary chart.umd.min.js | openssl base64 -A -->

<script>
  // Fallback if the CDN copy fails integrity or does not load
  window.Chart || document.write('<script src="/vendor/chart.umd.min.js"><\\/script>');
</script>`,
    walkthrough:
      "The script URL pins an exact version, and the integrity hash pins its exact bytes. If an attacker modifies the file on the CDN, the browser blocks it. The fallback loads a self-hosted copy so the page still works. Bundlers can add integrity hashes to your own chunks automatically too, which helps when assets are served from a separate CDN domain.",
    flow: ["Pin a versioned URL", "Publish its hash", "Browser verifies before running"],
    mistake:
      "Copying an integrity hash for one file and then changing the version number in the URL. The hash no longer matches, the script silently fails to load, and the feature breaks in production.",
    exercise:
      "Why can't you use SRI for a third-party tag-manager snippet that the vendor updates weekly?",
    answer:
      "SRI pins exact bytes, so every vendor update would break the page until you update the hash. For such scripts, isolate them with CSP and sandboxed iframes, or proxy a reviewed snapshot from your own servers.",
    deepDive: [
      {
        heading: "Generating hashes in builds",
        points: [
          "Webpack and Vite plugins can add integrity attributes to emitted script and link tags.",
          "Use sha384 or sha512; multiple hashes may be listed during migrations.",
          "Pair SRI with CSP's require-sri-for style auditing via reports.",
        ],
      },
    ],
    animation: {
      title: "Tampered file blocked by SRI",
      nodes: [
        ["html", "HTML", "integrity=sha384"],
        ["cdn", "CDN", "serves file"],
        ["browser", "Browser", "hashes bytes"],
        ["fallback", "Self-hosted", "/vendor copy"],
      ],
      steps: [
        ["html", "cdn", "request", "The page requests a pinned library from the CDN."],
        ["cdn", "browser", "tampered", "The CDN was compromised and returns a modified file."],
        ["browser", "html", "mismatch", "The computed hash differs from the integrity attribute, so the script is blocked."],
        ["html", "fallback", "fallback", "The fallback loads the self-hosted copy and the page keeps working."],
      ],
    },
  }),

  "security--cross-origin-resource-sharing-cors": fsd({
    intro:
      "CORS is how a server tells the browser which other origins may read its responses. It relaxes the same-origin policy in a controlled way. It is not a server-side firewall: it controls what browser JavaScript can read, while curl and servers ignore it. Most CORS bugs are either too strict, breaking the app, or too loose, leaking data.",
    concepts: [
      "An origin is scheme, host, and port. https://app.example and https://api.example are different origins, so a fetch from the app to the API is cross-origin and needs the API to send Access-Control-Allow-Origin.",
      "Simple requests, such as a GET or a form-style POST, are sent directly, and the browser checks the response headers. Others, such as JSON POSTs or requests with an Authorization header, trigger a preflight OPTIONS request first.",
      "Credentials such as cookies require Access-Control-Allow-Credentials: true and an exact origin rather than *. Reflecting any Origin header back with credentials is equivalent to having no protection.",
    ],
    code: `// API server (Express) with an explicit allowlist
const allowed = new Set(["https://app.example", "https://admin.example"]);

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (origin && allowed.has(origin)) {
    res.set({
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin", // caches must key responses by Origin
    });
  }
  if (req.method === "OPTIONS") {
    res.set({
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "600", // cache the preflight for 10 minutes
    });
    return res.sendStatus(204);
  }
  next();
});

// Browser code on https://app.example
await fetch("https://api.example/cart", {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ productId: 42 }),
});`,
    walkthrough:
      "The JSON POST is not a simple request, so the browser first sends OPTIONS. The API answers with allowed methods and headers and lets the browser cache that answer for ten minutes. The real POST follows with cookies; the response echoes the exact allowed origin, and Vary: Origin stops a CDN from serving one origin's CORS headers to another.",
    flow: ["Browser sends Origin", "Server allowlists it", "Browser releases the response"],
    mistake:
      "Fixing a CORS error by echoing back whatever Origin arrives, with credentials allowed. Any website the user visits can now read their private API responses.",
    exercise:
      "Your React dev server on http://localhost:5173 gets a CORS error calling the staging API. What are two clean fixes?",
    answer:
      "Configure the dev server's proxy so the browser calls the same origin and the dev server forwards to the API, or add http://localhost:5173 to the staging API's allowlist only in non-production configuration.",
    deepDive: [
      {
        heading: "What CORS does not do",
        points: [
          "It does not stop the request from reaching the server; simple requests are sent and processed even if the response is blocked. That is why CSRF protection is still needed.",
          "It does not protect APIs from non-browser clients; use authentication and rate limiting for that.",
        ],
      },
    ],
    animation: {
      title: "A preflighted cross-origin request",
      nodes: [
        ["app", "app.example", "fetch JSON"],
        ["browser", "Browser", "CORS engine"],
        ["api", "api.example", "allowlist"],
        ["code", "App code", "gets response"],
      ],
      steps: [
        ["app", "browser", "POST", "App code calls fetch with a JSON body and credentials."],
        ["browser", "api", "OPTIONS", "The browser first sends a preflight with Origin and the requested method."],
        ["api", "browser", "allowed", "The API returns the exact origin, allowed methods, and a max-age."],
        ["browser", "api", "real POST", "Now the real request goes out with cookies attached."],
        ["api", "code", "readable", "The response includes the allow headers, so JavaScript may read it."],
      ],
    },
  }),

  "security--cross-site-request-forgery-csrf": fsd({
    intro:
      "Cross-site request forgery makes a victim's browser send an authenticated request to your site from a page the attacker controls. The attacker never sees the response, but they do not need to: the transfer, password change, or purchase has already happened. Cookie-based sessions are vulnerable unless you add explicit protections.",
    concepts: [
      "Browsers attach cookies to requests based on the destination, not on who started the request. A hidden auto-submitting form on evil.example can POST to bank.example with the victim's session cookie.",
      "SameSite cookies are the first line of defense. Lax, the default in modern browsers, withholds cookies on cross-site POSTs and subresource requests but sends them on top-level GET navigations, so GETs must never change state.",
      "A CSRF token proves the request came from your own page. The server issues a random token tied to the session, your frontend sends it in a header or form field, and the server rejects requests without a match. Checking the Origin header adds another cheap layer.",
    ],
    code: `<!-- Attacker page on evil.example: auto-submits when the victim visits -->
<form action="https://shop.example/account/email" method="POST" id="f">
  <input type="hidden" name="email" value="attacker@evil.example" />
</form>
<script>document.getElementById("f").submit();</script>

// Your server: double defense
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const origin = req.get("Origin");
  if (origin && origin !== "https://shop.example") return res.sendStatus(403);

  const token = req.get("X-CSRF-Token") || req.body?._csrf;
  if (!token || token !== req.session.csrfToken) return res.sendStatus(403);
  next();
});

// Your frontend: read the token from a meta tag and send it on writes
const csrf = document.querySelector('meta[name="csrf-token"]').content;
await fetch("/account/email", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
  body: JSON.stringify({ email }),
});`,
    walkthrough:
      "The attacker's form would carry the session cookie if SameSite were None. The middleware rejects it twice: the Origin header is evil.example, and the request has no valid CSRF token because the attacker cannot read your page to find it. Your own frontend reads the token from a meta tag rendered for the session and sends it in a custom header.",
    flow: ["Cookies ride along", "Server checks Origin + token", "Forged request rejected"],
    mistake:
      "Implementing state changes as GET links, such as /cart/clear?confirm=1. SameSite=Lax still sends cookies on top-level GET navigations, and an attacker can trigger them with a simple link.",
    exercise:
      "Your API uses only bearer tokens in the Authorization header, never cookies. Do you still need CSRF tokens?",
    answer:
      "Generally no, because browsers do not attach Authorization headers automatically and cross-origin JavaScript cannot add them without passing CORS. CSRF is a cookie problem. You still need CORS configured correctly and XSS defenses, since XSS bypasses CSRF protections entirely.",
    deepDive: [
      {
        heading: "Token patterns",
        points: [
          "Synchronizer token: stored server side in the session and rendered into the page.",
          "Double-submit cookie: a random value in a readable cookie that the frontend copies into a header; the server compares the two. Sign it to resist subdomain cookie injection.",
          "Framework built-ins such as Rails, Django, Laravel, and Next.js server actions handle much of this for you; know which one you rely on.",
        ],
      },
    ],
    animation: {
      title: "A forged form submission",
      nodes: [
        ["victim", "Victim", "logged in"],
        ["evil", "evil.example", "hidden form"],
        ["browser", "Browser", "adds cookies?"],
        ["server", "shop.example", "checks token"],
      ],
      steps: [
        ["victim", "evil", "visit", "The logged-in victim opens a page on evil.example."],
        ["evil", "browser", "submit", "A hidden form auto-submits a POST to change the account email."],
        ["browser", "server", "POST", "SameSite=Lax withholds the cookie; even if sent, Origin is evil.example."],
        ["server", "browser", "403", "There is no valid CSRF token, so the server rejects the request."],
        ["victim", "server", "own page", "Requests from the real site include the token and succeed normally."],
      ],
    },
  }),

  "security--authentication-and-authorization": fsd({
    intro:
      "Authentication proves who the user is; authorization decides what they may do. The frontend designs the sign-in experience, carries credentials safely, and adapts the interface to permissions, but every authorization decision must be enforced by the server. Modern apps usually delegate sign-in to an identity provider using OpenID Connect.",
    concepts: [
      "Sessions keep state on the server and identify the browser with an HttpOnly cookie. Tokens such as JWTs carry signed claims and are verified by each service. Many apps combine them: a cookie session for the web app, short-lived tokens for APIs.",
      "OAuth 2.0 with PKCE is the standard browser flow for delegated sign-in. The app redirects to the identity provider, receives a one-time code, and exchanges it with a code verifier, so an intercepted code is useless. A backend-for-frontend can keep tokens out of the browser entirely.",
      "Authorization models range from roles (RBAC) to attributes and relationships (ABAC, ReBAC). The frontend receives a computed list of permissions to show or hide controls; the API checks the same rules on every request.",
    ],
    code: `// Permission-aware UI with server-enforced rules
// Server returns the user plus capabilities computed from roles and ownership
// GET /api/me → { id: "u_7", name: "Asha", permissions: ["order:read", "order:refund"] }

import { createContext, useContext } from "react";
const SessionContext = createContext(null);

export function Can({ permission, children, fallback = null }) {
  const session = useContext(SessionContext);
  return session?.permissions.includes(permission) ? children : fallback;
}

function OrderActions({ order }) {
  return (
    <Can permission="order:refund" fallback={<p>Contact support to request a refund.</p>}>
      <button onClick={() => refund(order.id)}>Refund order</button>
    </Can>
  );
}

// Server (Express): the real check, including ownership
app.post("/api/orders/:id/refund", requireSession, async (req, res) => {
  const order = await orders.find(req.params.id);
  const canRefund =
    req.user.permissions.includes("order:refund") &&
    (req.user.role === "support" || order.customerId === req.user.id);
  if (!canRefund) return res.sendStatus(403);
  await payments.refund(order);
  res.sendStatus(204);
});`,
    walkthrough:
      "The UI reads permissions from the session and uses a Can component so conditional controls are consistent everywhere. The refund route repeats the decision on the server, including an ownership rule the UI does not know about. A user who edits the session object in devtools may see the button, but the API still returns 403.",
    flow: ["Authenticate with the IdP", "Carry a session safely", "Authorize every request"],
    mistake:
      "Decoding a JWT in the browser and trusting its claims for decisions. The browser cannot verify the signature securely, and the claims may be stale. Use claims for display hints only.",
    exercise:
      "A user is demoted from admin while signed in, but still sees admin pages for an hour. Why, and how do you fix it?",
    answer:
      "Their permissions are cached in a long-lived token or session payload. Shorten access token lifetime, re-fetch permissions on navigation or focus, and have the server check current roles on sensitive actions so stale UI cannot do damage.",
    deepDive: [
      {
        heading: "Sign-in UX details that matter",
        points: [
          "Redirect back to the page the user wanted after sign-in, validating the return URL against your own origin to avoid open redirects.",
          "Handle token refresh silently and expire sessions gracefully with a message, not a broken screen.",
          "Offer passkeys or MFA, and rate-limit sign-in attempts on the server.",
        ],
      },
    ],
    animation: {
      title: "Sign-in with OIDC and PKCE",
      nodes: [
        ["app", "Web app", "login click"],
        ["idp", "IdP", "identity provider"],
        ["bff", "Backend", "code exchange"],
        ["api", "API", "checks scopes"],
      ],
      steps: [
        ["app", "idp", "redirect", "The app redirects to the IdP with a PKCE code challenge."],
        ["idp", "app", "code", "After sign-in, the IdP redirects back with a one-time authorization code."],
        ["app", "bff", "code", "The backend exchanges the code plus verifier for tokens."],
        ["bff", "app", "cookie", "The browser receives an HttpOnly session cookie, not raw tokens."],
        ["app", "api", "request", "API calls carry the session; the API authorizes each action."],
      ],
    },
  }),
};
