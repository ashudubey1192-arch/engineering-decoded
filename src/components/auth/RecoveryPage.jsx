import { useState } from "react";
import { requireAuth, authResult } from "../../services/api";
import "./AuthPage.css";
export default function RecoveryPage({ navigate }) {
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
              email: form.get("email"),
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
        <h1>Reset password</h1>
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
                <input name="email" type="email" required autoComplete="email" />
              </label>
            )}
            <button className="authSubmit" disabled={busy}>
              {busy ? "Please wait…" : "Continue"}
            </button>
          </form>
        )}
        {error && <p role="alert">{error}</p>}
        <button className="authSwitch" onClick={() => navigate("/login")}>
          Back to sign in
        </button>
      </section>
    </main>
  );
}
