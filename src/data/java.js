import { javaStructureSections } from "./javaStructureLessons.js";
import { javaNetworkSections } from "./javaNetworkLessons.js";
import coreJavaOutline from "./coreJava/outline.js";
import { coreJavaAliases } from "./coreJava/aliases.js";

// Core Java sections are generated from src/data/coreJava/sections/*.js by
// scripts/build-core-java.mjs. The hand-built data-structure and networking sections
// follow the Core Java "Data Structures" section.
const coreSections = coreJavaOutline.map((section) => ({
  ...section,
  lessons: section.lessons.map((lesson) => ({ ...lesson, sectionSlug: section.slug })),
}));

const insertAfter = coreSections.findIndex((section) => section.slug === "data-structures");
const at = insertAfter === -1 ? coreSections.length : insertAfter + 1;

export const javaSections = [
  ...coreSections.slice(0, at),
  ...javaStructureSections,
  ...javaNetworkSections,
  ...coreSections.slice(at),
];

export const javaArticles = javaSections.flatMap((item) => item.lessons);

export const javaAliases = coreJavaAliases;
