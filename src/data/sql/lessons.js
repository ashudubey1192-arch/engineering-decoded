import foundations from './foundations.js';
import modeling from './modeling.js';
import operations from './operations.js';
import joins from './joins.js';
import subqueries from './subqueries.js';
import analytics from './analytics.js';
import performance from './performance.js';
import reliability from './reliability.js';
import production from './production.js';
import projects from './projects.js';

export const sqlAuthoredLessons = Object.fromEntries(
  [...foundations, ...modeling, ...operations, ...joins, ...subqueries, ...analytics, ...performance, ...reliability, ...production, ...projects].map(item => [item.id, item]),
);
