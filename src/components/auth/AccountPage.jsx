import { useState } from "react";
import { requireAuth, authResult, restoreSession, getSession } from "../../services/api";
import "./AccountPage.css";
export default function AccountPage({ navigate }) {
  const user = getSession()?.user;
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event, password) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new window.FormData(event.currentTarget);
    try {
      const client = requireAuth();
      await authResult(
        password
          ? client.changePassword({
              currentPassword: form.get("currentPassword"),
              newPassword: form.get("newPassword"),
              revokeOtherSessions: true,
            })
          : client.updateUser({ name: form.get("name") }),
      );
      await restoreSession();
      setMessage(password ? "Password updated" : "Profile updated");
    } catch (e) {
      setError(
        password && /identity not found|credential account not found/i.test(e.message)
          ? "This account has no password yet. Use ‘Set or reset password by email’ below to create one. Your email sign-in still works."
          : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <main className="accountPage">
        <h1>Sign in to manage your account</h1>
        <button onClick={() => navigate("/login")}>Sign in</button>
      </main>
    );
  return (
    <main className="accountPage">
      <header>
        <h1>Profile and security</h1>
        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </header>
      <section className="accountGrid">
        <form className="accountCard" onSubmit={(e) => submit(e, false)}>
          <h2>Profile</h2>
          <label>
            Display name
            <input name="name" defaultValue={user.displayName} required maxLength={120} />
          </label>
          <p>
            {user.email} · {user.emailVerified ? "Verified" : "Not verified"}
          </p>
          {!user.emailVerified && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await authResult(
                    requireAuth().sendVerificationEmail({
                      email: user.email,
                      callbackURL: window.location.origin + "/account",
                    }),
                  );
                  setMessage("Check your email for a verification link.");
                } catch (e) {
                  setError(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Verify email
            </button>
          )}
          <button className="primary" disabled={busy}>
            Save profile
          </button>
        </form>
        <form className="accountCard" onSubmit={(e) => submit(e, true)}>
          <h2>Change password</h2>
          <label>
            Account email
            <input name="email" type="email" value={user.email || ""} readOnly autoComplete="username" />
          </label>
          <p>
            Signed up with an email code, Google, or GitHub? Set a password by email first. An email
            code is not your current password.
          </p>
          <button type="button" disabled={busy} onClick={() => navigate("/forgot-password")}>
            Set or reset password by email
          </button>
          <label>
            Current password
            <input
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <label>
            New password
            <input
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button className="primary" disabled={busy}>
            Update password
          </button>
        </form>
      </section>
    </main>
  );
}
