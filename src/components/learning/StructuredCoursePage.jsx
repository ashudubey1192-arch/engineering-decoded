import { useState } from "react";
import { preloadArticleComponent } from "../articles/registry";
import "./StructuredCoursePage.css";

export default function StructuredCoursePage({ module, track, sections, navigate }) {
  const storageKey = `${track.slug}Section`;
  const lessonCount = sections.reduce((total, item) => total + item.lessons.length, 0);
  // The open section is remembered per course: "" means the reader collapsed everything,
  // no entry means a first visit (open the first section).
  const [openSection, setOpenSection] = useState(() => {
    let stored = null;
    try { stored = window.sessionStorage.getItem(storageKey); } catch { /* storage unavailable */ }
    return stored === null ? sections[0]?.slug : stored || null;
  });
  const remember = (slug) => {
    try { window.sessionStorage.setItem(storageKey, slug || ""); } catch { /* storage unavailable */ }
  };
  // Clicking an open section collapses it; clicking a closed one opens it (and closes the rest).
  const toggleSection = (slug) => {
    const nextOpen = openSection === slug ? null : slug;
    setOpenSection(nextOpen);
    remember(nextOpen);
  };

  return (
    <main className="structuredCourse" style={{ "--course-accent": module.accent }}>
      <header>
        <button onClick={() => navigate(`/learn/${module.id}`)}>← {module.name}</button>
        <small>{module.name.toUpperCase()} / COURSE</small>
        <h1>{track.name}</h1>
        <p>{lessonCount} focused lessons arranged in an ordered learning path.</p>
      </header>
      <section className="structuredOutline">
        {sections.map((group, groupIndex) => (
          <details
            id={group.slug}
            key={group.slug}
            open={openSection === group.slug}
          >
            <summary
              onClick={(event) => {
                event.preventDefault();          // React state, not the browser, decides open/closed
                toggleSection(group.slug);
              }}
            >
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <strong>{group.title}</strong>
              <small>{group.lessons.length} pages</small>
            </summary>
            <nav>
              {group.lessons.map((lesson, lessonIndex) => [
                lesson.group && lesson.group !== group.lessons[lessonIndex - 1]?.group && (
                  <h3 className="structuredLessonGroup" key={`group-${lesson.group}`}>
                    {lesson.group}
                    <small>
                      {(count => `${count} ${count === 1 ? "page" : "pages"}`)(group.lessons.filter((item) => item.group === lesson.group).length)}
                    </small>
                  </h3>
                ),
                <button
                  key={lesson.slug}
                  onMouseEnter={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onFocus={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onPointerDown={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onClick={() => {
                    setOpenSection(group.slug);
                    remember(group.slug);
                    navigate(`/learn/${module.id}/${track.slug}/${lesson.slug}`);
                  }}
                >
                  <span>{String(lessonIndex + 1).padStart(2, "0")}</span>
                  <b>{lesson.title}</b>
                  <small>{lesson.time}</small>
                  <i>→</i>
                </button>,
              ])}
            </nav>
          </details>
        ))}
      </section>
    </main>
  );
}
