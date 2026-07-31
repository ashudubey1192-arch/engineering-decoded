import { lazy } from "react";

const moduleFiles = import.meta.glob(["./*/jsx/*.jsx", "!./brand/jsx/*.jsx"]);
const courseFiles = import.meta.glob("./*/*/jsx/Course.jsx");
const componentCache = new Map();

function getLazyComponent(path, loader) {
  if (!loader) return null;
  if (!componentCache.has(path)) componentCache.set(path, lazy(loader));
  return componentCache.get(path);
}

export function getModuleComponent(moduleId) {
  const entry = Object.entries(moduleFiles).find(([path]) => path.startsWith(`./${moduleId}/jsx/`));
  return entry ? getLazyComponent(entry[0], entry[1]) : null;
}

export function getCourseComponent(moduleId, trackSlug) {
  const path = `./${moduleId}/${trackSlug}/jsx/Course.jsx`;
  return getLazyComponent(path, courseFiles[path]);
}
