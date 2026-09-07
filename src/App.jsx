import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "./components/layout/Header";
import Home from "./components/home/Home";
import ModulePage from "./components/learning/ModulePage";
import CoursePage from "./components/learning/CoursePage";
import ArticlePage from "./components/learning/ArticlePage";
import SignIn from "./components/auth/jsx/SignIn";
import { getCourseComponent, getModuleComponent } from "./components/registry";
import useRouter from "./hooks/useRouter";
import { getModule, getTrack, modules } from "./data/catalog";

export default function App() {
  const { path, navigate, isNavigating } = useRouter();
  const [theme, setTheme] = useState("dark");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

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

  const results = useMemo(
    () =>
      modules
        .flatMap((module) =>
          module.groups.flatMap((group) =>
            group.tracks.map((track) => ({ module, track, group: group.name })),
          ),
        )
        .filter((item) =>
          `${item.module.name} ${item.group} ${item.track.name}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .slice(0, 12),
    [query],
  );

  const parts = path.split("/").filter(Boolean);
  let page;

  if (parts.length === 0) {
    page = <Home navigate={navigate} />;
  } else if (parts[0] === "signin") {
    page = <SignIn navigate={navigate} />;
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
        <div className="routeView" key={path}>
          {page}
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
                placeholder="Search modules, categories, and courses..."
              />
              <kbd>ESC</kbd>
            </header>
            <div className="commandHint">
              <span>{query ? `RESULTS FOR “${query}”` : "POPULAR LEARNING PATHS"}</span>
              <span>{results.length} results</span>
            </div>
            <div className="commandResults">
              {results.map(({ module, track, group }) => (
                <button
                  key={`${module.id}-${track.slug}`}
                  onClick={() => {
                    navigate(`/learn/${module.id}/${track.slug}`);
                    closeSearch();
                  }}
                >
                  <span className="resultIcon" style={{ background: module.accent }}>
                    {module.icon}
                  </span>
                  <span>
                    <small>
                      {module.name} · {group}
                    </small>
                    <b>{track.name}</b>
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
