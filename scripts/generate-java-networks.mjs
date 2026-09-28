import { mkdir, writeFile } from "node:fs/promises";
import { javaNetworkLessons } from "../src/data/javaNetworkLessons.js";
for (const lesson of javaNetworkLessons) {
  const folder = new URL(
    `../src/components/backend/java/${lesson.sectionSlug}/articles/${lesson.slug}/jsx/`,
    import.meta.url,
  );
  await mkdir(folder, { recursive: true });
  await writeFile(
    new URL("Article.jsx", folder),
    `import JavaNetworkLesson from "../../../../jsx/JavaNetworkLesson";\n\nexport default function Article() {\n  return <JavaNetworkLesson lessonId="${lesson.id}" />;\n}\n`,
  );
}
console.log(`Generated ${javaNetworkLessons.length} Java trees and networks routes.`);
