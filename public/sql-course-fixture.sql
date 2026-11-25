-- SQL course practice fixture. Run once in a new empty SQLite database.
-- Use a fresh database for each lesson. Amounts are integer minor units.
PRAGMA foreign_keys = ON;
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'cancelled')),
  ordered_on TEXT NOT NULL
);
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cents INTEGER NOT NULL CHECK (unit_cents >= 0)
);
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  manager_id INTEGER REFERENCES employees(id),
  department TEXT NOT NULL,
  salary INTEGER NOT NULL
);
INSERT INTO customers VALUES
  (1, 'Asha', 'Pune', 'asha@example.test'),
  (2, 'Ravi', 'Delhi', NULL),
  (3, 'Meera', 'Pune', 'meera@example.test'),
  (4, 'Kabir', 'Jaipur', NULL);
INSERT INTO orders VALUES
  (101, 1, 1200, 'paid', '2026-01-03'),
  (102, 1, 800, 'paid', '2026-01-05'),
  (103, 2, 500, 'pending', '2026-01-05'),
  (104, 3, 1500, 'paid', '2026-01-06'),
  (105, 2, 500, 'paid', '2026-01-07'),
  (106, 3, 300, 'cancelled', '2026-01-08');
INSERT INTO order_items VALUES
  (1, 101, 'Notebook', 2, 400),
  (2, 101, 'Pen set', 1, 400),
  (3, 102, 'Notebook', 2, 400),
  (4, 104, 'Backpack', 1, 1500),
  (5, 105, 'Bottle', 1, 500);
INSERT INTO employees VALUES
  (1, 'Nila', NULL, 'Engineering', 90000),
  (2, 'Dev', 1, 'Engineering', 70000),
  (3, 'Ira', 1, 'Engineering', 70000),
  (4, 'Om', 2, 'Support', 50000);
