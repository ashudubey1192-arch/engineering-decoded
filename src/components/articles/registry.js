import { lazy } from "react";

const articleFiles = import.meta.glob("../*/*/jsx/*.jsx");
const slugByFile = {
  Introduction: "introduction",
  CoreConcepts: "core-concepts",
  Architecture: "architecture",
  PracticalGuide: "practical-guide",
  BestPractices: "best-practices",
  InterviewQuestions: "interview-questions",
};
const componentCache = new Map();

function getArticlePath(moduleId, trackSlug, articleSlug) {
  const file = Object.entries(slugByFile).find(([, slug]) => slug === articleSlug)?.[0];
  return `../${moduleId}/${trackSlug}/jsx/${file}.jsx`;
}

export function getArticleComponent(moduleId, trackSlug, articleSlug) {
  const path = getArticlePath(moduleId, trackSlug, articleSlug);
  const loader = articleFiles[path];
  if (!loader) return null;
  if (!componentCache.has(path)) componentCache.set(path, lazy(loader));
  return componentCache.get(path);
}

export function preloadArticleComponent(moduleId, trackSlug, articleSlug) {
  return articleFiles[getArticlePath(moduleId, trackSlug, articleSlug)]?.();
}
