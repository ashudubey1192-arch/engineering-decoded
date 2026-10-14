# Login browser E2E check — 2026-10-14

Result: BLOCKED for live authentication; local browser smoke checks passed.

Tested actual React UI in the Codex browser against http://127.0.0.1:5174.
No auth responses were mocked. No real email was sent or provider account signed in.

| Check | Result |
|---|---|
| Login renders email OTP as default, with Google and GitHub buttons | PASS |
| Empty email prevented by required-field validation | PASS |
| Malformed email prevented by email-type validation | PASS |
| Send code with syntactically valid test email | BLOCKED: VITE_NEON_AUTH_URL missing; clear error shown |
| Google button | BLOCKED: same missing-configuration error; no fake success |
| GitHub button | BLOCKED: same missing-configuration error; no fake success |
| Switch to password login | PASS: email/password and recovery controls appear |
| Switch to password registration | PASS: display name/email/password appear |
| OAuth error callback URL | PASS: recoverable error shown (direct URL test, not a real OAuth cancellation) |
| Anonymous /account | PASS: sign-in required, no profile shown |
| Anonymous /admin | PASS: administrator access required |

Only .env.example is present. No Neon/database configuration variables were found
in the current execution environment. The Vite-only server does not run Vercel
Functions, so this run cannot validate the production API routing either.

Pending on a configured Vercel preview: real OTP delivery, correct/incorrect/expired
code verification, resend behavior, Google and GitHub consent/callback, authenticated
session restoration, logout, API access and persistence in Neon PostgreSQL.

Evidence: login-e2e-blocked.png.
