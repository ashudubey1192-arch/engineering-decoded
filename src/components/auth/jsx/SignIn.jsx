import { useState } from "react";
import "../css/SignIn.css";

export default function SignIn({ navigate }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onSubmit = (event) => {
    event.preventDefault();
    // Wire this to your auth backend.
  };

  return (
    <main className="authPage">
      <form className="authCard" onSubmit={onSubmit}>
        <span className="authBrand">ENGINEERING DECODED</span>
        <h1>Welcome back</h1>
        <p className="authSubtitle">Sign in with your email address or mobile number.</p>

        <label className="authField">
          <span>Email or mobile</span>
          <input
            type="text"
            autoComplete="username"
            value={form.identifier}
            onChange={update("identifier")}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="authField">
          <span>Password</span>
          <div className="authPasswordWrap">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="authReveal"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button type="submit" className="authSubmit">
          Sign in
        </button>

        <div className="authLinks">
          <button type="button" onClick={() => navigate("/forgot-password")}>
            Forgot password?
          </button>
          <button type="button" onClick={() => navigate("/signup")}>
            New here? Create an account
          </button>
        </div>
      </form>
    </main>
  );
}
