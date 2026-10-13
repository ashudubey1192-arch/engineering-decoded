import { foundations } from './aiEngineering/foundations.js';
import { models } from './aiEngineering/models.js';
import { prompting } from './aiEngineering/prompting.js';
import { retrieval } from './aiEngineering/retrieval.js';
import { tools } from './aiEngineering/tools.js';
import { agents } from './aiEngineering/agents.js';
import { architecture } from './aiEngineering/architecture.js';
import { production } from './aiEngineering/production.js';
import { advanced } from './aiEngineering/advanced.js';
import { slugify } from './aiEngineering/helpers.js';
import { reasoning } from './aiEngineering/reasoning.js';

export const aiEngineeringSections = [...foundations, ...models, ...prompting, ...retrieval, ...tools, ...agents, ...architecture, ...production, ...advanced];
export const aiEngineeringLessons = Object.fromEntries(aiEngineeringSections.flatMap(section => section.chapters.map(chapter => {
  const slug = `${section.slug}--${slugify(chapter.title)}`;
  return [slug, { ...chapter, reasoning: reasoning[chapter.title], slug, sectionTitle: section.title, sectionSlug: section.slug, context: section.context, reference: section.reference }];
})));
