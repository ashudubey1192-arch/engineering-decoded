import { javaStructureSections } from "./javaStructureLessons.js";
import { javaNetworkSections } from "./javaNetworkLessons.js";
import coreJavaOutline from "./coreJava/outline.js";
import { coreJavaAliases } from "./coreJava/aliases.js";

// Core Java sections are generated from src/data/coreJava/sections/*.js by
// scripts/build-core-java.mjs. The Core Java "Data Structures" section, the hand-built
// linked list / stack / queue / hash table sections and the tree and graph sections are
// shown as ONE "Java Data Structures" section, split into sub-groups. Each lesson keeps
// its original slug (so links never break) and its original component folder (`folder`).
const coreSections = coreJavaOutline.map((section) => ({
  ...section,
  lessons: section.lessons.map((lesson) => ({ ...lesson, sectionSlug: section.slug })),
}));

export const JAVA_DATA_STRUCTURES = "java-data-structures";

const pools = Object.fromEntries(
  [
    ...coreSections.filter((section) => section.slug === "data-structures"),
    ...javaStructureSections,
    ...javaNetworkSections,
  ].map((section) => [section.slug, section.lessons]),
);
const core = (fragment) => {
  const found = pools["data-structures"].find((lesson) => lesson.slug.includes(fragment));
  if (!found) throw new Error(`Java Data Structures: no core lesson matching ${fragment}`);
  return found;
};

// [group title, lessons] in learning order.
const dataStructureGroups = [
  [
    "Linked lists",
    [
      core("singly-linked-list"),
      core("doubly-linked-list"),
      core("linked-list-tricks"),
      ...pools["java-linked-lists"],
    ],
  ],
  [
    "Stacks",
    [core("stack-array-based"), core("stack-and-queue-implemented"), ...pools["java-stacks"]],
  ],
  ["Queues and deques", [core("queue-priority-queue"), ...pools["java-queues-deques"]]],
  ["Hash tables", pools["java-hash-tables"]],
  ["Trees", [core("binary-tree-traversals"), ...pools["trees-in-java"]]],
  ["Graphs", pools["graph-networks-in-java"]],
];

const dataStructureLessons = dataStructureGroups.flatMap(([group, lessons]) =>
  lessons.map((lesson) => ({
    ...lesson,
    group,
    folder: lesson.folder || lesson.sectionSlug,
    sectionSlug: JAVA_DATA_STRUCTURES,
  })),
);
const usedSlugs = new Set(dataStructureLessons.map((lesson) => lesson.slug));
for (const lesson of pools["data-structures"])
  if (!usedSlugs.has(lesson.slug))
    throw new Error(`Java Data Structures: ${lesson.slug} is not assigned to a group`);

const dataStructuresSection = {
  slug: JAVA_DATA_STRUCTURES,
  title: "Java Data Structures",
  groups: dataStructureGroups.map(([group]) => group),
  lessons: dataStructureLessons,
};

const networkingSections = javaNetworkSections.filter(
  (section) => !["trees-in-java", "graph-networks-in-java"].includes(section.slug),
);

const insertAt = coreSections.findIndex((section) => section.slug === "data-structures");
const at = insertAt === -1 ? coreSections.length : insertAt;

export const javaSections = [
  ...coreSections.slice(0, at),
  dataStructuresSection,
  ...networkingSections,
  ...coreSections.slice(at).filter((section) => section.slug !== "data-structures"),
];

export const javaArticles = javaSections.flatMap((item) => item.lessons);

export const javaAliases = coreJavaAliases;
