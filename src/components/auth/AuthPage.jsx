import { useEffect, useRef, useState } from "react";
import { requireAuth, authResult } from "../../services/api";
import { sendLoginCode, verifyLoginCode, finishSignIn, socialSignIn } from "../../services/signIn";
import "./AuthPage.css";
export default function AuthPage({ navigate }) {
  const [mode, setMode] = useState("otp");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(() =>
    new window.URLSearchParams(window.location.search).has("error")
      ? "Social sign-in was not completed. Please try again."
      : "",
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const busy = useRef(false);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  async function run(action) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (reason) {
      setError(reason.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }
  async function send(emailAddress) {
    await sendLoginCode(emailAddress);
    setSentTo(emailAddress.trim());
    setOtp("");
    setCooldown(30);
    setMessage("Code sent. Check your inbox and spam folder. Use the most recent code.");
  }
  function switchMode(next) {
    setMode(next);
    setSentTo("");
    setOtp("");
    setError("");
    setMessage("");
  }
  function submit(event) {
    event.preventDefault();
    const form = new window.FormData(event.currentTarget);
    run(async () => {
      if (mode === "otp") {
        if (!sentTo) await send(email);
        else navigate(await verifyLoginCode(sentTo, otp));
        return;
      }
      const client = requireAuth();
      const credentials = { email: email.trim(), password: form.get("password") };
      await authResult(
        mode === "password"
          ? client.signIn.email(credentials)
          : client.signUp.email({ ...credentials, name: form.get("name") }),
      );
      if (mode === "register") {
        try {
          navigate(await finishSignIn());
        } catch {
          setMessage(
            "Account created. Verify your email, then sign in with an email code or password.",
          );
        }
      } else navigate(await finishSignIn());
    });
  }
  return (
    <main className="authPage">
      <section className="authCard" aria-busy={loading}>
        <small>ENGINEERING DECODED</small>
        <h1>
          {mode === "register"
            ? "Create your account"
            : sentTo
              ? "Check your email"
              : "Welcome back"}
        </h1>
        <p>
          {mode === "otp" ? (
            sentTo ? (
              <>
                Enter the six-digit code sent to <strong>{sentTo}</strong>.
              </>
            ) : (
              "Sign in with a one-time email code. No password needed."
            )
          ) : (
            "Sign in to sync your learning progress."
          )}
        </p>
        <div className="authSocial">
          <button
            type="button"
            disabled={loading}
            onClick={() => run(() => socialSignIn("google"))}
          >
            Continue with Google
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(() => socialSignIn("github"))}
          >
            Continue with GitHub
          </button>
        </div>
        <div className="authDivider">
          <span>or continue with email</span>
        </div>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Display name
              <input name="name" required maxLength={120} autoComplete="name" disabled={loading} />
            </label>
          )}
          {!sentTo && (
            <label>
              Email address
              <input
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </label>
          )}
          {mode === "otp" && sentTo && (
            <label>
              Verification code
              <input
                name="otp"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                required
                autoFocus
                disabled={loading}
                aria-describedby="otp-help"
              />
              <span id="otp-help">Expired or invalid code? Request a new one below.</span>
            </label>
          )}
          {mode !== "otp" && (
            <label>
              Password
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "password" ? "current-password" : "new-password"}
                disabled={loading}
              />
            </label>
          )}
          {error && (
            <div role="alert" className="authError">
              {error}
            </div>
          )}
          {message && (
            <p role="status" className="authNotice">
              {message}
            </p>
          )}
          <button
            className="authSubmit"
            disabled={loading || (mode === "otp" && !sentTo && cooldown > 0)}
          >
            {loading
              ? "Please wait…"
              : mode === "otp"
                ? sentTo
                  ? "Verify code and sign in"
                  : cooldown
                    ? `Send code in ${cooldown}s`
                    : "Send email code"
                : mode === "password"
                  ? "Sign in"
                  : "Create account"}
          </button>
        </form>
        {mode === "otp" && sentTo && (
          <>
            <button
              className="authSwitch"
              disabled={loading || cooldown > 0}
              onClick={() => run(() => send(sentTo))}
            >
              {cooldown ? `Resend code in ${cooldown}s` : "Resend code"}
            </button>
            <button
              className="authSwitch"
              disabled={loading}
              onClick={() => {
                setSentTo("");
                setOtp("");
                setError("");
                setMessage("");
              }}
            >
              Use a different email
            </button>
          </>
        )}
        {mode === "password" && (
          <button
            className="authSwitch"
            disabled={loading}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        )}
        <button
          className="authSwitch"
          disabled={loading}
          onClick={() => switchMode(mode === "otp" ? "password" : "otp")}
        >
          {mode === "otp" ? "Sign in with a password instead" : "Sign in with an email code"}
        </button>
        <button
          className="authSwitch"
          disabled={loading}
          onClick={() => switchMode(mode === "register" ? "otp" : "register")}
        >
          {mode === "register" ? "Back to sign in" : "Create an account with a password"}
        </button>
      </section>
    </main>
  );
}
