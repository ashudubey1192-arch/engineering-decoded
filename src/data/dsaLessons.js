import { dsaLinearLessons } from "./dsaLinearLessons.js";
import { dsaHierarchyLessons } from "./dsaHierarchyLessons.js";
import { dsaAlgorithmLessons } from "./dsaAlgorithmLessons.js";
export const dsaLessons = { ...dsaLinearLessons, ...dsaHierarchyLessons, ...dsaAlgorithmLessons };
export function getDsaLesson(courseSlug, lessonSlug) {
  return dsaLessons[courseSlug]?.sections
    .flatMap((section) => section.lessons)
    .find((lesson) => lesson.slug === lessonSlug);
}
