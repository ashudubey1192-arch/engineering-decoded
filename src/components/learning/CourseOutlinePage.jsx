import "./CoursePage.css";
import "./CourseOutlinePage.css";

export default function CourseOutlinePage({ module, track, navigate }) {
  return (
    <main className="coursePage courseOutlinePage" style={{ "--course-accent": module.accent }}>
      <aside className="courseSidebar">
        <button onClick={() => navigate(`/learn/${module.id}`)}>← {module.name}</button>
        <div className="courseIdentity">
          <span>{module.icon}</span>
          <small>COURSE OUTLINE</small>
          <h2>{track.name}</h2>
          <p>{track.outline.length} planned sections</p>
        </div>
        <nav aria-label="Course sections">
          {track.outline.map(([title], index) => (
            <a key={title} href={`#section-${index + 1}`}>
              <span>{String(index + 1).padStart(2, "0")}</span> {title}
            </a>
          ))}
        </nav>
      </aside>
      <section className="courseMain">
        <button className="backMobile" onClick={() => navigate(`/learn/${module.id}`)}>← {module.name}</button>
        <header>
          <small>{module.name.toUpperCase()} / COURSE OUTLINE</small>
          <h1>{track.name}</h1>
          <p>{track.language}</p>
          <p>Course structure is ready. Lessons and examples will be added later.</p>
          <div><span>{track.outline.length} sections</span><span>{track.platforms || "Windows · Linux · macOS"}</span></div>
        </header>
        {track.outline.map(([title, ...topics], index) => (
          <section className="learningOutcomes" id={`section-${index + 1}`} key={title}>
            <small>SECTION {String(index + 1).padStart(2, "0")}</small>
            <h2>{title}</h2>
            <ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul>
          </section>
        ))}
      </section>
    </main>
  );
}
