import { depthTopics, completableLesson, customLesson } from "./enrichment.js";
// Core Java course content helpers.
//
// Each file in ./sections exports `section(slug, title, [lesson(...), ...])` as its default.
// scripts/build-core-java.mjs reads those files, writes outline.json (for the course page),
// one Article.jsx route stub per lesson, and outputs/<section>.json with the real output of
// every program (compiled and run with the local JDK).
//
// lesson(title, {
//   intro:    overview paragraph
//   topics:   [[subtopic title, explanation, optional snippet], ...]  every subtopic covered
//   code:     complete Java program whose public class is `Main`
//   walk:     how the program works
//   anim:     [title, [[id, label, sub], ...3-6 nodes], [[from, to, token, note], ...>=4 steps]]
//   mistakes: [string, ...]
//   qa:       [[question, answer], ...]
//   ex:       [exercise, answer]
//   mode:     "run" (default) | "compile" (needs a database, network etc.) | "show" (needs a library)
//   sample:   expected output for "compile"/"show" lessons
//   varies:   true when thread scheduling makes the output order differ between runs
//   jvm:      extra JVM arguments, stdin: text piped to System.in
//   release:  javac --release level (default 21), preview: true adds --enable-preview
//   note:     custom note shown above the output (e.g. why a sample run is shown)
//
// Large sections keep their lessons in ./parts/*.js (arrays of lesson(...)) and spread them in.
// })
export const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const lesson = (title, content) => ({ title, ...content });

export const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: [...lessons, ...(slug === "concurrency" ? [completableLesson] : slug === "collections" ? [customLesson] : [])].map((item, index) => ({
    ...item,
    topics: index === 0 && depthTopics[slug] ? [...item.topics, ...depthTopics[slug]] : item.topics,
    slug: `${slug}--${slugify(item.title)}`,
  })),
});
