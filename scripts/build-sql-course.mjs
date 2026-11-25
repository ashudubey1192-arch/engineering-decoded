import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sqlCourse } from '../src/data/sql/outline.js';
import { sqlAuthoredLessons } from '../src/data/sql/lessons.js';
import { sqlFixture } from '../src/data/sql/schema.js';

const checking = process.argv.includes('--check');
const results = {};
const persist = (path, content) => {
  const fullPath = resolve(path);
  if (checking) assert.equal(existsSync(fullPath) && readFileSync(fullPath, 'utf8').replaceAll('\r\n', '\n'), content, `${path}: missing or stale; run npm run generate:sql`);
  else {
    mkdirSync(dirname(fullPath), { recursive: true });
    if (!existsSync(fullPath) || readFileSync(fullPath, 'utf8').replaceAll('\r\n', '\n') !== content) writeFileSync(fullPath, content);
  }
};
assert.equal(sqlCourse.articles.length, 62, 'The authored SQL curriculum has 62 lessons');
assert.deepEqual(Object.keys(sqlAuthoredLessons).sort(), sqlCourse.articles.map(a => a.slug).sort());
let frames = 0;
for (const article of sqlCourse.articles) {
  const lesson = sqlAuthoredLessons[article.slug];
  assert.ok(lesson.subtopics.length >= 3 && lesson.steps.length >= 3, `${article.slug}: insufficient topic depth`);
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(sqlFixture);
    results[article.slug] = lesson.steps.map((step, index) => {
      if (step.before) db.exec(step.before);
      const statement = db.prepare(step.query);
      statement.setReturnArrays(true);
      const rows = statement.all(...(step.params || []));
      const columns = statement.columns().map(column => column.name);
      assert.ok(columns.length > 0, `${article.slug} step ${index + 1}: missing result columns`);
      assert.ok(rows.length <= 20, `${article.slug}: keep the teaching dataset readable`);
      frames++;
      return { columns, rows };
    });
    assert.deepEqual(results[article.slug].at(-1).rows, lesson.expected, `${article.slug}: SQL does not match independently authored expected values`);
    assert.equal(db.isTransaction, false, `${article.slug}: leave no transaction open`);
    if (article.slug === 'production--security-and-access-control') assert.equal(db.prepare('SELECT COUNT(*) AS n FROM customers').get().n, 4);
  } finally { db.close(); }
  // Only missing wrappers are created; established article wrappers are retained.
  const path = `src/components/databases/sql/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
  if (!existsSync(resolve(path))) {
    persist(path, `import DatabaseLessonArticle from "../../../../../DatabaseLessonArticle.jsx";\n\nexport default function Article() {\n  return <DatabaseLessonArticle courseSlug="sql" lessonSlug="${article.slug}" />;\n}\n`);
  }
}
persist('src/data/sql/results.json', `${JSON.stringify(results, null, 2)}\n`);
persist('public/sql-course-fixture.sql', `-- SQL course practice fixture. Run once in a new empty SQLite database.\n-- Use a fresh database for each lesson. Amounts are integer minor units.\n${sqlFixture}`);
console.log(`${checking ? 'Verified' : 'Generated'} ${sqlCourse.articles.length} SQL lessons and ${frames} executed trace states; every final result matches its authored expectation.`);
