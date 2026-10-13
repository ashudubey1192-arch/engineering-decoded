import fs from 'node:fs';
import path from 'node:path';
import { aiEngineeringSections } from '../src/data/aiEngineeringLessons.js';
import { reasoning } from '../src/data/aiEngineering/reasoning.js';
import { clean, slugify } from '../src/data/aiEngineering/helpers.js';

const sections = aiEngineeringSections.map(section => ({
  title: section.title, slug: section.slug,
  lessons: section.chapters.map(chapter => {
    const words = clean([section.context, chapter.intro, chapter.explanation, reasoning[chapter.title], chapter.pitfall, chapter.exercise, ...chapter.steps.map(step => step.detail)].join(' ')).split(/\s+/).length;
    return { title: chapter.title, slug: `${section.slug}--${slugify(chapter.title)}`, sectionSlug: section.slug, time: `${Math.max(5, Math.ceil(words / 140) + 3)} min`, updated: 'Oct 14, 2026' };
  }),
}));
fs.writeFileSync('src/data/aiEngineeringOutline.json', `${JSON.stringify(sections, null, 2)}\n`);
for (const section of sections) for (const article of section.lessons) {
  const directory = `src/components/ai/ai-engineering/${section.slug}/articles/${article.slug}/jsx`;
  fs.mkdirSync(directory, { recursive: true });
  const renderer = path.relative(directory, 'src/components/learning/AiEngineeringArticle.jsx').replaceAll('\\', '/');
  fs.writeFileSync(`${directory}/Article.jsx`, `export { default } from ${JSON.stringify(renderer)};\n`);
}
console.log(`Generated AI Engineering outline and ${sections.reduce((sum, section) => sum + section.lessons.length, 0)} article entry points.`);
