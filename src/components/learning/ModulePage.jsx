import { preloadCourseComponent } from "../registry";
import { articleTemplates } from "../../data/catalog";
import { getStructuredCourseArticles } from "../../data/structuredCourses";
import "./ModulePage.css";

export default function ModulePage({ module, navigate, introContent }) {
  if (!module)
    return (
      <main className="notFound">
        <h1>Module not found</h1>
        <button onClick={() => navigate("/")}>Back home</button>
      </main>
    );

  return (
    <main className="modulePage" style={{ "--course-accent": module.accent }}>
      <button className="backLink" onClick={() => navigate("/")}>
        ← All modules
      </button>
      <header className="moduleIntro">
        <span className="moduleBadge">{module.icon}</span>
        <div>
          <small>LEARNING MODULE</small>
          <h1>{module.name}</h1>
          <p>
            {module.description} {module.groups.every((group) => group.tracks.every((track) => track.outline))
              ? "Choose a course below to explore its planned structure."
              : "Choose a focused course below and work through its articles in sequence."}
          </p>
        </div>
        <aside>
          <b>{module.groups.reduce((count, group) => count + group.tracks.length, 0)}</b>
          <span>COURSES</span>
        </aside>
      </header>
      {introContent}
      {module.groups.map((group, index) => (
        <section className="courseGroup" key={group.name}>
          <header>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{group.name}</h2>
              <p>Structured from foundations to production use.</p>
            </div>
          </header>
          <div className="courseCards">
            {group.tracks.map((track, trackIndex) => (
              <button
                key={track.slug}
                className="courseCard"
                onMouseEnter={() => preloadCourseComponent(module.id, track.slug)}
                onFocus={() => preloadCourseComponent(module.id, track.slug)}
                onClick={() => navigate(`/learn/${module.id}/${track.slug}`)}
              >
                <span className="courseArtwork">
                  <i>{track.name.slice(0, 2).toUpperCase()}</i>
                  <b>{trackIndex + 1}</b>
                  <em>01</em>
                  <em>02</em>
                  <em>03</em>
                </span>
                <span className="courseInfo">
                  <small>{track.outline ? `${track.outline.length} SECTIONS · COURSE OUTLINE` : `${getStructuredCourseArticles(module.id, track.slug)?.length ?? articleTemplates.length} ARTICLES · SELF PACED`}</small>
                  <strong>{track.name}</strong>
                  <p>
                    {track.outline ? `${track.language}. Explore the planned course structure.` : module.id === "dsa" ? `Learn ${track.name} with worked examples, executable code, step-by-step visuals, complexity analysis, and practice.` : `Learn ${track.name} through clear concepts, practical examples, projects, and interview preparation.`}
                  </p>
                  <i>{track.outline ? "VIEW OUTLINE ↗" : "START COURSE ↗"}</i>
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
