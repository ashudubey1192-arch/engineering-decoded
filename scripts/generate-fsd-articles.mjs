// Writes one Article.jsx route entry per Frontend System Design lesson.
// Usage: node scripts/generate-fsd-articles.mjs  (safe to re-run)
import { mkdirSync, writeFileSync } from "node:fs";
import { frontendSystemDesignArticles } from "../src/data/frontendSystemDesign.js";

const base = "src/components/frontend/frontend-system-design";
for (const article of frontendSystemDesignArticles) {
  const dir = `${base}/${article.sectionSlug}/articles/${article.slug}/jsx`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    `${dir}/Article.jsx`,
    `import FsdLesson from "../../../../FsdLesson";

export default function Article() {
  return <FsdLesson slug="${article.slug}" />;
}
`,
  );
}
console.log(`Wrote ${frontendSystemDesignArticles.length} Frontend System Design route entries.`);
