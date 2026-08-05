import { useEffect, useState } from "react";
import { preloadModuleComponent } from "../registry";
import { modules } from "../../data/catalog";
import "./Home.css";

export default function Home({ navigate }) {
  const [openingModule, setOpeningModule] = useState(null);

  useEffect(() => {
    const preloadModules = () => {
      modules.forEach((module) => preloadModuleComponent(module.id));
    };
    const idleId = window.requestIdleCallback?.(preloadModules, { timeout: 1500 });
    const timerId = idleId === undefined ? window.setTimeout(preloadModules, 500) : null;
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== null) window.clearTimeout(timerId);
    };
  }, []);

  const openModule = async (moduleId) => {
    if (openingModule) return;
    setOpeningModule(moduleId);
    try {
      await preloadModuleComponent(moduleId);
      navigate(`/learn/${moduleId}`, { scrollBehavior: "smooth" });
    } finally {
      setOpeningModule(null);
    }
  };

  return (
    <main className="home">
      <section className="homeHero">
        <small>THE SOFTWARE ENGINEER&apos;S LIBRARY</small>
        <h1>
          Learn the system.
          <br />
          <em>Ship with confidence.</em>
        </h1>
        <p>
          Structured learning modules, focused technology courses, and practical articles—all
          organized as simple React components you can extend.
        </p>
        <button
          onClick={() =>
            document.getElementById("module-grid")?.scrollIntoView({ behavior: "smooth" })
          }
        >
          EXPLORE {modules.length} MODULES →
        </button>
      </section>
      <section className="catalogue" id="module-grid">
        <header>
          <div>
            <small>01 / KNOWLEDGE MAP</small>
            <h2>Choose your module</h2>
          </div>
          <p>
            Start with a discipline, choose a technology, then work through its articles in order.
          </p>
        </header>
        <div className="moduleGrid">
          {modules.map((module, index) => (
            <button
              className="moduleTile"
              key={module.id}
              aria-busy={openingModule === module.id}
              disabled={Boolean(openingModule)}
              onPointerEnter={() => preloadModuleComponent(module.id)}
              onPointerDown={() => preloadModuleComponent(module.id)}
              onFocus={() => preloadModuleComponent(module.id)}
              onClick={() => openModule(module.id)}
              style={{ "--tile-accent": module.accent }}
            >
              <span className="tileVisual">
                <i>{module.icon}</i>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <em />
                <em />
                <em />
              </span>
              <span className="tileBody">
                <small>
                  {module.groups.reduce((count, group) => count + group.tracks.length, 0)} COURSES
                </small>
                <strong>{module.name}</strong>
                <p>{module.description}</p>
                <i>{openingModule === module.id ? "OPENING…" : "OPEN MODULE ↗"}</i>
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
