import { useState } from "react";
import { modules } from "../../data/catalog";
import { preloadCourseComponent } from "../registry";
import "./Courses.css";

const totalCourses = modules.reduce(
  (total, module) =>
    total + module.groups.reduce((count, group) => count + group.tracks.length, 0),
  0,
);

export default function Courses({ navigate }) {
  const [openingCourse, setOpeningCourse] = useState(null);

  const openCourse = async (moduleId, trackSlug) => {
    const key = `${moduleId}-${trackSlug}`;
    if (openingCourse) return;
    setOpeningCourse(key);
    try {
      await preloadCourseComponent(moduleId, trackSlug);
      navigate(`/learn/${moduleId}/${trackSlug}`, { scrollBehavior: "smooth" });
    } finally {
      setOpeningCourse(null);
    }
  };

  return (
    <main className="coursesPage">
      <header className="coursesHero">
        <small>ENGINEERING DECODED · COURSE LIBRARY</small>
        <h1>Courses</h1>
        <p>
          Follow focused learning paths across software architecture, programming, infrastructure,
          communication, and engineering leadership.
        </p>
        <div><span>{totalCourses} courses</span><span>{modules.length} disciplines</span><span>Beginner to advanced</span></div>
      </header>

      <section className="featuredCourses">
        <header><div><small>RECOMMENDED START</small><h2>Core engineering paths</h2></div><p>Strong foundations for designing and building production software.</p></header>
        <div className="featuredCourseGrid">
          {[
            ["architecture", "system-design-fundamentals"],
            ["architecture", "high-level-design"],
            ["architecture", "low-level-design"],
            ["backend", "java"],
            ["frontend", "react"],
            ["dsa", "dynamic-programming"],
          ].map(([moduleId, trackSlug], index) => {
            const module = modules.find((item) => item.id === moduleId);
            const track = module?.groups.flatMap((group) => group.tracks).find((item) => item.slug === trackSlug);
            if (!module || !track) return null;
            const key = `${moduleId}-${trackSlug}`;
            return (
              <button
                key={key}
                aria-busy={openingCourse === key}
                onPointerEnter={() => preloadCourseComponent(moduleId, trackSlug)}
                onPointerDown={() => preloadCourseComponent(moduleId, trackSlug)}
                onFocus={() => preloadCourseComponent(moduleId, trackSlug)}
                onClick={() => openCourse(moduleId, trackSlug)}
                style={{ "--card-accent": module.accent }}
              >
                <span className={`courseArtwork artwork${index % 3}`}>
                  <i>{module.icon}</i><b /><b /><b /><em /><em />
                </span>
                <span className="featuredCourseBody">
                  <small>{module.name}</small>
                  <strong>{track.name}</strong>
                  <p>{module.description}</p>
                  <em>{openingCourse === key ? "OPENING…" : "START COURSE →"}</em>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="allCourses">
        <header><small>FULL CATALOGUE</small><h2>Explore every discipline</h2></header>
        {modules.map((module, moduleIndex) => (
          <section className="courseCollection" key={module.id} style={{ "--card-accent": module.accent }}>
            <header>
              <span>{String(moduleIndex + 1).padStart(2, "0")}</span>
              <div><h3>{module.name}</h3><p>{module.description}</p></div>
              <button onClick={() => navigate(`/learn/${module.id}`, { scrollBehavior: "smooth" })}>View module →</button>
            </header>
            <div>
              {module.groups.flatMap((group) =>
                group.tracks.map((track) => {
                  const key = `${module.id}-${track.slug}`;
                  return (
                    <button
                      key={track.slug}
                      onPointerEnter={() => preloadCourseComponent(module.id, track.slug)}
                      onFocus={() => preloadCourseComponent(module.id, track.slug)}
                      onClick={() => openCourse(module.id, track.slug)}
                    >
                      <span>{module.icon}</span>
                      <div><small>{group.name}</small><strong>{track.name}</strong></div>
                      <i>{openingCourse === key ? "…" : "→"}</i>
                    </button>
                  );
                }),
              )}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
