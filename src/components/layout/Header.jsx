import Logo from "../brand/jsx/Logo";
import "./Header.css";

export default function Header({ theme, onTheme, onSearch, navigate }) {
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
        <button onClick={() => navigate("/")}>Learn</button>
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
    </header>
  );
}
