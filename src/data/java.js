import { javaStructureSections } from "./javaStructureLessons.js";
import { javaNetworkSections } from "./javaNetworkLessons.js";
import coreJavaOutline from "./coreJava/outline.js";
import { coreJavaAliases } from "./coreJava/aliases.js";
import { javaInterviewSection } from './javaInterview.js';

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

// ONE "Java Interview Preparation" section holds every interview menu: the three attached
// PDF guides, the ten "Interview Q&A" sections, the prep/libraries section and the interview
// lessons that used to sit at the end of topic sections. Lessons keep their slugs and their
// component folder (`folder`), so old links still work.
const INTERVIEW_SECTIONS = new Set([
  "interview-core-java",
  "interview-additional",
  "interview-collections",
  "interview-equals-hashcode",
  "interview-exceptions",
  "interview-threads",
  "interview-concurrency",
  "interview-concurrency-parallelism",
  "interview-serialization",
  "interview-jdbc",
  "interview-jdk-versions",
]);
const TOPIC_INTERVIEW_LESSONS = {
  "interview-and-libraries--core-java-top-interview-questions": "Q&A: Core Java",
  "collections--collection-framework-interview-questions": "Q&A: Collections, equals and hashCode",
  "equals-and-hashcode--equals-and-hashcode-interview-questions": "Q&A: Collections, equals and hashCode",
  "exceptions--exception-handling-interview-questions-and-output-puzzles": "Q&A: Exception handling",
  "threads--thread-interview-questions": "Q&A: Multithreading and concurrency",
  "concurrency--concurrency-interview-questions": "Q&A: Multithreading and concurrency",
  "serialization--serialization-interview-questions": "Q&A: Serialization and JDBC",
  "jdbc--jdbc-interview-questions": "Q&A: Serialization and JDBC",
  "garbage-collection--gc-and-jvm-interview-questions": "Q&A: JVM, memory and garbage collection",
};
const coreBySlug = Object.fromEntries(coreSections.map((section) => [section.slug, section.lessons]));
const topicLessons = (group) =>
  coreSections
    .flatMap((section) => section.lessons)
    .filter((lesson) => TOPIC_INTERVIEW_LESSONS[lesson.slug] === group);
const guide = (key) => javaInterviewSection.lessons.filter((lesson) => lesson.guide === key);

// [group title, lessons] in study order.
const interviewGroups = [
  ["Guide: Core Java Top 200 questions", guide("corejava")],
  ["Guide: Collections, hashCode and equals", guide("collections")],
  ["Guide: Java 8 Top 100 questions", guide("java8")],
  ["Q&A: Core Java", [...topicLessons("Q&A: Core Java"), ...coreBySlug["interview-core-java"], ...coreBySlug["interview-additional"]]],
  ["Q&A: Collections, equals and hashCode", [...coreBySlug["interview-collections"], ...coreBySlug["interview-equals-hashcode"], ...topicLessons("Q&A: Collections, equals and hashCode")]],
  ["Q&A: Exception handling", [...coreBySlug["interview-exceptions"], ...topicLessons("Q&A: Exception handling")]],
  ["Q&A: Multithreading and concurrency", [...coreBySlug["interview-threads"], ...coreBySlug["interview-concurrency"], ...topicLessons("Q&A: Multithreading and concurrency")]],
  ["Q&A: Concurrency and parallelism (top 100 + 50 extra)", coreBySlug["interview-concurrency-parallelism"]],
  ["Q&A: Serialization and JDBC", [...coreBySlug["interview-serialization"], ...coreBySlug["interview-jdbc"]]],
  ["Q&A: JVM, memory and garbage collection", topicLessons("Q&A: JVM, memory and garbage collection")],
  ["Q&A: JDK versions 1.0 to 27", coreBySlug["interview-jdk-versions"]],
];
for (const [group, lessons] of interviewGroups)
  if (!lessons?.length) throw new Error(`Java interview group "${group}" is empty`);

const interviewSection = {
  slug: javaInterviewSection.slug,
  title: "Java Interview Preparation",
  groups: interviewGroups.map(([group]) => group),
  lessons: interviewGroups.flatMap(([group, lessons]) =>
    lessons.map((lesson) => ({
      ...lesson,
      group,
      folder: lesson.folder || lesson.sectionSlug,
      sectionSlug: javaInterviewSection.slug,
    })),
  ),
};
const movedSlugs = new Set(Object.keys(TOPIC_INTERVIEW_LESSONS));

export const javaSections = [
  ...coreSections.slice(0, at),
  dataStructuresSection,
  ...networkingSections,
  ...coreSections.slice(at).filter((section) => section.slug !== "data-structures"),
]
  .filter((section) => !INTERVIEW_SECTIONS.has(section.slug))
  .map((section) =>
    section.lessons.some((lesson) => movedSlugs.has(lesson.slug))
      ? { ...section, lessons: section.lessons.filter((lesson) => !movedSlugs.has(lesson.slug)) }
      : section,
  )
  // What is left of "Core Java Interview Prep and Popular Libraries" is library tutorials
  // (iText PDFs, MongoDB); show them as their own section right after JDBC.
  .map((section) => (section.slug === "interview-and-libraries" ? { ...section, title: "Popular Java Libraries" } : section))
  .reduce((list, section, index, all) => {
    if (section.slug === "interview-and-libraries") return list;
    list.push(section);
    if (section.slug === "jdbc") list.push(all.find((item) => item.slug === "interview-and-libraries"));
    return list;
  }, [])
  .concat(interviewSection);

export const javaArticles = javaSections.flatMap((item) => item.lessons);

export const javaAliases = coreJavaAliases;
