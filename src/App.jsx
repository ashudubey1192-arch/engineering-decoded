import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header";
import Home from "./components/home/Home";
import ModulePage from "./components/learning/ModulePage";
import CoursePage from "./components/learning/CoursePage";
import CourseCompletion from "./components/learning/CourseCompletion";
import ArticlePage from "./components/learning/ArticlePage";
import Courses from "./components/courses/Courses";
import AuthPage from "./components/auth/AuthPage";
import AdminPage from "./components/admin/AdminPage";
import RecoveryPage from "./components/auth/RecoveryPage";
import AccountPage from "./components/auth/AccountPage";
import { getCourseComponent, getModuleComponent } from "./components/registry";
import useRouter from "./hooks/useRouter";
import { getModule, getTrack } from "./data/catalog";
import { restoreSession, getSession } from "./services/api";

import { searchLibrary } from "./data/librarySearch";

export default function App() {
  const { path, navigate, isNavigating } = useRouter();
  const [theme, setTheme] = useState("dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [, refreshSession] = useState(0);

  useEffect(() => {
    const changed = () => refreshSession((value) => value + 1);
    const restore = () =>
      restoreSession()
        .catch(() => {})
        .finally(() => setSessionReady(true));
    window.addEventListener("ed-session", changed);
    window.addEventListener("focus", restore);
    restore();
    return () => {
      window.removeEventListener("ed-session", changed);
      window.removeEventListener("focus", restore);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.dataset.theme = saved;
    const handleKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    addEventListener("keydown", handleKeys);
    return () => removeEventListener("keydown", handleKeys);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  const results = useMemo(() => searchLibrary(query), [query]);

  const parts = path.split("/").filter(Boolean);
  // Accept the singular course URL while preserving existing links and progress keys.
  if (parts[0] === "learn" && parts[1] === "dsa" && parts[2] === "dsa-foundation") {
    parts[2] = "dsa-foundations";
  }
  let page;

  if (parts.length === 0) {
    page = <Home navigate={navigate} />;
  } else if (parts[0] === "courses") {
    page = <Courses navigate={navigate} />;
  } else if (parts[0] === "login" || parts[0] === "signin") {
    page = <AuthPage navigate={navigate} />;
  } else if (parts[0] === "admin") {
    page = <AdminPage navigate={navigate} />;
  } else if (parts[0] === "forgot-password") {
    page = <RecoveryPage navigate={navigate} />;
  } else if (parts[0] === "account") {
    page = <AccountPage navigate={navigate} />;
  } else if (parts[0] === "learn" && parts.length === 2) {
    const module = getModule(parts[1]);
    const ModuleComponent = getModuleComponent(parts[1]);
    page = ModuleComponent ? (
      <ModuleComponent navigate={navigate} />
    ) : (
      <ModulePage module={module} navigate={navigate} />
    );
  } else if (parts[0] === "learn" && parts.length === 3) {
    const module = getModule(parts[1]);
    const track = getTrack(module, parts[2]);
    const CourseComponent = getCourseComponent(parts[1], parts[2]);
    page = CourseComponent ? (
      <CourseComponent navigate={navigate} />
    ) : (
      <CoursePage module={module} track={track} navigate={navigate} />
    );
  } else if (parts[0] === "learn" && parts.length >= 4) {
    const module = getModule(parts[1]);
    page = (
      <ArticlePage
        module={module}
        track={getTrack(module, parts[2])}
        articleSlug={parts[3]}
        navigate={navigate}
      />
    );
  } else {
    page = <Home navigate={navigate} />;
  }

  const completionModule = parts[0] === "learn" && parts.length >= 3 ? getModule(parts[1]) : null;
  const completionTrack = completionModule ? getTrack(completionModule, parts[2]) : null;
  const closeSearch = () => setSearchOpen(false);

  return (
    <>
      <Header
        theme={theme}
        onTheme={toggleTheme}
        onSearch={() => setSearchOpen(true)}
        navigate={navigate}
      />
      <div className={`routeLoadingBar${isNavigating ? " active" : ""}`} aria-hidden="true" />
      <Suspense
        fallback={
          <main className="pageLoading" aria-live="polite">
            <span />
            <p>Preparing your lesson…</p>
          </main>
        }
      >
        <div className="routeView">
          {!sessionReady && ["account", "admin", "forgot-password"].includes(parts[0]) ? (
            <p role="status">Loading your account…</p>
          ) : (
            page
          )}
          {sessionReady && completionTrack && (
            <CourseCompletion
              key={`${path}:${getSession()?.user?.id || "guest"}`}
              module={completionModule}
              track={completionTrack}
              articleSlug={parts.length >= 4 ? parts[3] : undefined}
              navigate={navigate}
            />
          )}
        </div>
      </Suspense>
      {searchOpen && (
        <div className="overlay" onMouseDown={closeSearch}>
          <section
            className="command"
            role="dialog"
            aria-modal="true"
            aria-label="Search learning library"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="commandTitle">
              <span>SEARCH THE LIBRARY</span>
              <button onClick={closeSearch} aria-label="Close search">
                ×
              </button>
            </div>
            <header>
              <span aria-hidden="true">⌕</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, articles, and modules..."
                aria-label="Search courses, articles, and modules"
              />
              <kbd>ESC</kbd>
            </header>
            <div className="commandHint">
              <span>{query ? `RESULTS FOR “${query}”` : "POPULAR LEARNING PATHS"}</span>
              <span>{results.length} results</span>
            </div>
            <div className="commandResults">
              {results.length === 0 && (
                <p role="status">No matching courses, articles, or modules.</p>
              )}
              {results.map(({ module, title, type, path: resultPath, context }) => (
                <button
                  key={resultPath}
                  onClick={() => {
                    navigate(resultPath);
                    closeSearch();
                  }}
                >
                  <span className="resultIcon" style={{ background: module.accent }}>
                    {module.icon}
                  </span>
                  <span>
                    <small>
                      {type} · {context}
                    </small>
                    <b>{title}</b>
                  </span>
                  <i>↗</i>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
