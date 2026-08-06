# Engineering Decoded API

Spring Boot 4.1 / Java 21 API backed by PostgreSQL. Flyway applies migrations automatically.

## Run locally

From the repository root:

```bash
docker compose up --build
```

API: `http://localhost:8080`; health: `GET /actuator/health`.

The compose defaults create `admin@engineeringdecoded.local` / `ChangeMe123!` for local development only. Override `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` before any shared deployment.

## Main endpoints

- `POST /api/auth/register`
- `POST /api/auth/login` (email or E.164-style mobile in `identifier`)
- `POST /api/auth/google` (verified Google Identity Services ID token)
- `POST /api/auth/refresh` and `POST /api/auth/logout`
- `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
- `GET /api/auth/me`, `PUT /api/auth/profile`, and `POST /api/auth/change-password`
- `POST /api/auth/verification` and `POST /api/auth/verification/confirm`
- `GET|PUT /api/progress`
- `GET /api/progress/summary`
- `GET /api/admin/stats`
- `GET|PATCH /api/admin/users/{id}`
- `GET /api/admin/login-audit`

Protected endpoints require `Authorization: Bearer <accessToken>`.

## Google login

Create a Google OAuth 2.0 Web client, add `http://localhost:5173` as an authorized JavaScript origin, and set the same client ID as `GOOGLE_CLIENT_ID` for the API and `VITE_GOOGLE_CLIENT_ID` for Vite. The browser sends the Google ID token to the API; the API verifies its signature, issuer, expiry, and audience before linking or creating a user.

For local development, `EXPOSE_DEVELOPMENT_TOKENS=true` returns password-reset tokens and verification codes in API responses. Set it to `false` outside local development and connect the workflow service to an email/SMS delivery provider.
