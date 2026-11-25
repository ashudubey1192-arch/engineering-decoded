const group = (slug, title, description, lessons) => ({
  slug, title, description,
  lessons: lessons.map(([id, title]) => ({ slug: `${slug}--${id}`, title, sectionSlug: slug, time: '12 min', updated: 'Nov 2026' })),
});

export const sqlSections = [
  group('foundations', 'SQL Foundations', 'Understand tables, statements, clients, and a reproducible practice database.', [
    ['introduction-to-sql', 'Introduction to SQL'], ['sql-architecture', 'SQL Architecture'], ['installing-sql', 'Installing SQL'], ['sql-data-model', 'SQL Data Model'], ['sql-tooling', 'SQL Tooling'],
  ]),
  group('modeling', 'Types, Keys, and Data Modeling', 'Represent real entities and enforce rules before writing reports.', [
    ['modeling-relational-data', 'Modeling Relational Data'], ['keys-and-identifiers', 'Keys and Identifiers'], ['relationships-and-constraints', 'Relationships and Constraints'], ['schema-design', 'Schema Design'], ['model-evolution', 'Model Evolution'],
    ['data-types-and-precision', 'Data Types and Numeric Precision'], ['null-and-three-valued-logic', 'NULL and Three-Valued Logic'], ['normalization-and-functional-dependencies', 'Normalization and Functional Dependencies'],
  ]),
  group('operations', 'Querying and Changing Rows', 'Build queries from row selection through grouping, then change data deliberately.', [
    ['querying-data', 'Querying Data'], ['select-distinct-and-aliases', 'SELECT, DISTINCT, and Aliases'], ['filtering-and-sorting', 'Filtering and Sorting'], ['logical-query-processing', 'Logical Query Processing'],
    ['case-and-coalesce', 'CASE and COALESCE'], ['string-and-date-functions', 'String and Date Functions'], ['aggregation', 'Aggregation'], ['pagination-and-keyset-cursors', 'Pagination and Keyset Cursors'], ['creating-and-updating-data', 'Creating and Updating Data'], ['bulk-operations', 'Bulk Operations'],
  ]),
  group('joins', 'Joins and Relationship Queries', 'Predict matched, missing, and multiplied rows before trusting a join.', [
    ['inner-joins', 'INNER JOIN'], ['left-joins-and-unmatched-rows', 'LEFT JOIN and Unmatched Rows'], ['cross-joins', 'CROSS JOIN'], ['self-joins', 'Self Joins'], ['exists-and-anti-joins', 'EXISTS, NOT EXISTS, and Anti Joins'], ['join-cardinality-and-double-counting', 'Join Cardinality and Double Counting'],
  ]),
  group('subqueries', 'Subqueries, CTEs, and Set Operations', 'Break complex questions into testable intermediate relations.', [
    ['scalar-subqueries', 'Scalar Subqueries'], ['correlated-subqueries', 'Correlated Subqueries'], ['common-table-expressions', 'Common Table Expressions'], ['recursive-ctes', 'Recursive CTEs'], ['union-intersect-and-except', 'UNION, INTERSECT, and EXCEPT'],
  ]),
  group('analytics', 'Window Functions and Reporting', 'Rank, compare, and accumulate values without losing row identity.', [
    ['window-function-basics', 'Window Function Basics'], ['ranking-and-top-n-per-group', 'Ranking and Top N per Group'], ['lag-lead-and-period-comparisons', 'LAG, LEAD, and Period Comparisons'], ['window-frames-and-running-totals', 'Window Frames and Running Totals'], ['conditional-aggregation', 'Conditional Aggregation and Pivot Reports'],
  ]),
  group('performance', 'Query Plans and Performance', 'Connect predicates, indexes, and workload evidence to tuning decisions.', [
    ['query-planning', 'Query Planning'], ['index-strategy', 'Index Strategy'], ['sargable-predicates', 'Sargable Predicates'], ['covering-and-composite-indexes', 'Covering and Composite Indexes'], ['caching', 'Caching'], ['partitioning-strategy', 'Partitioning Strategy'], ['performance-tuning', 'Performance Tuning'],
  ]),
  group('reliability', 'Transactions and Reliability', 'Reason about atomic changes, concurrent work, and verified recovery.', [
    ['transactions-and-consistency', 'Transactions and Consistency'], ['savepoints', 'Savepoints and Partial Rollback'], ['concurrency-control', 'Concurrency Control'], ['isolation-levels', 'Isolation Levels and Read Anomalies'], ['replication', 'Replication'], ['backup-and-recovery', 'Backup and Recovery'], ['failure-handling', 'Failure Handling'],
  ]),
  group('production', 'Production SQL', 'Keep data access secure, observable, maintainable, and portable.', [
    ['views-and-data-contracts', 'Views and Data Contracts'], ['triggers-and-stored-routines', 'Triggers and Stored Routines'], ['security-and-access-control', 'Security and Access Control'], ['monitoring', 'Monitoring'], ['capacity-planning', 'Capacity Planning'], ['migration-strategy', 'Migration Strategy'], ['operational-best-practices', 'Operational Best Practices'],
  ]),
  group('projects', 'Guided SQL Projects', 'Combine the course skills into complete reporting and inventory workflows.', [
    ['customer-revenue-report', 'Project: Customer Revenue Report'], ['inventory-reservation', 'Project: Safe Inventory Reservation'],
  ]),
];
export const sqlCourse = { name: 'SQL', sections: sqlSections, articles: sqlSections.flatMap(section => section.lessons), componentPath: 'databases/sql' };
