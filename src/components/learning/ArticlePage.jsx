import { lazy, Suspense, useEffect, useState } from "react";
import { articleTemplates } from "../../data/catalog";
import {
  getStructuredCourseArticles,
  getStructuredCourse,
  getStructuredCourseSections,
} from "../../data/structuredCourses";
import { getArticleComponent, preloadArticleComponent } from "../articles/registry";
import "./ArticlePage.css";
import { saveArticleProgress } from "../../services/api";
import { dsaLessonKey, updateDsaProgress, useDsaProgress } from "../../services/dsaProgress.js";
import SystemDesignAnimation from './SystemDesignAnimation';
const ConceptAnimation = lazy(() => import('./ConceptAnimation'));
const SystemDesignQuiz = lazy(() => import('./SystemDesignQuiz'));

export default function ArticlePage({ module, track, articleSlug, navigate }) {
  const dsaProgress = useDsaProgress();
  const [progress, setProgress] = useState(0);
  const [expandedSections, setExpandedSections] = useState([]);
  const structuredSections = getStructuredCourseSections(module?.id, track?.slug);
  const articles = getStructuredCourseArticles(module?.id, track?.slug) || articleTemplates;
  const canonicalSlug = getStructuredCourse(module?.id, track?.slug)?.aliases?.[articleSlug] || articleSlug;
  const article = articles.find((item) => item.slug === canonicalSlug);
  const index = articles.findIndex((item) => item.slug === article?.slug);
  const next = articles[index + 1];
  const isStructuredCourse = Boolean(structuredSections);
  const currentSection = isStructuredCourse
    ? structuredSections.find((item) => item.slug === article?.sectionSlug)
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

  if (!module || !track || !article)
    return (
      <main className="notFound">
        <h1>Article not found</h1>
        <button onClick={() => navigate("/")}>Back home</button>
      </main>
    );

  const DedicatedArticle = getArticleComponent(module.id, track.slug, article.slug);
  const quizKey = `${track.slug}/${article.slug}`;
  const hasConceptQuiz = ['system-design-fundamentals', 'high-level-design', 'low-level-design'].includes(track.slug);
  const showAnimation = track.slug === 'system-design-fundamentals' && article.slug === 'welcome--course-introduction';
  const coursePath = `/learn/${module.id}/${track.slug}`;
  const openArticle = (slug) => navigate(`/learn/${module.id}/${track.slug}/${slug}`);
  const preloadArticle = (slug) => preloadArticleComponent(module.id, track.slug, slug);
  const persistProgress = (completed = false) => {
    if (module.id === "dsa" && completed) updateDsaProgress("lessons", dsaLessonKey(track.slug, article.slug), true);
    return saveArticleProgress({
      moduleSlug: module.id,
      courseSlug: track.slug,
      sectionSlug: article.sectionSlug || "course",
      articleSlug: article.slug,
      progressPercent: completed ? 100 : Math.max(1, Math.round(progress)),
      lastPosition: Math.max(0, Math.round(window.scrollY)),
      completed,
    }).catch(() => null);
  };

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
                <section
                  className={[isExpanded ? "open" : "", isCurrentSection ? "current" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  key={section.slug}
                >
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
            <button onClick={() => persistProgress(true)}>{module.id === "dsa" && dsaProgress.lessons[dsaLessonKey(track.slug, article.slug)] === true ? "✓ COMPLETED" : "✓ MARK COMPLETE"}</button>
          </div>
        </header>
        {showAnimation && <SystemDesignAnimation />}
        {hasConceptQuiz && !showAnimation && <Suspense fallback={<p>Loading concept visualization…</p>}><ConceptAnimation key={quizKey} lessonKey={quizKey} /></Suspense>}
        {DedicatedArticle ? <DedicatedArticle key={`${module.id}/${track.slug}/${article.slug}`} article={article} module={module} track={track} /> : <p>This lesson could not be loaded. Return to the course outline and try again.</p>}
        {hasConceptQuiz && <Suspense fallback={<p>Loading quiz…</p>}><SystemDesignQuiz key={quizKey} title={article.title} lessonKey={quizKey} /></Suspense>}
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
        {module.id === "dsa" && <>
          <a href="#coding-practice">Coding practice</a>
          <a href="#learning-paths">Learning paths</a>
          <a href="#spaced-revision">Spaced revision</a>
          <a href="#interview-mode">Interview mode</a>
          <a href="#java-practice">Java practice</a>
          <a href="#interactive-playground">Experiment and compare</a>
          <a href="#concept-diagrams">Structure diagrams</a>
        </>}
        <a href="#mistakes">Common mistakes</a>
        <a href="#check">Knowledge check</a>
        {hasConceptQuiz && <a href="#concept-quiz">Quiz</a>}
        {hasConceptQuiz && !showAnimation && <a href="#concept-animation">Visual walkthrough</a>}
      </aside>
    </main>
  );
}
