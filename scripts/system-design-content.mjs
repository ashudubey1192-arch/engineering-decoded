import { systemDesignFundamentalsArticles } from '../src/data/systemDesignFundamentals.js';
import { highLevelDesignArticles } from '../src/data/highLevelDesign.js';
import { lowLevelDesignArticles } from '../src/data/lowLevelDesign.js';
export const tracks = { 'system-design-fundamentals': systemDesignFundamentalsArticles, 'high-level-design': highLevelDesignArticles, 'low-level-design': lowLevelDesignArticles };
const entities = { apos: "'", quot: '"', amp: '&', lt: '<', gt: '>', nbsp: ' ', mdash: '—', ndash: '–', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', rarr: '→', times: '×', hellip: '…', le: '≤', ge: '≥' };
export const plain = html => html.replace(/<[^>]*>/g, ' ').replace(/&#(x[\da-f]+|\d+);/gi, (_, value) => String.fromCodePoint(value.startsWith('x') ? parseInt(value.slice(1), 16) : Number(value))).replace(/&([a-z]+);/g, (all, key) => entities[key] ?? all).replace(/\s+/g, ' ').replace(/\s+([,;:!?])/g, '$1').replace(/\s+\.(?=\s|$)/g, '.').trim();
export const sectionHtml = (html, section) => html.match(new RegExp(`<section id="${section}"[^>]*>([\\s\\S]*?)<\\/section>`))?.[1] || '';
export const blocks = html => [...html.matchAll(/<(p|li)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)].map(match => ({ html: match[2], text: plain(match[2]) })).filter(item => item.text.length >= 45 && item.text.length < 1400);
export const articlePath = (track, article) => `/src/components/system-design/${track}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
