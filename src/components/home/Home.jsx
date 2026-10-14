import { useEffect, useMemo, useState } from "react";
import { preloadModuleComponent } from "../registry";
import { modules } from "../../data/catalog";
import "./Home.css";
import { api, getSession } from "../../services/api";

export default function Home({ navigate }) {
  const [openingModule, setOpeningModule] = useState(null);
  const [moduleQuery, setModuleQuery] = useState("");
  const user = getSession()?.user;
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setSummary(null);
    setError("");
    if (user?.id)
      api("/progress/summary")
        .then((data) => {
          if (active) setSummary(data);
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    return () => {
      active = false;
    };
  }, [user?.id]);
  const recent = summary?.recentArticle;
  const recentModule = modules.find((module) => module.id === recent?.moduleSlug);
  const recentCourse = recentModule?.groups
    .flatMap((group) => group.tracks)
    .find((track) => track.slug === recent?.courseSlug);
  const metric = (key) => (summary ? summary[key] : user ? "—" : 0);
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
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 18
        ? "Good afternoon"
        : "Good evening";

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
          <div>
            <small>YOUR LIBRARY</small>
            <strong>Learning map</strong>
          </div>
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
              <i>{module.icon}</i>
              <span>{module.name}</span>
              <b>›</b>
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboardContent">
        <header className="dashboardWelcome">
          <div>
            <small>ENGINEERING DECODED · LEARNING DASHBOARD</small>
            <h1>
              {greeting}
              {user?.displayName ? `, ${user.displayName}` : ""}.
            </h1>
            <p>Keep building depth—one focused lesson at a time.</p>
          </div>
          <blockquote>
            <span>“</span>
            <p>Strong engineers connect fundamentals to decisions.</p>
            <cite>Today&apos;s learning note</cite>
          </blockquote>
        </header>

        {error && <p role="alert">Could not load your progress: {error}</p>}
        {!user && (
          <p>
            <button onClick={() => navigate("/login")}>Sign in</button> to save your learning
            progress.
          </p>
        )}
        {user && !summary && !error && <p role="status">Loading your learning progress…</p>}
        <section className="dashboardLeadGrid">
          <article className="continuePanel">
            <header>
              <small>CONTINUE LEARNING</small>
              <span>{recent ? `${recent.progressPercent}% OF LESSON` : "YOUR NEXT STEP"}</span>
            </header>
            <div className="continueBody">
              <span className="continueIcon">{recentModule?.icon || "→"}</span>
              <div>
                <p>{recentModule?.name || "Explore the library"}</p>
                <h2>{recentCourse?.name || "Choose a course"}</h2>
                <small>
                  {recent
                    ? recent.articleSlug.replaceAll("-", " ")
                    : "Your saved lessons will appear here."}
                </small>
              </div>
              <button
                onClick={() =>
                  navigate(
                    recentCourse
                      ? `/learn/${recent.moduleSlug}/${recent.courseSlug}/${recent.articleSlug}`
                      : "/courses",
                  )
                }
              >
                {recentCourse ? "Continue" : "Browse courses"} →
              </button>
            </div>
            <div className="progressTrack">
              <i style={{ width: `${recent?.progressPercent || 0}%` }} />
            </div>
            <footer>
              <span>{metric("trackedArticles")} lessons explored</span>
              <span>{totalCourses} courses available</span>
            </footer>
          </article>
          <article className="focusPanel">
            <small>WEEKLY FOCUS · MON–SUN (UTC)</small>
            <div
              className="focusRing"
              style={{
                background: `radial-gradient(circle, var(--surface) 57%, transparent 59%), conic-gradient(#f5b84b ${((summary?.weeklyDays || 0) / 7) * 100}%, var(--surface-2) 0)`,
              }}
            >
              <span>{metric("weeklyDays")}</span>
              <small>days</small>
            </div>
            <h3>{metric("streak")} day streak</h3>
            <p>Save lesson progress or complete a course to build consistency.</p>
          </article>
        </section>
        <section className="metricGrid" aria-label="Learning statistics">
          <article>
            <i className="metricGreen">◎</i>
            <div>
              <strong>{metric("completedCourses")}</strong>
              <span>completed courses</span>
            </div>
          </article>
          <article>
            <i className="metricBlue">▦</i>
            <div>
              <strong>{metric("completedArticles")}</strong>
              <span>completed lessons</span>
            </div>
          </article>
          <article>
            <i className="metricOrange">◇</i>
            <div>
              <strong>{metric("trackedArticles")}</strong>
              <span>lessons explored</span>
            </div>
          </article>
          <article>
            <i className="metricPurple">↗</i>
            <div>
              <strong>{metric("streak")}</strong>
              <span>day learning streak</span>
            </div>
          </article>
        </section>
        <section className="activityPanel">
          <header>
            <div>
              <small>LEARNING RHYTHM</small>
              <h2>Your recent activity</h2>
            </div>
            <span>Last 6 weeks · UTC</span>
          </header>
          <div className="activityChart" aria-label="Saved learning days over the last six weeks">
            {(summary?.activity || []).map((day) => (
              <i
                key={day.date}
                data-level={day.active ? 4 : 0}
                title={`${day.date}: ${day.active ? "Learning activity saved" : "No activity"}`}
              />
            ))}
          </div>
          <footer>
            <span>Each highlighted day has saved learning activity.</span>
          </footer>
        </section>

        <section className="discovery" id="module-grid">
          <header>
            <div>
              <small>EXPLORE THE LIBRARY</small>
              <h2>Choose your next direction</h2>
            </div>
            <p>Start with a discipline, then move through its courses and articles in order.</p>
          </header>
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
                <span>
                  <i>{module.icon}</i>
                  <small>
                    {module.groups.reduce((count, group) => count + group.tracks.length, 0)} COURSES
                  </small>
                </span>
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
