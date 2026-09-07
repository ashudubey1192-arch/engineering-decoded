import Logo from "../brand/jsx/Logo";
import "./Header.css";
import { api, clearSession, getSession } from "../../services/api";

export default function Header({ theme, onTheme, onSearch, navigate }) {
  const session = getSession();
  return (
    <header className="siteHeader">
      <button
        className="wordmark"
        onClick={() => navigate("/")}
        aria-label="Engineering Decoded home"
      >
        <Logo />
      </button>
      <nav aria-label="Main navigation">
        <button onClick={() => navigate("/")}>Dashboard</button>
        <button onClick={() => navigate("/courses", { scrollBehavior: "smooth" })}>Courses</button>
        <button onClick={() => navigate("/learn/interviews")}>Interview prep</button>
        <button onClick={() => navigate("/learn/roadmaps")}>Roadmaps</button>
        <button onClick={() => navigate("/learn/career")}>Career</button>
      </nav>
      <button className="headerSearch" onClick={onSearch} aria-label="Search">
        <span aria-hidden="true">⌕</span>
        <span>Search</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button
        className="roundButton"
        onClick={onTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
      </button>
      {session?.user?.role === "ADMIN" && (
        <button className="accountButton" onClick={() => navigate("/admin")}>Admin</button>
      )}
      {session && <button className="accountButton" onClick={() => navigate("/account")}>Account</button>}
      <button className="accountButton" onClick={async () => {
        if (session) { await api("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) }).catch(() => null); clearSession(); navigate("/"); } else navigate("/login");
      }}>{session ? "Sign out" : "Sign in"}</button>
    </header>
  );
}
