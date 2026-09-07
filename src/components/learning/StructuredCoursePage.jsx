import { useState } from "react";
import { preloadArticleComponent } from "../articles/registry";
import "./StructuredCoursePage.css";

export default function StructuredCoursePage({ module, track, sections, navigate }) {
  const storageKey = `${track.slug}Section`;
  const lessonCount = sections.reduce((total, item) => total + item.lessons.length, 0);
  const [openSection, setOpenSection] = useState(
    () => window.sessionStorage.getItem(storageKey) || sections[0]?.slug,
  );

  return (
    <main className="structuredCourse" style={{ "--course-accent": module.accent }}>
      <header>
        <button onClick={() => navigate(`/learn/${module.id}`)}>← {module.name}</button>
        <small>SYSTEM DESIGN / COURSE</small>
        <h1>{track.name}</h1>
        <p>{lessonCount} focused lessons arranged in an ordered learning path.</p>
      </header>
      <section className="structuredOutline">
        {sections.map((group, groupIndex) => (
          <details
            id={group.slug}
            key={group.slug}
            open={openSection === group.slug}
            onToggle={(event) => {
              if (event.currentTarget.open) {
                setOpenSection(group.slug);
                window.sessionStorage.setItem(storageKey, group.slug);
              }
            }}
          >
            <summary>
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <strong>{group.title}</strong>
              <small>{group.lessons.length} pages</small>
            </summary>
            <nav>
              {group.lessons.map((lesson, lessonIndex) => (
                <button
                  key={lesson.slug}
                  onMouseEnter={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onFocus={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onPointerDown={() => preloadArticleComponent(module.id, track.slug, lesson.slug)}
                  onClick={() => {
                    window.sessionStorage.setItem(storageKey, group.slug);
                    navigate(`/learn/${module.id}/${track.slug}/${lesson.slug}`);
                  }}
                >
                  <span>{String(lessonIndex + 1).padStart(2, "0")}</span>
                  <b>{lesson.title}</b>
                  <small>{lesson.time}</small>
                  <i>→</i>
                </button>
              ))}
            </nav>
          </details>
        ))}
      </section>
    </main>
  );
}
