# Neon PostgreSQL, Vercel Functions, and Neon Auth

The Vite frontend calls `/api/*` on the same Vercel deployment. `api/index.js`
verifies Neon Auth JWTs using the branch's JWKS, issuer, audience and expiry,
then uses the Neon HTTP driver with parameterized SQL. Application roles and
progress live in the `app` schema; Neon manages `neon_auth` identities.

## Configure

1. Create a Neon project, enable Neon Auth (Better Auth), and copy the pooled
   PostgreSQL connection string and Auth URL for the same branch.
2. Copy `.env.example` to `.env.local`. Set `DATABASE_URL`,
   `VITE_NEON_AUTH_URL`, `NEON_AUTH_JWKS_URL`, `NEON_AUTH_ISSUER`, and
   `NEON_AUTH_AUDIENCE`. Use the actual JWT issuer and audience configured by
   your Neon Auth endpoint; do not use the example placeholders. Copy the JWKS
   URL from Neon rather than guessing its path. The API fails closed if any
   verification setting is missing. Never expose DATABASE_URL through VITE_*.
3. Add the local and deployed frontend origins to Neon Auth's trusted domains.
   Configure email delivery/verification and password reset in Neon Auth.
   Enable Email OTP for sign-in (six-digit codes) and configure email delivery.
   Enable both Google and GitHub OAuth providers in Neon Auth. Register each
   provider's callback URL exactly as shown in Neon, and store the provider
   client IDs/secrets in Neon Auth, never in frontend environment variables.
   The login page always shows both providers; an unconfigured provider reports
   an error. The old `VITE_NEON_GOOGLE_ENABLED` flag is no longer used.
4. Run `npm run db:migrate`. This applies the idempotent initial schema in one
   transaction. It does not modify the Java backend's tables or Neon Auth tables.
   The database role needs schema creation rights for migration, and runtime
   access to `app` plus SELECT access to `neon_auth."user"`.
5. Set the same environment variables in the Vercel project's deployment
   environments. Each preview branch must use matching database and Auth URLs.
   Deploy using the repository's Vite settings. Run migrations explicitly before
   serving traffic; builds never mutate a database.
6. Use `npx vercel dev` for the complete local app and Functions. Plain
   `npm run dev` serves the frontend only and cannot service API requests.

After signing in once, promote the first administrator with a deliberate SQL
statement in the Neon SQL editor, substituting the verified identity ID:

```sql
UPDATE app.users SET role = 'ADMIN' WHERE id = 'NEON_AUTH_USER_ID';
```

The application never grants admin privileges from browser input, email matching,
or user-editable Neon metadata. Disabled app users cannot access the API even
with an unexpired JWT. Locally cached UI identity is not an authorization source.
The SDK manages authentication; the app does not persist access/refresh tokens.

## Coverage and migration boundaries

Implemented: passwordless email OTP sign-in with server-side code validation,
resend cooldown and change-email flow; Google and GitHub OAuth; email/password registration/sign-in; sign-out,
password reset, email verification, display-name/password updates, article
progress, DSA state sync, and admin user access/statistics. DSA writes preserve
newer timestamps, serialize per-user batches, and roll back above 4,000 entries.
The existing summary's completedCourses field counts courses with at least one
completed article, retaining the previous API semantics.

Legacy Java accounts/passwords and server progress are not automatically imported.
Plan an explicit identity mapping and progress migration before switching an
existing production installation. Mobile sign-in/contact editing and the Java
backend's login-audit UI are replaced by Neon-managed email identity workflows.
Java code execution still requires an isolated external runner. Set the server-only
`JAVA_RUNNER_URL` and `JAVA_RUNNER_TOKEN` to proxy the existing runner through the
authenticated Function. The runner must enforce its own concurrency/resource limits.
Without those settings execution is unavailable; editing and local execution remain usable.
The previous Java backend remains in `backend/` for reference and migration.
Application disabling affects app APIs, not the user's Neon Auth account itself.

## Validation

Run `npm run test:auth`, `npm run test:api`, `npm run check:dsa-sync`, `npm run lint`, and `npm run build`. The API suite exercises
validation and authorization with a stubbed database; it does not substitute for
running SQL against a Neon branch. Before production, verify registration,
verification email, OTP delivery, incorrect/expired codes, resend, login,
Google and GitHub OAuth success/cancellation, refresh, reset email, logout,
progress across two accounts/devices, admin denial, and disabled-user denial on
a preview deployment. Check `/api/health`, an unknown `/api/*` route (JSON 404
when signed in), and a direct lesson URL to verify routing.

References: [Neon Auth SDK](https://github.com/neondatabase/neon-js/tree/main/packages/auth)
and [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver).

Email OTPs are generated, delivered, expired, rate-limited, and validated by Neon
Auth's Better Auth service. No OTP or email-provider secret is stored by this
frontend. The 30-second resend countdown is a UI convenience; Neon must enforce
server-side rate and attempt limits. See the [Email OTP API](https://better-auth.com/docs/plugins/email-otp).
New-user OTP signup follows the policy configured in Neon Auth. Test delivery and
both provider callbacks on the real preview domain before enabling production.
