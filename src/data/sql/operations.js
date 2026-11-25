import { lesson, topic as t, frame as f } from './schema.js';
export default [
  lesson('operations--querying-data',
    'A clear SELECT starts with the grain of its answer. Choose the source rows with FROM and WHERE, then choose the output expressions. Explicit column names make the contract understandable and avoid fetching data the caller does not need.', [
      t('Projection and aliases', 'The SELECT list defines the output columns and can calculate values. An alias names a result column; it does not rename the stored column or create a permanent attribute.'),
      t('Filtering rows', 'WHERE is evaluated against individual input rows. A predicate must be true for a row to remain, so explicitly account for nullable fields and multiple conditions.'),
      t('Reproducible ordering', 'Tables have no guaranteed presentation order. Add ORDER BY when order matters, and include a unique tie-breaker when multiple rows share the first sort value.'),
    ], 'Return a compact order history for customer 1, with an explicit result contract.', [
      f('Inspect available columns', 'SELECT id, customer_id, amount_cents, status FROM orders ORDER BY id;', 'Identify the customer key and money units before writing the final query.'),
      f('Select one customer', 'SELECT id, customer_id, amount_cents FROM orders WHERE customer_id = 1 ORDER BY id;', 'The customer predicate retains orders 101 and 102. Their stored data is unchanged.'),
      f('Name the output contract', 'SELECT id AS order_id, amount_cents AS total_cents FROM orders WHERE customer_id = 1 ORDER BY id;', 'The result exposes two stable column names. It does not expose customer information the caller already knows.'),
    ], [[101,1200],[102,800]], 'Using SELECT * as a long-lived application contract and then being surprised by schema additions or unnecessary data transfer.', 'Does AS total_cents change the orders table?', 'No. It names the output expression for this query. A stored column change requires a schema operation, not a SELECT alias.'),
  lesson('operations--select-distinct-and-aliases',
    'DISTINCT removes duplicate combinations of selected values. It answers a set-membership question; it does not choose an arbitrary “best” row from each group or repair a join that was designed at the wrong grain.', [
      t('The entire projection matters', 'DISTINCT city deduplicates cities. DISTINCT city, id considers both values, so every unique ID keeps its row even when several customers share a city.'),
      t('Aliases improve meaning', 'Use an alias to describe a computed value or a business measure. Keep the meaning and units visible so downstream code does not guess what an unlabeled expression represents.'),
      t('Deduplication has a cost', 'An engine may sort or hash values to remove duplicates. First establish that duplicates are semantically unwanted; hiding them can mask incorrect joins or data-quality problems.'),
    ], 'List the cities served by the shop, regardless of how many customers live in each.', [
      f('Read repeated city values', 'SELECT city FROM customers ORDER BY city, id;', 'Pune occurs twice because two customers live there. Those are valid customer rows.'),
      f('Compare two-column distinctness', 'SELECT DISTINCT city, id FROM customers ORDER BY city, id;', 'Adding the unique ID keeps all four rows. DISTINCT applies to the complete selected tuple.'),
      f('Return unique cities', 'SELECT DISTINCT city AS served_city FROM customers ORDER BY served_city;', 'The output grain is now one city. Only three city values remain.'),
    ], [['Delhi'],['Jaipur'],['Pune']], 'Adding DISTINCT until duplicate-looking results disappear instead of verifying join keys and row grain.', 'Can DISTINCT city, name guarantee one row per city?', 'No. Different names in the same city remain distinct pairs. Use DISTINCT city for unique cities or GROUP BY city for a defined per-city summary.'),
  lesson('operations--filtering-and-sorting',
    'Filtering defines which rows belong in the answer; sorting defines how those rows are presented. Write compound predicates with deliberate parentheses and sort ties explicitly so reports and pages remain predictable.', [
      t('AND, OR, and parentheses', 'AND binds more tightly than OR in SQL. Parentheses document the intended grouping and protect business conditions such as a tenant filter from accidentally applying to only one branch.'),
      t('Range boundaries', 'BETWEEN includes both endpoints. For timestamps, a half-open interval with >= start and < next_boundary often expresses a period more reliably than an invented last millisecond.'),
      t('Stable ordering', 'ORDER BY amount_cents DESC, id ASC sorts expensive rows first and breaks equal-amount ties by ID. Without the second column, tied rows can change relative position.'),
    ], 'Find paid orders of at least 500 cents and show the largest first.', [
      f('Filter by status', "SELECT id, amount_cents FROM orders WHERE status = 'paid' ORDER BY id;", 'Only paid orders belong in this report; a pending order with the same amount must not slip in.'),
      f('Apply the amount boundary', "SELECT id, amount_cents FROM orders WHERE status = 'paid' AND amount_cents >= 500 ORDER BY id;", 'The 500-cent paid order is included because the comparison is inclusive.'),
      f('Define presentation order', "SELECT id, amount_cents FROM orders WHERE status = 'paid' AND amount_cents >= 500 ORDER BY amount_cents DESC, id ASC;", 'The result is sorted by amount, with a deterministic tie-breaker for future equal amounts.'),
    ], [[104,1500],[101,1200],[102,800],[105,500]], 'Assuming rows come back in insertion order because a small test happened to return them that way.', 'How would you select all of January without depending on time-of-day precision?', "Use a compatible date/time type and a half-open range: ordered_on >= '2026-01-01' AND ordered_on < '2026-02-01'. Define timezone semantics for timestamp columns."),
  lesson('operations--logical-query-processing',
    'A useful logical model is FROM and JOIN, then WHERE, grouping and HAVING, SELECT expressions, DISTINCT, ORDER BY, and row limiting. This explains which values are available at each stage; it is not the engine’s mandatory physical schedule.', [
      t('Rows before groups', 'WHERE removes individual records before aggregation. Filtering paid orders here changes which amounts contribute to each customer total.'),
      t('Groups after aggregation', 'HAVING removes whole groups based on aggregate values. A customer total threshold belongs here, not in a WHERE clause that tries to use SUM.'),
      t('Output expressions and order', 'Aliases in the output list are commonly usable in ORDER BY. Alias visibility in other clauses varies by dialect, so avoid depending on permissive behavior when writing portable SQL.'),
    ], 'Report customers whose paid total is at least 1,500 cents.', [
      f('Filter the source rows', "SELECT customer_id, amount_cents FROM orders WHERE status = 'paid' ORDER BY customer_id, id;", 'Pending and cancelled rows are excluded before totals are calculated.'),
      f('Build customer groups', "SELECT customer_id, SUM(amount_cents) AS paid_cents FROM orders WHERE status = 'paid' GROUP BY customer_id ORDER BY customer_id;", 'The grain changes from an order to a customer. Totals are 2,000, 500, and 1,500 cents.'),
      f('Filter groups and sort', "SELECT customer_id, SUM(amount_cents) AS paid_cents FROM orders WHERE status = 'paid' GROUP BY customer_id HAVING SUM(amount_cents) >= 1500 ORDER BY paid_cents DESC, customer_id;", 'HAVING keeps two groups. The final ordering operates on the surviving summary rows.'),
    ], [[1,2000],[3,1500]], 'Putting an aggregate condition in WHERE or describing a logical trace as a measured execution plan.', 'Would WHERE amount_cents >= 1500 give the same customer totals?', 'No. It removes individual small orders before grouping. Asha’s 1,200 and 800 would both disappear even though their combined paid total is 2,000.'),
  lesson('operations--case-and-coalesce',
    'CASE expresses conditional values inside a query, while COALESCE selects the first non-NULL value. They are useful for categorization and display defaults, but a convenient fallback must not erase a meaningful distinction between missing and zero.', [
      t('Ordered CASE branches', 'A searched CASE tests WHEN conditions in order and uses the first true branch. Put more specific conditions before broader conditions that would already match them.'),
      t('Explicit ELSE', 'Without ELSE, an unmatched CASE returns NULL. Choose whether that is intentional; an explicit catch-all label makes a reporting category contract easier to inspect.'),
      t('COALESCE semantics', 'COALESCE does not skip empty strings or invalid values; it skips NULL. Keep compatible result types and decide whether a fallback is a display choice or actual business data.'),
    ], 'Classify order size and separately show a readable missing-email value.', [
      f('Display missing contact data', "SELECT id, COALESCE(email, 'Not supplied') AS contact FROM customers ORDER BY id;", 'The underlying email remains NULL. The readable text exists only in the result.'),
      f('Classify every order', "SELECT id, CASE WHEN amount_cents >= 1000 THEN 'large' ELSE 'small' END AS size FROM orders ORDER BY id;", 'The classification uses a deliberate inclusive threshold and covers every fixture order.'),
      f('Count each category', "SELECT CASE WHEN amount_cents >= 1000 THEN 'large' ELSE 'small' END AS size, COUNT(*) AS orders FROM orders GROUP BY CASE WHEN amount_cents >= 1000 THEN 'large' ELSE 'small' END ORDER BY size;", 'Two orders are large and four are small. The repeated expression avoids dialect-specific GROUP BY alias assumptions.'),
    ], [['large',2],['small',4]], 'Using COALESCE(amount, 0) before deciding whether a missing amount should be treated as a real zero.', 'Does COALESCE(email, fallback) replace an empty email string?', 'No. An empty string is not NULL in this lab. Normalize blank strings deliberately, for example with NULLIF after trimming, if the domain treats them as missing.'),
  lesson('operations--string-and-date-functions',
    'Functions transform values, but their exact names and date semantics vary between engines. Separate portable operations from dialect-specific ones and define whether a date means a calendar day or an instant in a timezone.', [
      t('String cleanup', 'TRIM removes surrounding whitespace and LOWER normalizes case according to engine behavior. Neither proves that an address is valid or that two human names identify the same person.'),
      t('Date representation', 'This small fixture uses zero-padded ISO calendar dates as text, so lexical order matches chronological order. Production timestamp modeling needs explicit types and timezone decisions.'),
      t('Functions and indexes', 'Wrapping an indexed column in a function can prevent use of an ordinary index access path. A range on the original date column is often easier for an index to use.'),
    ], 'Normalize a string and count January orders with an unambiguous range.', [
      f('Normalize an input string', "SELECT LOWER(TRIM('  ASHA  ')) AS normalized;", 'The result is asha. Normalization is a deliberate transformation, not a substitute for validation.'),
      f('Inspect a date bucket', "SELECT id, SUBSTR(ordered_on, 1, 7) AS month FROM orders ORDER BY id;", 'The substring works because the fixture format is fixed. It is not a universal date-parsing technique.'),
      f('Filter the period by boundaries', "SELECT COUNT(*) AS january_orders FROM orders WHERE ordered_on >= '2026-01-01' AND ordered_on < '2026-02-01';", 'All six fixture orders belong to January. The half-open interval avoids overlapping month boundaries.'),
    ], [[6]], 'Applying date arithmetic to arbitrarily formatted text, or assuming every SQL engine supports the same date functions.', 'Why use a start-inclusive, end-exclusive interval?', 'Adjacent periods can meet at one boundary without counting the same instant twice. It also avoids guessing the last representable fraction of a second.'),
  lesson('operations--aggregation',
    'Aggregation summarizes many input rows into fewer output rows. Choose the grouping columns to define the result grain, then ensure every selected expression is either a group key or an aggregate with a clear meaning.', [
      t('Grouping changes grain', 'GROUP BY customer_id creates one output row per customer represented in the input. The number of result rows differs from the number of orders being summarized.'),
      t('COUNT and empty inputs', 'COUNT(*) counts rows. COUNT(column) excludes NULL. SUM over no input rows commonly returns NULL, so use COALESCE only when the business meaning is genuinely zero.'),
      t('Filters and aggregates', 'Use WHERE to choose contributing rows and HAVING to choose summary groups. A filter applied after grouping cannot recover rows discarded earlier.'),
    ], 'Compare all-order totals with totals that count only completed payments.', [
      f('Inspect contributing values', 'SELECT customer_id, amount_cents, status FROM orders ORDER BY customer_id, id;', 'There are two orders per represented customer, but not every order is paid.'),
      f('Summarize all attempts', 'SELECT customer_id, COUNT(*) AS attempts, SUM(amount_cents) AS attempt_cents FROM orders GROUP BY customer_id ORDER BY customer_id;', 'Attempt totals include pending and cancelled amounts. This is not a paid-revenue report.'),
      f('Summarize paid revenue', "SELECT customer_id, COUNT(*) AS paid_orders, SUM(amount_cents) AS paid_cents FROM orders WHERE status = 'paid' GROUP BY customer_id ORDER BY customer_id;", 'Only paid rows contribute, producing 2,000, 500, and 1,500 cents for customers 1, 2, and 3.'),
    ], [[1,2,2000],[2,1,500],[3,1,1500]], 'Selecting an ungrouped descriptive column and relying on an engine to choose an arbitrary value for the group.', 'Why is SUM(DISTINCT amount_cents) usually wrong for revenue?', 'Two different valid purchases can have the same amount. DISTINCT removes equal values, not duplicate business events, and can undercount revenue.'),
  lesson('operations--pagination-and-keyset-cursors',
    'Pagination requires a complete ordering. Offset pagination skips a number of rows; keyset pagination resumes after the last observed sort key. A cursor must include the tie-breaker, not just the main date or score.', [
      t('Stable sort keys', 'Order by ordered_on and id together because two orders share January 5. The pair identifies a position unambiguously even when the date alone does not.'),
      t('Offset trade-offs', 'OFFSET is convenient for jumping to a numbered page, but large offsets may require scanning and discarding many rows. Concurrent changes can also shift page membership.'),
      t('Keyset boundaries', 'For ascending dates, resume where the date is greater, or where the date ties and the ID is greater. Consistency across an entire changing dataset still needs an explicit snapshot policy.'),
    ], 'Fetch two orders per page, then resume after order 102 on January 5.', [
      f('Return the first page', 'SELECT id, ordered_on FROM orders ORDER BY ordered_on, id LIMIT 2;', 'The cursor is the last pair, (2026-01-05, 102), rather than just the date.'),
      f('Inspect all rows after the cursor', "SELECT id, ordered_on FROM orders WHERE ordered_on > '2026-01-05' OR (ordered_on = '2026-01-05' AND id > 102) ORDER BY ordered_on, id;", 'Order 103 shares the date but has a greater ID, so it must not be skipped.'),
      f('Limit the next page', "SELECT id, ordered_on FROM orders WHERE ordered_on > '2026-01-05' OR (ordered_on = '2026-01-05' AND id > 102) ORDER BY ordered_on, id LIMIT 2;", 'The next two rows are 103 and 104. Both pages share exactly the same sort rule.'),
    ], [[103,'2026-01-05'],[104,'2026-01-06']], 'Using only ordered_on > last_date and silently skipping later IDs with the same date.', 'Does keyset pagination guarantee a frozen snapshot while new rows arrive?', 'No. It gives a stable resume boundary for the chosen ordering. Snapshot isolation or an application cutoff may still be needed for a fully consistent export.'),
  lesson('operations--creating-and-updating-data',
    'Mutations change stored facts. Use explicit column lists, narrow predicates, and transactions for related changes. Before writing an UPDATE or DELETE, inspect the same predicate with SELECT and know which business operation the change represents.', [
      t('Explicit inserts', 'List target columns so an insert does not depend on their physical order. Omitted values use applicable defaults; explicit NULL remains a separate input.'),
      t('Scoped updates', 'UPDATE affects every row matching WHERE. A missing predicate can change the whole table, and a predicate on a descriptive name may affect multiple people.'),
      t('Commit deliberately', 'A transaction groups changes and lets you inspect before committing or rolling back. Keep it short and avoid waiting for user input or network calls while holding locks.'),
    ], 'Create one pending order, correct its amount, then cancel the entire practice operation.', [
      f('Insert inside a transaction', 'SELECT id, amount_cents, status FROM orders WHERE id = 107;', 'The new row is visible to this transaction but the example has not committed it.', "BEGIN; INSERT INTO orders (id, customer_id, amount_cents, status, ordered_on) VALUES (107, 4, 600, 'pending', '2026-01-09');"),
      f('Update one identified row', 'SELECT id, amount_cents, status FROM orders WHERE id = 107;', 'A primary-key predicate targets one row. The corrected amount is still part of the same transaction.', 'UPDATE orders SET amount_cents = 650 WHERE id = 107;'),
      f('Roll back the exercise', 'SELECT COUNT(*) AS remaining_orders FROM orders;', 'ROLLBACK undoes both the insert and its update. The original six orders remain.', 'ROLLBACK;'),
    ], [[6]], 'Testing a mutation without checking which connection, database, and transaction state the client is using.', 'Would rolling back after COMMIT undo this insert?', 'No. COMMIT ends the transaction. Reversing a committed business change requires a new compensating change or an appropriate recovery procedure.'),
  lesson('operations--bulk-operations',
    'Bulk loading reduces per-row overhead but does not remove the need for validation. Stage incoming data, reject invalid records, identify duplicate business keys, and publish a known set of accepted rows.', [
      t('Staging as a boundary', 'A staging table separates raw input from authoritative records. Preserve enough batch identity and rejected-row information to diagnose or retry the import.'),
      t('Validate before publishing', 'Check types, required references, ranges, and duplicates. A cast that silently changes invalid text is not a reliable validation policy.'),
      t('Atomic publication', 'Publish a batch in a transaction when all-or-nothing behavior is required. For very large loads, use explicit checkpoints and idempotency so restarting does not duplicate accepted rows.'),
    ], 'Load two valid new orders and reject one negative amount from a small staging batch.', [
      f('Inspect the incoming batch', 'SELECT id, amount_cents FROM incoming ORDER BY id;', 'Three proposed rows are staged. The negative amount should not reach the authoritative table.', 'CREATE TABLE incoming (id INTEGER, amount_cents INTEGER); INSERT INTO incoming VALUES (107,700),(108,900),(109,-20);'),
      f('Identify rejected rows', 'SELECT id, amount_cents FROM incoming WHERE amount_cents < 0 ORDER BY id;', 'Order 109 is rejected by the explicit validation predicate. A real pipeline would retain its rejection reason.'),
      f('Publish accepted rows', 'SELECT COUNT(*) AS order_count, SUM(amount_cents) AS total_cents FROM orders;', 'Only two rows are inserted. The original 4,800 cents plus 1,600 accepted cents total 6,400.', "BEGIN; INSERT INTO orders (id,customer_id,amount_cents,status,ordered_on) SELECT id,4,amount_cents,'pending','2026-01-09' FROM incoming WHERE amount_cents >= 0; COMMIT;"),
    ], [[8,6400]], 'Using a fast loader as if it also guaranteed business validation, deduplication, and safe retry.', 'Why keep the rejected record rather than just dropping it?', 'The batch owner needs to distinguish a missing record from an intentionally rejected one. Retaining the reason makes correction, reconciliation, and an auditable retry possible.'),
];
