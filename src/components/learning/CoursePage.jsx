import { useEffect } from "react";
import { articleTemplates } from "../../data/catalog";
import { preloadArticleComponent } from "../articles/registry";
import { getStructuredCourseSections } from "../../data/structuredCourses";
import StructuredCoursePage from "./StructuredCoursePage";
import CourseOutlinePage from "./CourseOutlinePage";
import "./CoursePage.css";

export default function CoursePage({ module, track, navigate }) {
  const structuredSections = track ? getStructuredCourseSections(module?.id, track.slug) : null;
  useEffect(() => {
    if (!module || !track || structuredSections || track.outline) return undefined;
    const timer = window.setTimeout(() => {
      articleTemplates.forEach((article) =>
        preloadArticleComponent(module.id, track.slug, article.slug),
      );
    }, 180);
    return () => window.clearTimeout(timer);
  }, [module, track, structuredSections]);

  if (!module || !track)
    return (
      <main className="notFound">
        <h1>Course not found</h1>
        <button onClick={() => navigate("/")}>Back home</button>
      </main>
    );

  if (track.outline) return <CourseOutlinePage module={module} track={track} navigate={navigate} />;

  if (structuredSections) {
    return (
      <StructuredCoursePage
        module={module}
        track={track}
        sections={structuredSections}
        navigate={navigate}
      />
    );
  }

  const openArticle = (slug) => navigate(`/learn/${module.id}/${track.slug}/${slug}`);
  const preloadArticle = (slug) => preloadArticleComponent(module.id, track.slug, slug);

  return (
    <main className="coursePage" style={{ "--course-accent": module.accent }}>
      <aside className="courseSidebar">
        <button onClick={() => navigate(`/learn/${module.id}`)}>← {module.name}</button>
        <div className="courseIdentity">
          <span>{module.icon}</span>
          <small>COURSE</small>
          <h2>{track.name}</h2>
          <p>0 of {articleTemplates.length} complete</p>
          <i>
            <b style={{ width: "0%" }} />
          </i>
        </div>
        <nav>
          {articleTemplates.map((article, index) => (
            <button
              key={article.slug}
              onMouseEnter={() => preloadArticle(article.slug)}
              onFocus={() => preloadArticle(article.slug)}
              onClick={() => openArticle(article.slug)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{article.title}</b>
              <i>○</i>
            </button>
          ))}
        </nav>
      </aside>
      <section className="courseMain">
        <button className="backMobile" onClick={() => navigate(`/learn/${module.id}`)}>
          ← {module.name}
        </button>
        <header>
          <small>{module.name.toUpperCase()} / COURSE</small>
          <h1>{track.name}</h1>
          <p>
            Build a durable understanding of {track.name} through focused articles, practical
            examples, and guided practice.
          </p>
          <div>
            <span>6 articles</span>
            <span>~90 minutes</span>
            <span>Beginner → Advanced</span>
          </div>
        </header>
        <section className="learningOutcomes">
          <small>WHAT YOU&apos;LL LEARN</small>
          <div>
            <p>
              <b>01</b>Understand the core mental models and terminology.
            </p>
            <p>
              <b>02</b>Recognize architecture choices and common trade-offs.
            </p>
            <p>
              <b>03</b>Build a practical implementation from first principles.
            </p>
            <p>
              <b>04</b>Prepare for real technical interview questions.
            </p>
          </div>
        </section>
        <section className="articleList">
          <header>
            <h2>Course articles</h2>
            <span>{articleTemplates.length} CHAPTERS</span>
          </header>
          {articleTemplates.map((article, index) => (
            <button
              key={article.slug}
              onMouseEnter={() => preloadArticle(article.slug)}
              onFocus={() => preloadArticle(article.slug)}
              onClick={() => openArticle(article.slug)}
            >
              <span className="articleNo">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <small>{index < 2 ? "FOUNDATION" : index < 4 ? "PRACTICE" : "MASTERY"}</small>
                <strong>{article.title}</strong>
              </span>
              <em>{article.time}</em>
              <i>→</i>
            </button>
          ))}
        </section>
      </section>
    </main>
  );
}
