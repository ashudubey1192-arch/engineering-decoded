import { lazy } from "react";

const moduleFiles = import.meta.glob(["./*/jsx/*.jsx", "!./brand/jsx/*.jsx"]);
const courseFiles = import.meta.glob("./*/*/jsx/Course.jsx");
const componentCache = new Map();
const systemDesignTracks = new Set([
  "system-design-fundamentals",
  "high-level-design",
  "low-level-design",
]);

function getCourseModuleDirectory(moduleId, trackSlug) {
  return moduleId === "architecture" && systemDesignTracks.has(trackSlug)
    ? "system-design"
    : moduleId;
}

function getLazyComponent(path, loader) {
  if (!loader) return null;
  if (!componentCache.has(path)) componentCache.set(path, lazy(loader));
  return componentCache.get(path);
}

export function getModuleComponent(moduleId) {
  const entry = Object.entries(moduleFiles).find(([path]) => path.startsWith(`./${moduleId}/jsx/`));
  return entry ? getLazyComponent(entry[0], entry[1]) : null;
}

export function preloadModuleComponent(moduleId) {
  const entry = Object.entries(moduleFiles).find(([path]) => path.startsWith(`./${moduleId}/jsx/`));
  return entry?.[1]?.();
}

export function getCourseComponent(moduleId, trackSlug) {
  const directory = getCourseModuleDirectory(moduleId, trackSlug);
  const path = `./${directory}/${trackSlug}/jsx/Course.jsx`;
  return getLazyComponent(path, courseFiles[path]);
}

export function preloadCourseComponent(moduleId, trackSlug) {
  const directory = getCourseModuleDirectory(moduleId, trackSlug);
  return courseFiles[`./${directory}/${trackSlug}/jsx/Course.jsx`]?.();
}
