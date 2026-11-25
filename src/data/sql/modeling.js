import { lesson, topic as t, frame as f } from './schema.js';
export default [
  lesson('modeling--modeling-relational-data',
    'Separate entities that have independent identities and lifecycles. An order belongs to a customer and contains line items; keeping those facts at their own grains prevents repeated customer details and ambiguous order totals.', [
      t('Entity boundaries', 'Store customer contact details once per customer and order attributes once per order. A customer address change should not require editing every historical order just to update a current contact field.'),
      t('Historical facts', 'Store the price actually charged on each order line. Looking up today’s product price would rewrite the meaning of yesterday’s revenue when prices change.'),
      t('Derived totals', 'A line total is quantity multiplied by the captured unit price. An order total is a sum of its lines; if you also persist it, define how both representations stay consistent.'),
    ], 'Reconstruct order 101 from its captured line prices.', [
      f('Read the order header', 'SELECT id, customer_id, amount_cents FROM orders WHERE id = 101;', 'The header says 1,200 cents and identifies the customer; it is one row per order.'),
      f('Inspect line-level facts', 'SELECT product, quantity, unit_cents, quantity * unit_cents AS line_cents FROM order_items WHERE order_id = 101 ORDER BY id;', 'Two notebooks contribute 800 cents and a pen set contributes 400 cents. Unit price is not the line total.'),
      f('Reconcile the header', 'SELECT order_id, SUM(quantity * unit_cents) AS calculated_cents FROM order_items WHERE order_id = 101 GROUP BY order_id;', 'The line sum matches the stored header total. This is a business-level integrity check.'),
    ], [[101,1200]], 'Joining current product prices into a historical revenue report instead of using captured purchase prices.', 'If notebooks cost 600 cents tomorrow, what is order 101’s notebook revenue?', 'It stays 800 cents: two units at the captured price of 400. A later catalog change should not alter the historical transaction.'),
  lesson('modeling--keys-and-identifiers',
    'Keys identify rows and enforce uniqueness. A surrogate ID simplifies references, while a business key enforces a domain rule such as one external order reference per tenant. These constraints solve different problems.', [
      t('Primary keys', 'A primary key identifies each row and cannot be NULL. Choose values that remain stable while descriptive fields such as names and addresses change.'),
      t('Business uniqueness', 'A generated row ID alone does not prevent duplicate logical purchases. Put a UNIQUE constraint on the actual business identity, including tenant scope when needed.'),
      t('Composite keys', 'A pair of columns can be unique even when neither column is unique alone. Make the pair explicit in lookups and foreign-key relationships.'),
    ], 'Allow external reference A1 once per tenant, including a separate A1 in another tenant.', [
      f('Create the key rules', 'SELECT COUNT(*) AS rows_present FROM keyed_orders;', 'A surrogate primary key and a tenant-scoped unique pair are both declared.', 'CREATE TABLE keyed_orders (id INTEGER PRIMARY KEY, tenant_id INTEGER NOT NULL, external_ref TEXT NOT NULL, UNIQUE (tenant_id, external_ref));'),
      f('Insert distinct business identities', 'SELECT tenant_id, external_ref FROM keyed_orders ORDER BY tenant_id;', 'The same reference is allowed in different tenants because uniqueness covers the pair.', "INSERT INTO keyed_orders VALUES (1, 7, 'A1'), (2, 8, 'A1');"),
      f('Handle the duplicate deliberately', 'SELECT id, tenant_id, external_ref FROM keyed_orders ORDER BY id;', 'ON CONFLICT targets the business key. The repeated intent does not create a third row.', "INSERT INTO keyed_orders VALUES (3, 7, 'A1') ON CONFLICT (tenant_id, external_ref) DO NOTHING;"),
    ], [[1,7,'A1'],[2,8,'A1']], 'Treating a generated ID as proof that two rows represent different business operations.', 'Should a customer name be the primary key?', 'Usually no. Different people can share a name and names can change. Use a stable identity and enforce any separate domain uniqueness rule with its own constraint.'),
  lesson('modeling--relationships-and-constraints',
    'Constraints make rules part of the database contract. They protect data regardless of which application, import job, or administrator performs a write. A foreign key enforces valid references; it does not automatically choose your deletion policy.', [
      t('Foreign keys', 'An order must reference an existing customer. Enable foreign-key enforcement in the practice engine before testing, and verify it on every connection that performs writes.'),
      t('CHECK and NOT NULL', 'CHECK rejects false expressions, while NULL can make an expression unknown. Use NOT NULL separately when a value is mandatory rather than expecting an arithmetic CHECK to reject missing data.'),
      t('Deletion policy', 'Decide whether deleting a parent should be restricted, cascade, or set a nullable reference to NULL. Historical purchases often need retention rather than automatic deletion.'),
    ], 'Inspect customer references and the difference between an absent reference and a missing parent.', [
      f('List referenced customers', 'SELECT DISTINCT customer_id FROM orders ORDER BY customer_id;', 'Orders use customer IDs 1, 2, and 3. Repeated references are valid in a one-to-many relationship.'),
      f('Verify every reference resolves', 'SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;', 'Each order matches exactly one parent because the referenced customer key is unique.'),
      f('Look for orphans', 'SELECT o.id FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL ORDER BY o.id;', 'No rows means there are no unmatched customer references in this fixture. The enforced foreign key prevents ordinary invalid inserts.'),
    ], [], 'Relying exclusively on a frontend dropdown to ensure references remain valid.', 'Does CHECK (amount_cents >= 0) prohibit NULL?', 'Not by itself in common SQL engines. NULL makes the comparison unknown rather than false. Add NOT NULL when every row must contain an amount.'),
  lesson('modeling--schema-design',
    'Schema design translates business rules into columns, types, and constraints. Start with the grain and required values, then describe uniqueness and relationships. A good schema makes invalid states difficult to store.', [
      t('Types express intent', 'Use integer minor units or an appropriate exact decimal type for money. Distinguish a calendar date from a timestamp instant, and state the timezone policy for event timestamps.'),
      t('Defaults are insert behavior', 'A DEFAULT supplies a value when the insert omits the column. It does not necessarily replace an explicitly supplied NULL or repair existing records.'),
      t('Constraints near the data', 'Declare row-local invariants such as nonnegative stock and required status. Cross-row invariants may require transactions, uniqueness, or a different model rather than a simple CHECK.'),
    ], 'Design a stock table with required identity, a default quantity, and a nonnegative constraint.', [
      f('Create the contract', 'SELECT COUNT(*) AS products FROM stock;', 'Stock starts empty; the schema defines the rules before any row is inserted.', 'CREATE TABLE stock (sku TEXT PRIMARY KEY NOT NULL, available INTEGER NOT NULL DEFAULT 0 CHECK (available >= 0));'),
      f('Use the default', 'SELECT sku, available FROM stock ORDER BY sku;', 'Omitting available sets it to zero. The default is not permission to ignore stock correctness.', "INSERT INTO stock (sku) VALUES ('BOOK');"),
      f('Apply a valid restock', 'SELECT sku, available FROM stock ORDER BY sku;', 'The update expresses a valid positive inventory change and preserves the invariant.', "UPDATE stock SET available = available + 5 WHERE sku = 'BOOK';"),
    ], [['BOOK',5]], 'Expecting a DEFAULT to convert explicit NULL into a usable business value.', 'What protects the table if an import tries to store −2 units?', 'The CHECK rejects a negative available value. NOT NULL independently rejects missing stock; both rules belong in the schema, not just in application validation.'),
  lesson('modeling--model-evolution',
    'Schema changes must account for data already stored and software versions running at the same time. Expand-compatible changes first, backfill deliberately, then tighten the contract after validation.', [
      t('Expand', 'Add an optional column before requiring every writer to supply it. Old application versions can continue inserting rows during a gradual rollout.'),
      t('Backfill', 'Populate existing rows in bounded batches when the table is large. Define how concurrent writes are handled so the backfill does not overwrite newer values.'),
      t('Validate and contract', 'Count unresolved records, update readers and writers, then enforce the stronger rule using the engine’s supported migration procedure. Lock behavior and ALTER TABLE capabilities vary.'),
    ], 'Introduce a customer notification preference without pretending old rows already contain one.', [
      f('Expand the schema', 'SELECT id, notification_mode FROM customers ORDER BY id;', 'Existing records have NULL in the added column. That is an explicit migration state.', 'ALTER TABLE customers ADD COLUMN notification_mode TEXT;'),
      f('Backfill existing rows', 'SELECT id, notification_mode FROM customers ORDER BY id;', 'Only unresolved values are assigned the chosen default, leaving any already populated value alone.', "UPDATE customers SET notification_mode = 'email' WHERE notification_mode IS NULL;"),
      f('Validate the backfill', 'SELECT COUNT(*) AS unresolved FROM customers WHERE notification_mode IS NULL;', 'Zero unresolved rows is evidence for the next migration step. It is not proof that every running writer uses the new contract.'),
    ], [[0]], 'Adding a required column and deploying new code at the same instant while old writers still run.', 'Why check current writers as well as old rows?', 'A backfill can finish while an old application keeps inserting missing values. Coordinate the writer rollout before enforcing a new required-field constraint.'),
  lesson('modeling--data-types-and-precision',
    'Numeric representation changes arithmetic. Integer division may truncate, binary floating point may approximate decimals, and exact decimal precision has limits. Choose a type based on the quantity rather than its appearance in the interface.', [
      t('Money and units', 'The fixture stores amount_cents as integers. Keep units in column names and convert for display at a controlled boundary; do not mix rupees and cents in one sum.'),
      t('Division and casting', 'Dividing two integers can produce an integer result. Introduce an appropriate decimal operand or cast when a fractional ratio is required, and verify behavior in your target engine.'),
      t('Missing and zero denominators', 'NULLIF(value, 0) converts a zero denominator to NULL. Decide whether an undefined ratio should remain NULL instead of silently displaying a misleading zero.'),
    ], 'Calculate a conversion rate and inspect integer versus fractional arithmetic.', [
      f('Observe integer arithmetic', 'SELECT 3 / 2 AS integer_ratio;', 'In this SQLite lab, dividing integers truncates the fractional part and returns 1.'),
      f('Request a fractional result', 'SELECT 3.0 / 2 AS decimal_ratio;', 'A fractional operand produces 1.5. Decimal display and exact storage are still different choices.'),
      f('Guard a missing denominator', 'SELECT 3.0 / 2 AS ratio, 3.0 / NULLIF(0, 0) AS undefined_ratio;', 'The second expression yields NULL, explicitly representing that the ratio is undefined.'),
    ], [[1.5,null]], 'Rounding an intermediate result before all arithmetic is complete, or assuming every engine divides integers the same way.', 'Should a report show 0% when there were zero eligible visitors?', 'Not automatically. The fraction is undefined, which is often better shown as NULL or “not applicable.” Zero would claim a measured rate with a valid denominator.'),
  lesson('modeling--null-and-three-valued-logic',
    'SQL conditions can be true, false, or unknown. Comparing NULL with an ordinary equality operator produces unknown. WHERE keeps only true rows, so both false and unknown disappear from the result.', [
      t('IS NULL expresses missingness', 'Use IS NULL or IS NOT NULL to ask whether a value is missing. NULL = NULL does not test missingness and does not become true just because both operands look identical.'),
      t('Unknown propagates', 'A comparison such as email <> a_value is unknown for a missing email. If you want to include missing values, state that branch explicitly with OR email IS NULL.'),
      t('Counting nullable values', 'COUNT(*) counts rows; COUNT(email) counts non-NULL emails. Empty strings are non-NULL values, so counting them does not validate that contact details are usable.'),
    ], 'Find customers missing an email address and compare both counting methods.', [
      f('Inspect missing values', 'SELECT id, name, email FROM customers ORDER BY id;', 'Ravi and Kabir have NULL email values. A visible NULL marker is different from an empty string.'),
      f('Filter with IS NULL', 'SELECT id, name FROM customers WHERE email IS NULL ORDER BY id;', 'Two rows pass because IS NULL is a definite missing-value test.'),
      f('Compare counts', 'SELECT COUNT(*) AS customers, COUNT(email) AS known_emails FROM customers;', 'There are four customer rows but only two non-NULL email values.'),
    ], [[4,2]], 'Using email = NULL, or assuming NOT IN is safe when its subquery may return NULL.', 'What does WHERE email = NULL return in this fixture?', 'No rows. Each comparison is unknown, and WHERE retains only true. Use email IS NULL to return Ravi and Kabir.'),
  lesson('modeling--normalization-and-functional-dependencies',
    'Normalization organizes facts around what determines them. When customer_id determines the customer’s current name and city, repeating those fields on every order creates multiple places to update the same fact.', [
      t('Functional dependencies', 'A dependency describes a rule such as customer_id determining customer details. An accidental pattern in a tiny sample does not establish a domain rule; verify the business meaning.'),
      t('Update anomalies', 'Repeated details can disagree after only some copies are updated. Splitting customer facts from order facts gives each a clear place of ownership.'),
      t('Intentional historical snapshots', 'A delivery address captured for an order is a historical fact, not merely another copy of the current customer address. Keep snapshots when their semantics require them.'),
    ], 'Keep one current customer city while multiple orders refer to that customer.', [
      f('Observe repeated joins', 'SELECT o.id, c.name, c.city FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.id = 1 ORDER BY o.id;', 'Asha’s current city appears twice in this result, but the value is stored once in customers.'),
      f('Change the owning fact', 'SELECT id, name, city FROM customers WHERE id = 1;', 'One update changes the customer’s current city. Historical address snapshots would require a separate field or table.', "UPDATE customers SET city = 'Mumbai' WHERE id = 1;"),
      f('Read through the relationship', 'SELECT o.id, c.city FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.id = 1 ORDER BY o.id;', 'Both result rows now show the current city because they reference the same owning customer record.'),
    ], [[101,'Mumbai'],[102,'Mumbai']], 'Calling every repeated value a normalization violation without distinguishing current facts from required historical snapshots.', 'Should old shipping labels change when the customer moves?', 'No. Store the delivery address used for each order as a historical snapshot. Normalizing current customer details does not remove the need to preserve transaction-time facts.'),
];
