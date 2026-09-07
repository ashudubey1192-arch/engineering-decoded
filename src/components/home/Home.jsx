import { useEffect, useMemo, useState } from "react";
import { preloadModuleComponent } from "../registry";
import { modules } from "../../data/catalog";
import "./Home.css";

const activity = [
  0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 1, 0, 1, 2, 2, 0, 0, 1, 3, 4, 2, 1, 0, 0, 2, 3, 1,
  4, 2, 0, 1, 0, 3, 2, 4, 3, 1, 0, 2, 1, 3,
];

export default function Home({ navigate }) {
  const [openingModule, setOpeningModule] = useState(null);
  const [moduleQuery, setModuleQuery] = useState("");
  const totalCourses = modules.reduce(
    (total, module) =>
      total + module.groups.reduce((count, group) => count + group.tracks.length, 0),
    0,
  );
  const filteredModules = useMemo(
    () =>
      modules.filter((module) =>
        `${module.name} ${module.description}`.toLowerCase().includes(moduleQuery.toLowerCase()),
      ),
    [moduleQuery],
  );
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const preloadModules = () => modules.forEach((module) => preloadModuleComponent(module.id));
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
    <main className="dashboardHome">
      <aside className="dashboardSidebar">
        <header>
          <span className="dashboardMark">ED</span>
          <div><small>YOUR LIBRARY</small><strong>Learning map</strong></div>
        </header>
        <label className="moduleSearch">
          <span>⌕</span>
          <input
            value={moduleQuery}
            onChange={(event) => setModuleQuery(event.target.value)}
            placeholder="Find a module"
          />
        </label>
        <nav aria-label="Learning modules">
          {filteredModules.map((module) => (
            <button
              key={module.id}
              onPointerEnter={() => preloadModuleComponent(module.id)}
              onPointerDown={() => preloadModuleComponent(module.id)}
              onFocus={() => preloadModuleComponent(module.id)}
              onClick={() => openModule(module.id)}
              style={{ "--module-accent": module.accent }}
            >
              <i>{module.icon}</i><span>{module.name}</span><b>›</b>
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboardContent">
        <header className="dashboardWelcome">
          <div>
            <small>ENGINEERING DECODED · LEARNING DASHBOARD</small>
            <h1>{greeting}, Ashutosh.</h1>
            <p>Keep building depth—one focused lesson at a time.</p>
          </div>
          <blockquote>
            <span>“</span>
            <p>Strong engineers connect fundamentals to decisions.</p>
            <cite>Today&apos;s learning note</cite>
          </blockquote>
        </header>

        <section className="dashboardLeadGrid">
          <article className="continuePanel">
            <header><small>CONTINUE LEARNING</small><span>08% COMPLETE</span></header>
            <div className="continueBody">
              <span className="continueIcon">SD</span>
              <div>
                <p>System Design and Architecture</p>
                <h2>System Design Fundamentals</h2>
                <small>Up next · Functional and Non-Functional Requirements</small>
              </div>
              <button onClick={() => openModule("architecture")}>Continue <span>→</span></button>
            </div>
            <div className="progressTrack"><i /></div>
            <footer><span>6 of 60 lessons explored</span><span>~8 min next lesson</span></footer>
          </article>

          <article className="focusPanel">
            <small>WEEKLY FOCUS</small>
            <div className="focusRing"><span>4</span><small>days</small></div>
            <h3>Build consistency</h3>
            <p>One more learning day beats one more saved bookmark.</p>
          </article>
        </section>

        <section className="metricGrid" aria-label="Learning statistics">
          <article><i className="metricGreen">◎</i><div><strong>{modules.length}</strong><span>learning modules</span></div></article>
          <article><i className="metricBlue">▦</i><div><strong>{totalCourses}</strong><span>focused courses</span></div></article>
          <article><i className="metricOrange">◇</i><div><strong>270+</strong><span>dedicated articles</span></div></article>
          <article><i className="metricPurple">↗</i><div><strong>5</strong><span>structured paths</span></div></article>
        </section>

        <section className="activityPanel">
          <header><div><small>LEARNING RHYTHM</small><h2>Your recent activity</h2></div><span>Last 6 weeks</span></header>
          <div className="activityChart" aria-label="Decorative learning activity chart">
            {activity.map((level, index) => <i key={index} data-level={level} />)}
          </div>
          <footer><span>Less</span><i data-level="1" /><i data-level="2" /><i data-level="3" /><i data-level="4" /><span>More</span></footer>
        </section>

        <section className="discovery" id="module-grid">
          <header><div><small>EXPLORE THE LIBRARY</small><h2>Choose your next direction</h2></div><p>Start with a discipline, then move through its courses and articles in order.</p></header>
          <div className="dashboardModuleGrid">
            {modules.map((module) => (
              <button
                key={module.id}
                aria-busy={openingModule === module.id}
                disabled={Boolean(openingModule)}
                onPointerEnter={() => preloadModuleComponent(module.id)}
                onPointerDown={() => preloadModuleComponent(module.id)}
                onFocus={() => preloadModuleComponent(module.id)}
                onClick={() => openModule(module.id)}
                style={{ "--module-accent": module.accent }}
              >
                <span><i>{module.icon}</i><small>{module.groups.reduce((count, group) => count + group.tracks.length, 0)} COURSES</small></span>
                <strong>{module.name}</strong>
                <p>{module.description}</p>
                <em>{openingModule === module.id ? "OPENING…" : "EXPLORE →"}</em>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
