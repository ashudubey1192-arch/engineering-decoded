import { lesson, topic as t, frame as f } from './schema.js';
export default [
  lesson('foundations--introduction-to-sql',
    'SQL describes the data you want rather than a loop for fetching each record. A query transforms a set of input rows into a result table. Start by naming the question, the source table, and the meaning of one output row.', [
      t('Tables and result sets', 'A stored table holds typed columns and rows. A SELECT produces another table-shaped result without changing the stored rows. That result may contain fewer columns, fewer rows, or calculated values.'),
      t('Declarative thinking', 'Ask “which paid orders exceed 1,000 cents?” before choosing syntax. The engine can use different physical strategies to answer the same question; query meaning and execution strategy are separate.'),
      t('Read versus write', 'SELECT reads data. INSERT adds rows, UPDATE changes matching rows, and DELETE removes matching rows. A result shown in the client is not automatically a new stored table.'),
    ], 'Find paid orders worth at least 1,000 cents. Each result row should represent one order.', [
      f('Inspect the source', 'SELECT id, amount_cents, status FROM orders ORDER BY id;', 'Six orders exist, including pending and cancelled orders. Reading them does not modify them.'),
      f('Keep paid orders', "SELECT id, amount_cents FROM orders WHERE status = 'paid' ORDER BY id;", 'WHERE keeps only rows whose condition is true. Four paid orders remain.'),
      f('Add the amount condition', "SELECT id, amount_cents FROM orders WHERE status = 'paid' AND amount_cents >= 1000 ORDER BY id;", 'Both conditions must hold for the same row. Orders 101 and 104 survive, with their original identities.'),
    ], [[101,1200],[104,1500]], 'Assuming SELECT changes or sorts the underlying table. ORDER BY specifies the presentation of this result only.', 'Would replacing AND with OR keep the same two rows?', 'No. OR also keeps a paid order below the threshold, or any other order meeting the amount condition. In this fixture all four paid orders would qualify.'),
  lesson('foundations--sql-architecture',
    'A SQL client sends text and parameters to a database engine. The engine resolves names, plans access, executes operators, and returns rows. Understanding those stages helps you separate an invalid query from a valid but expensive one.', [
      t('Parsing and name resolution', 'The engine checks statement syntax and resolves table and column names. A spelling error can fail here before the engine reads the requested records.'),
      t('Planning versus execution', 'The planner compares access strategies using schema and statistics. It may reorder operations while preserving SQL semantics. A teaching trace describes meaning, not a promise about physical operator order.'),
      t('Client responsibility', 'The client chooses connection details, submits statements, displays results, and handles errors. A slow interface may also spend time transferring or rendering rows after server execution finishes.'),
    ], 'Follow one predicate from a base relation to a filtered and projected result. This is a logical trace, not an execution-plan recording.', [
      f('Resolve the input relation', 'SELECT id, customer_id, amount_cents FROM orders ORDER BY id;', 'The column names belong to orders. There are six candidate rows in this example.'),
      f('Apply the requested predicate', 'SELECT id, customer_id, amount_cents FROM orders WHERE customer_id = 1 ORDER BY id;', 'The query asks for one customer’s orders. An index or a scan can both compute this meaning.'),
      f('Return requested columns', 'SELECT id, amount_cents FROM orders WHERE customer_id = 1 ORDER BY id;', 'Projection returns only the requested values. The missing customer_id column has not been deleted from storage.'),
    ], [[101,1200],[102,800]], 'Treating the written clause order as an exact execution schedule. Optimizers can push predicates and reorder joins.', 'Does a different query plan necessarily change the answer?', 'No. Valid plans preserve query semantics. Without ORDER BY, presentation order can differ, so compare values and specify ordering when order is part of the requirement.'),
  lesson('foundations--installing-sql',
    'SQL is a language, so you install a database engine and a client rather than “install SQL” itself. The practice scripts here use a disposable SQLite database. Most query examples use common SQL; engine-specific syntax is labeled.', [
      t('Create a disposable workspace', 'Open a new SQLite database in a local SQL client, then run the course setup script once in that empty database. Do not paste practice mutations into a production connection.'),
      t('Load a known fixture', 'The setup creates customers, orders, order_items, and employees. It deliberately includes missing emails, customers without orders, repeated amounts, and ties so examples expose edge cases.'),
      t('Reset between lessons', 'Each worked trace assumes a fresh fixture. To repeat it, open a new empty database and rerun setup; otherwise prior inserts, schema changes, or transactions can change the expected answer.'),
    ], 'Verify a connection and the loaded fixture before attempting joins or mutations.', [
      f('Check the connection', 'SELECT 1 AS connected;', 'One row containing 1 verifies that this client can execute a statement. It does not yet verify the fixture.'),
      f('Verify fixture counts', 'SELECT COUNT(*) AS customer_count FROM customers;', 'Four customers confirm that the customer fixture is present in the selected database.'),
      f('Verify an identifying record', 'SELECT id, name, city FROM customers WHERE id = 1;', 'The row should be Asha in Pune. Checking a known value catches connecting to the wrong database with similarly named tables.'),
    ], [[1,'Asha','Pune']], 'Running the setup repeatedly in the same database and then ignoring “table already exists” errors.', 'Does SELECT 1 prove your data will survive closing the application?', 'No. An in-memory database can execute it too. Use a file-backed practice database, close the connection, reopen the same file, and verify a saved record when testing persistence.'),
  lesson('foundations--sql-data-model',
    'A relational model represents each kind of entity with rows and connects entities through keys. The meaning of a row is its grain. Define that grain before joining or aggregating, because different grains produce different counts.', [
      t('One row, one entity', 'A customer row represents a customer, while an order row represents a purchase attempt. Two orders belonging to one customer are two valid rows, not duplicate customers to remove.'),
      t('Relationships use values', 'orders.customer_id points to customers.id. The relationship depends on matching values, not on two rows having the same position in separate tables.'),
      t('Missing data remains explicit', 'NULL represents absent or unknown information. It is different from zero and from an empty string. Keep its meaning explicit in predicates and summaries.'),
    ], 'Compare the customer grain with the order grain before combining them.', [
      f('Inspect customer identity', 'SELECT id, name FROM customers ORDER BY id;', 'Four identities exist. Names are descriptive attributes, not guaranteed unique identifiers.'),
      f('Inspect order ownership', 'SELECT id, customer_id FROM orders ORDER BY id;', 'Six orders reference three customers. Kabir has no order, but his customer row still exists.'),
      f('Summarize the relationship', 'SELECT customer_id, COUNT(*) AS order_count FROM orders GROUP BY customer_id ORDER BY customer_id;', 'The result now has one row per customer who has orders. Grouping intentionally changes the grain.'),
    ], [[1,2],[2,2],[3,2]], 'Assuming an aggregate from orders automatically includes customers with no orders.', 'Why is customer 4 missing from the grouped result?', 'GROUP BY can group only input rows. There is no order for customer 4, so start from customers with a LEFT JOIN when the report must include zero-order customers.'),
  lesson('foundations--sql-tooling',
    'A productive SQL workflow separates setup, the query under investigation, and checks on the result. Keep scripts reproducible, inspect small samples, and compare totals before trusting a report with many clauses.', [
      t('Small exploratory queries', 'Start with explicit columns and a bounded, ordered sample. This reveals data shape without flooding the client or accidentally relying on an unspecified row order.'),
      t('Versioned SQL scripts', 'Save schema and data migrations as reviewed scripts. Record the expected database engine and distinguish a repeatable read from a mutation that is safe to run only once.'),
      t('Verification queries', 'Use counts, uniqueness checks, and business totals alongside a query result. A syntactically valid query can still answer the wrong question or double-count money.'),
    ], 'Inspect the order fixture and verify the total for paid purchases.', [
      f('Read a bounded sample', 'SELECT id, status, amount_cents FROM orders ORDER BY id LIMIT 2;', 'The first two rows provide a reproducible sample; LIMIT without ORDER BY would not define which two.'),
      f('Check status distribution', 'SELECT status, COUNT(*) AS row_count FROM orders GROUP BY status ORDER BY status;', 'Status counts reveal four paid, one pending, and one cancelled order before money is aggregated.'),
      f('Verify the business total', "SELECT COUNT(*) AS paid_orders, SUM(amount_cents) AS paid_cents FROM orders WHERE status = 'paid';", 'Only paid orders contribute. Four rows sum to 4,000 cents, which later reports should reconcile to.'),
    ], [[4,4000]], 'Using a row count alone to prove that a migration or report preserved the correct values.', 'A report still has four rows but totals 5,200 cents. Is it correct?', 'Not for this paid-order fixture. Inspect join multiplication, filters, and the meaning of each row. Equal counts do not establish equal keys, amounts, or business meaning.'),
];
