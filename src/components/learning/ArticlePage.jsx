import { useEffect, useState } from "react";
import { articleTemplates } from "../../data/catalog";
import {
  getStructuredCourseArticles,
  getStructuredCourseSections,
} from "../../data/structuredCourses";
import { getArticleComponent, preloadArticleComponent } from "../articles/registry";
import "./ArticlePage.css";
import { saveArticleProgress } from "../../services/api";

function GenericArticle({ track }) {
  return (
    <div className="genericArticle">
      <section id="overview">
        <p className="lead">
          This dedicated {track.name} article is ready for your technical content.
        </p>
        <p>
          Create a new JSX component for this route when you are ready to write it. The shared
          reader, navigation, progress, and next-article behavior will continue to work
          automatically.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Document the stable mental models, terminology, constraints, and trade-offs that engineers
          need to understand.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <pre>
          <code>{`// Add a focused ${track.name} example here\nconst lesson = { status: "ready" };`}</code>
        </pre>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>Explain the failure modes that occur most often in real projects.</p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>When would you use {track.name}, and what alternative would you compare it with?</p>
        </div>
      </section>
    </div>
  );
}

export default function ArticlePage({ module, track, articleSlug, navigate }) {
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState([]);
  const structuredSections = getStructuredCourseSections(module?.id, track?.slug);
  const articles = getStructuredCourseArticles(module?.id, track?.slug) || articleTemplates;
  const article = articles.find((item) => item.slug === articleSlug) || articles[0];
  const index = articles.findIndex((item) => item.slug === article.slug);
  const next = articles[index + 1];
  const isStructuredCourse = Boolean(structuredSections);
  const currentSection = isStructuredCourse
    ? structuredSections.find((item) => item.slug === article.sectionSlug)
    : null;

  useEffect(() => {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max ? Math.min(100, (scrollY / max) * 100) : 0);
    };
    updateProgress();
    addEventListener("scroll", updateProgress, { passive: true });
    return () => removeEventListener("scroll", updateProgress);
  }, [articleSlug]);

  useEffect(() => {
    if (!module || !track || !next) return;
    const timer = window.setTimeout(
      () => preloadArticleComponent(module.id, track.slug, next.slug),
      120,
    );
    return () => window.clearTimeout(timer);
  }, [module, track, next]);

  if (!module || !track)
    return (
      <main className="notFound">
        <h1>Article not found</h1>
        <button onClick={() => navigate("/")}>Back home</button>
      </main>
    );

  const DedicatedArticle = getArticleComponent(module.id, track.slug, article.slug);
  const coursePath = `/learn/${module.id}/${track.slug}`;
  const openArticle = (slug) => navigate(`/learn/${module.id}/${track.slug}/${slug}`);
  const preloadArticle = (slug) => preloadArticleComponent(module.id, track.slug, slug);
  const persistProgress = (completed = false) =>
    saveArticleProgress({
      moduleSlug: module.id,
      courseSlug: track.slug,
      sectionSlug: article.sectionSlug || "course",
      articleSlug: article.slug,
      progressPercent: completed ? 100 : Math.max(1, Math.round(progress)),
      lastPosition: Math.max(0, Math.round(window.scrollY)),
      completed,
    }).catch(() => null);

  return (
    <main className="reader" style={{ "--course-accent": module.accent }}>
      <div className="readProgress" style={{ width: `${progress}%` }} />
      <aside className="chapterNav">
        <button onClick={() => navigate(`/learn/${module.id}/${track.slug}`)}>
          ← Course overview
        </button>
        <div>
          <small>{module.name}</small>
          <h2>{track.name}</h2>
          <span>
            {index + 1} / {articles.length} ARTICLES
          </span>
          <i>
            <b style={{ width: `${((index + 1) / articles.length) * 100}%` }} />
          </i>
        </div>
        {isStructuredCourse ? (
          <nav className="groupedChapterNav">
            {structuredSections.map((section, sectionIndex) => {
              const isCurrentSection = section.slug === currentSection?.slug;
              const isExpanded = isCurrentSection || expandedSections.includes(section.slug);
              return (
                <section className={isExpanded ? "open" : ""} key={section.slug}>
                  <button
                    className="sectionLink"
                    onClick={() => {
                      if (isCurrentSection) return;
                      setExpandedSections((current) =>
                        current.includes(section.slug)
                          ? current.filter((slug) => slug !== section.slug)
                          : [...current, section.slug],
                      );
                    }}
                    aria-expanded={isExpanded}
                  >
                    <span>{String(sectionIndex + 1).padStart(2, "0")}</span>
                    <b>{section.title}</b>
                    <i>{section.lessons.length}</i>
                  </button>
                  {isExpanded && (
                    <div>
                      {section.lessons.map((item, lessonIndex) => (
                        <button
                          className={item.slug === article.slug ? "active" : ""}
                          key={item.slug}
                          onMouseEnter={() => preloadArticle(item.slug)}
                          onFocus={() => preloadArticle(item.slug)}
                          onPointerDown={() => preloadArticle(item.slug)}
                          onClick={() => openArticle(item.slug)}
                        >
                          <span>{String(lessonIndex + 1).padStart(2, "0")}</span>
                          <b>{item.title}</b>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>
        ) : (
          <nav>
            {articles.map((item, itemIndex) => (
              <button
                className={item.slug === article.slug ? "active" : ""}
                key={item.slug}
                onMouseEnter={() => preloadArticle(item.slug)}
                onFocus={() => preloadArticle(item.slug)}
                onPointerDown={() => preloadArticle(item.slug)}
                onClick={() => openArticle(item.slug)}
              >
                <span>{itemIndex < index ? "✓" : String(itemIndex + 1).padStart(2, "0")}</span>
                <b>{item.title}</b>
              </button>
            ))}
          </nav>
        )}
      </aside>
      <article className="article">
        <header>
          <div className="crumbs">
            <button onClick={() => navigate(`/learn/${module.id}`)}>{module.name}</button>
            <span>/</span>
            <button onClick={() => navigate(`/learn/${module.id}/${track.slug}`)}>
              {track.name}
            </button>
            {currentSection && (
              <>
                <span>/</span>
                <button onClick={() => navigate(coursePath)}>{currentSection.title}</button>
              </>
            )}
          </div>
          <h1>{article.title}</h1>
          <div className="articleMeta">
            <span>▷ {article.time} read</span>
            <span>◆ Updated Aug 2026</span>
            <button onClick={() => persistProgress(true)}>✓ MARK COMPLETE</button>
          </div>
        </header>
        {DedicatedArticle ? <DedicatedArticle article={article} /> : <GenericArticle track={track} />}
        {next && (
          <button
            className="nextArticle"
            onMouseEnter={() => preloadArticle(next.slug)}
            onFocus={() => preloadArticle(next.slug)}
            onPointerDown={() => preloadArticle(next.slug)}
            onClick={() => {
              persistProgress(true);
              openArticle(next.slug);
            }}
          >
            <span>NEXT ARTICLE</span>
            <b>{next.title}</b>
            <i>→</i>
          </button>
        )}
      </article>
      <aside className="articleToc">
        <small>READING PROGRESS</small>
        <i>
          <b style={{ width: `${progress}%` }} />
        </i>
        <span>{Math.round(progress)}%</span>
        <h3>On this page</h3>
        <a href="#overview">Overview</a>
        <a href="#concepts">Core concepts</a>
        <a href="#example">Practical example</a>
        <a href="#mistakes">Common mistakes</a>
        <a href="#check">Knowledge check</a>
      </aside>
    </main>
  );
}
