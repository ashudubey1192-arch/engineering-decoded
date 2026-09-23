import { lazy } from "react";
import { getStructuredCourse } from "../../data/structuredCourses";

const articleFiles = import.meta.glob([
  "../*/*/jsx/*.jsx",
  "../*/*/*/jsx/*.jsx",
  "../*/*/*/articles/*/jsx/*.jsx",
]);
const slugByFile = {
  Introduction: "introduction",
  CoreConcepts: "core-concepts",
  Architecture: "architecture",
  PracticalGuide: "practical-guide",
  BestPractices: "best-practices",
  InterviewQuestions: "interview-questions",
};
const componentCache = new Map();
const systemDesignTracks = new Set([
  "system-design-fundamentals",
  "high-level-design",
  "low-level-design",
]);

function getArticlePath(moduleId, trackSlug, articleSlug) {
  const structuredCourse = getStructuredCourse(moduleId, trackSlug);
  if (structuredCourse) {
    const canonicalSlug = structuredCourse.aliases?.[articleSlug] || articleSlug;
    const article = structuredCourse.articles.find((item) => item.slug === canonicalSlug);
    return article
      ? `../${structuredCourse.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`
      : null;
  }
  const file = Object.entries(slugByFile).find(([, slug]) => slug === articleSlug)?.[0];
  const directory =
    moduleId === "architecture" && systemDesignTracks.has(trackSlug) ? "system-design" : moduleId;
  return `../${directory}/${trackSlug}/jsx/${file}.jsx`;
}

export function getArticleComponent(moduleId, trackSlug, articleSlug) {
  const path = getArticlePath(moduleId, trackSlug, articleSlug);
  if (!path) return null;
  const loader = articleFiles[path];
  if (!loader) return null;
  if (!componentCache.has(path)) componentCache.set(path, lazy(loader));
  return componentCache.get(path);
}

export function preloadArticleComponent(moduleId, trackSlug, articleSlug) {
  const path = getArticlePath(moduleId, trackSlug, articleSlug);
  return path ? articleFiles[path]?.() : undefined;
}
