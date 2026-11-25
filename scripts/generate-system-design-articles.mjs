// Writes the Article.jsx stub for every guided System Design lesson.
// Content lives in src/data/systemDesign/lessons/<section>.js.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { systemDesignFundamentalsArticles } from "../src/data/systemDesignFundamentals.js";
import { highLevelDesignArticles } from "../src/data/highLevelDesign.js";

const tracks = {
  "system-design-fundamentals": systemDesignFundamentalsArticles,
  "high-level-design": highLevelDesignArticles,
};
let created = 0;
let total = 0;
for (const [track, articles] of Object.entries(tracks)) {
  for (const { slug, sectionSlug, guided } of articles) {
    if (!guided) continue;
    total += 1;
    const folder = resolve("src/components/system-design", track, sectionSlug, "articles", slug, "jsx");
    const file = resolve(folder, "Article.jsx");
    if (existsSync(file)) continue;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      file,
      `import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/${sectionSlug}.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["${slug}"]} />;
}
`,
    );
    created += 1;
  }
}
console.log(`${total} guided lessons, ${created} new article files.`);
