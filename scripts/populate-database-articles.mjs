import { readFile, writeFile } from "node:fs/promises";
import { databaseCourses } from "../src/data/databaseCourses.js";
import { databaseLessons } from "../src/data/databaseLessons.js";

// Only replace the known database scaffolds; refuse to overwrite authored articles.
let count = 0;
for (const [courseSlug, course] of Object.entries(databaseCourses)) {
  for (const article of course.articles) {
    if (!databaseLessons[courseSlug]?.[article.slug])
      throw new Error(`Missing lesson ${article.slug}`);
    const path = new URL(
      `../src/components/${course.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`,
      import.meta.url,
    );
    const existing = await readFile(path, "utf8");
    if (
      !existing.includes("Replace this placeholder") &&
      !existing.includes("<DatabaseLessonArticle")
    ) {
      throw new Error(`Refusing to replace authored content: ${path}`);
    }
    const content = `import DatabaseLessonArticle from "../../../../../DatabaseLessonArticle.jsx";\n\nexport default function Article() {\n  return <DatabaseLessonArticle courseSlug=${JSON.stringify(courseSlug)} lessonSlug=${JSON.stringify(article.slug)} />;\n}\n`;
    if (existing !== content) await writeFile(path, content);
    count++;
  }
  // Retain the old entry components for callers that still import them directly.
  const legacyTopics = {
    Introduction: 0,
    CoreConcepts: 3,
    Architecture: 1,
    PracticalGuide: 11,
    BestPractices: 29,
    InterviewQuestions: 20,
  };
  for (const [file, index] of Object.entries(legacyTopics)) {
    const path = new URL(
      `../src/components/${course.componentPath}/jsx/${file}.jsx`,
      import.meta.url,
    );
    const existing = await readFile(path, "utf8");
    if (
      !existing.includes("Replace this starter copy") &&
      !existing.includes("<DatabaseLessonArticle")
    ) {
      throw new Error(`Refusing to replace authored legacy content: ${path}`);
    }
    const content = `import DatabaseLessonArticle from "../../DatabaseLessonArticle.jsx";\n\nexport default function Article() {\n  return <DatabaseLessonArticle courseSlug=${JSON.stringify(courseSlug)} lessonSlug=${JSON.stringify(course.articles[index].slug)} />;\n}\n`;
    if (existing !== content) await writeFile(path, content);
  }
}
console.log(
  `Populated ${count} database articles across ${Object.keys(databaseCourses).length} courses.`,
);
