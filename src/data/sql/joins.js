import { lesson, topic as t, frame as f } from './schema.js';
export default [
  lesson('joins--inner-joins',
    'An INNER JOIN returns a row for each matching pair. It does not simply glue tables side by side, and it does not guarantee one output row per left-hand record. The join key and relationship cardinality determine the result.', [
      t('Matching pairs', 'For each order, match customer_id to the customer primary key. A unique customer key gives at most one customer match for each order.'),
      t('Aliases and qualification', 'Short table aliases make the predicate readable and distinguish columns such as c.id and o.id. Select the identity appropriate to the result grain.'),
      t('Unmatched rows disappear', 'A customer with no order produces no matching pair. Use an outer join if the report must preserve that customer.'),
    ], 'Attach a customer name to every order while retaining one row per order.', [
      f('Inspect the left relation', 'SELECT id, customer_id FROM orders ORDER BY id;', 'The order key and customer reference are different columns with different roles.'),
      f('Trace one customer’s matches', 'SELECT o.id AS order_id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.id = 1 ORDER BY o.id;', 'Asha matches two order rows, so her name correctly appears twice.'),
      f('Join the complete relation', 'SELECT o.id AS order_id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id ORDER BY o.id;', 'All six orders resolve to a customer. Kabir is absent because there is no order referencing his ID.'),
    ], [[101,'Asha'],[102,'Asha'],[103,'Ravi'],[104,'Meera'],[105,'Ravi'],[106,'Meera']], 'Joining orders.id to customers.id just because both columns are named id.', 'Why are there six result rows when there are only four customers?', 'The result grain is one matching order/customer pair. A customer may own multiple orders, so customer names repeat without being duplicate order records.'),
  lesson('joins--left-joins-and-unmatched-rows',
    'A LEFT JOIN preserves each left-hand row even when no right-hand row matches. Missing right-hand columns are filled with NULL. Where you place a right-side filter determines whether those preserved rows survive.', [
      t('ON defines eligible matches', 'Put the paid-order condition in ON when every customer must remain in the result. The condition limits matching orders without deleting customers who have none.'),
      t('WHERE filters the joined result', 'WHERE o.status = paid removes NULL-extended rows because the comparison is unknown. That can unintentionally turn an outer-join report into matched-only behavior.'),
      t('Count the right key', 'COUNT(o.id) counts actual order matches. COUNT(*) also counts the placeholder row for a customer with no match, producing a misleading value of one.'),
    ], 'Count paid orders for every customer, including a zero for Kabir.', [
      f('Preserve all customers', 'SELECT c.id, c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id ORDER BY c.id, o.id;', 'Kabir remains as a row with a NULL order ID. Other customers have multiple matched rows.'),
      f('Limit the eligible matches', "SELECT c.id, c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid' ORDER BY c.id, o.id;", 'The paid predicate is part of matching. It excludes pending and cancelled orders while preserving all customers.'),
      f('Count real order IDs', "SELECT c.id, COUNT(o.id) AS paid_orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid' GROUP BY c.id ORDER BY c.id;", 'COUNT ignores the NULL placeholder, so Kabir correctly has zero paid orders.'),
    ], [[1,2],[2,1],[3,1],[4,0]], 'Putting a right-table predicate in WHERE when the requirement is to preserve unmatched left rows.', 'What would COUNT(*) report for Kabir after this LEFT JOIN?', 'One, because the preserved customer produces one NULL-extended result row. COUNT(o.id) reports zero because no real order ID is present.'),
  lesson('joins--cross-joins',
    'A CROSS JOIN produces every possible pair from two relations. It is useful for planned combinations such as sizes and colors, but a missing join predicate can accidentally create the same explosive multiplication.', [
      t('Cardinality multiplication', 'Two rows joined with three rows produce six pairs. Estimate this product before joining large inputs, especially when several independent dimensions are involved.'),
      t('Intentional combination grids', 'Use a cross join to generate allowed combinations, then filter restrictions explicitly. The result represents candidate combinations, not proof that every combination exists in inventory.'),
      t('Empty inputs', 'If either input is empty, there are no possible pairs. A cross join does not preserve unmatched rows like an outer join.'),
    ], 'Generate every combination of two colors and two sizes.', [
      f('Read colors', "SELECT 'blue' AS color UNION ALL SELECT 'red';", 'There are two color choices. They form one input relation.'),
      f('Read sizes', "SELECT 'M' AS size UNION ALL SELECT 'S';", 'There are two size choices. This input is independent of color.'),
      f('Generate all pairs', "WITH colors(color) AS (VALUES ('blue'),('red')), sizes(size) AS (VALUES ('M'),('S')) SELECT color, size FROM colors CROSS JOIN sizes ORDER BY color, size;", 'The 2 × 2 Cartesian product has four rows. Each row represents one possible variant.'),
    ], [['blue','M'],['blue','S'],['red','M'],['red','S']], 'Omitting a relationship condition from an ordinary join and then using DISTINCT to hide the multiplied rows.', 'How many pairs would 200 colors and 100 sizes produce?', '20,000 pairs before any filter. Add another independent dimension of 10 values and the result becomes 200,000 candidate combinations.'),
  lesson('joins--self-joins',
    'A self join uses the same table in two roles. Aliases identify those roles independently: one employee row can reference another employee row as its manager. This is a relationship within one entity type, not a reason to duplicate the table.', [
      t('Role-based aliases', 'Use e for the employee and m for the manager. The predicate e.manager_id = m.id compares a reference to an identity, not a row to itself.'),
      t('Root records', 'The top-level manager has a NULL manager_id. A LEFT JOIN preserves that root; an INNER JOIN would omit it.'),
      t('One level versus a hierarchy', 'One self join follows one relationship level. An unknown number of reporting levels calls for a recursive query or a different hierarchy representation.'),
    ], 'Show each employee with their direct manager, keeping the root employee.', [
      f('Inspect manager references', 'SELECT id, name, manager_id FROM employees ORDER BY id;', 'Nila is the root; Dev and Ira reference Nila, while Om references Dev.'),
      f('Match employees with a manager', 'SELECT e.id, e.name, m.name AS manager FROM employees e JOIN employees m ON m.id = e.manager_id ORDER BY e.id;', 'Only three employees have a matching manager. The root is absent from an inner join.'),
      f('Preserve the root', 'SELECT e.id, e.name, m.name AS manager FROM employees e LEFT JOIN employees m ON m.id = e.manager_id ORDER BY e.id;', 'The root stays in the report with a NULL manager. Each row still represents one employee.'),
    ], [[1,'Nila',null],[2,'Dev','Nila'],[3,'Ira','Nila'],[4,'Om','Dev']], 'Joining e.id = m.id, which only attaches each employee to the same employee again.', 'Would this query list every ancestor above Om?', 'No. It finds only Om’s direct manager, Dev. A second self join finds one more fixed level; a recursive CTE can traverse an arbitrary bounded hierarchy.'),
  lesson('joins--exists-and-anti-joins',
    'EXISTS asks whether a matching row exists without multiplying the outer result by the number of matches. NOT EXISTS expresses absence. These are often clearer than joining and then trying to remove duplicates.', [
      t('Existence is a Boolean question', 'SELECT 1 inside EXISTS is conventional because the subquery’s selected values are irrelevant. The predicate matters: does at least one qualifying row exist?' ),
      t('Correlate the keys', 'The subquery must relate to the current outer customer. Without that relation, it asks whether any order exists in the entire database and gives every customer the same answer.'),
      t('NULL-safe absence', 'NOT IN can evaluate to unknown if its input contains NULL. NOT EXISTS with an explicit relationship avoids that particular trap and makes the intended absence test visible.'),
    ], 'Find customers who have never placed an order.', [
      f('Inspect order ownership', 'SELECT DISTINCT customer_id FROM orders ORDER BY customer_id;', 'Three customer IDs have orders. Multiple orders do not create extra customer identities.'),
      f('Ask who has a match', 'SELECT c.id, c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.id;', 'Each customer appears at most once, even if the subquery finds several orders.'),
      f('Ask who has no match', 'SELECT c.id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY c.id;', 'Only Kabir has no corresponding order. This is an anti-join expressed as an absence predicate.'),
    ], [[4,'Kabir']], 'Forgetting the correlation predicate and asking only whether the orders table is nonempty.', 'Why not use a plain JOIN to list customers with any order?', 'A join returns one row per match and repeats customers with multiple orders. EXISTS naturally answers the yes-or-no relationship question at customer grain.'),
  lesson('joins--join-cardinality-and-double-counting',
    'Joining a parent to several children repeats the parent values once per child. Summing a parent amount after that join can inflate revenue. Decide the grain of each measure before joining relations at different grains.', [
      t('One-to-many multiplication', 'Order 101 has two lines, so its 1,200-cent header appears twice in a line-level join. The repetitions are valid join rows, but not two independent purchases.'),
      t('Aggregate at the owning grain', 'Sum header totals from one row per order, or sum quantity times captured price from line rows. Do not combine both without an explicit reconciliation rule.'),
      t('Pre-aggregate child relations', 'When joining multiple child tables, aggregate each to one row per parent first. Otherwise a two-line order with three payments can create six joined rows.'),
    ], 'Compare a wrong header sum with a correctly calculated line-level total.', [
      f('See the repeated header', 'SELECT o.id, o.amount_cents, i.product FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.id = 101 ORDER BY i.id;', 'The two line records each carry the same header amount. Adding that column here counts the order twice.'),
      f('Observe the inflated sum', "SELECT SUM(o.amount_cents) AS wrong_cents FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.status = 'paid';", 'The result is 5,200 cents because order 101’s header contributes twice.'),
      f('Sum the line-owned measure', "SELECT SUM(i.quantity * i.unit_cents) AS paid_cents FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.status = 'paid';", 'The captured line values total 4,000 cents, matching the paid order headers in this fixture.'),
    ], [[4000]], 'Using SUM(DISTINCT header_amount) as a repair; different real orders can share the same amount.', 'How would you join line totals and payment totals safely?', 'Aggregate each child relation by order_id first, then join those one-row-per-order summaries to the order header. Check uniqueness at every intermediate grain.'),
];
