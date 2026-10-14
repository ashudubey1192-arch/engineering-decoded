import { useState } from "react";
import { requireAuth, authResult, getSession } from "../../services/api";
import "./AuthPage.css";
export default function RecoveryPage({ navigate }) {
  const accountEmail = getSession()?.user?.email;
  const [email, setEmail] = useState("");
  const token = new window.URLSearchParams(window.location.search).get("token");
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new window.FormData(event.currentTarget);
    try {
      const client = requireAuth();
      await authResult(
        token
          ? client.resetPassword({ token, newPassword: form.get("password") })
          : client.requestPasswordReset({
              email: getSession()?.user?.email || form.get("email"),
              redirectTo: window.location.origin + "/forgot-password",
            }),
      );
      setMessage(
        token
          ? "Password updated. You can now sign in."
          : "If an account exists, a reset link will arrive by email.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="authPage">
      <section className="authCard">
        <h1>{token ? "Choose a password" : "Set or reset password"}</h1>
        {!token && <p>We’ll email you a link to create a password or replace your existing one.</p>}
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <form onSubmit={submit}>
            {token ? (
              <label>
                New password
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </label>
            ) : (
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={accountEmail || email}
                  readOnly={Boolean(accountEmail)}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            <button className="authSubmit" disabled={busy}>
              {busy ? "Please wait…" : "Continue"}
            </button>
          </form>
        )}
        {error && <p role="alert">{error}</p>}
        <button className="authSwitch" onClick={() => navigate(accountEmail ? "/account" : "/login")}>
          {accountEmail ? "Back to account" : "Back to sign in"}
        </button>
      </section>
    </main>
  );
}
