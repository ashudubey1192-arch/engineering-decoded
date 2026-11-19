import { lesson } from "../../schema.js";

const note =
  "This program compiles with the JDK alone, but needs a running database (Oracle XE with the ojdbc driver on the classpath) to execute, so the output shown is from a sample run.";

export default [
  lesson("JDBC Q21-Q31: Connection, Metadata, Pagination, Top-N, Dates and Timestamps, and RowSets", {
    intro:
      "Questions 21 to 31 cover:\n\n- the Connection interface\n- ResultSetMetaData and DatabaseMetaData\n- pagination and top-N queries\n- inserting dates and timestamps\n- the RowSet family: what connected and disconnected RowSets are, the connected and disconnected types, and ResultSet vs RowSet\n\nThe program prints metadata, pages through rows, stores `java.time` values, and edits a disconnected CachedRowSet offline before syncing it back.",
    topics: [
      [
        "Q21. What is the Connection interface?",
        "`java.sql.Connection` represents **a session with a specific database**. It is the factory for statements (`createStatement`, `prepareStatement`, `prepareCall`) and the place where transactions are controlled: `setAutoCommit`, `commit`, `rollback`, `setSavepoint`, `setTransactionIsolation`. It also provides `getMetaData()` (DatabaseMetaData), `setReadOnly`, `setSchema` and `setCatalog`, network timeouts, `isValid(timeout)` to check liveness, and LOB factories (`createBlob`, `createClob`). Connections are expensive to create, so production code borrows them from a **connection pool** through a DataSource, and must always close them, which returns them to the pool.",
      ],
      [
        "Q22. What is ResultSetMetaData?",
        "`rs.getMetaData()` returns **information about the columns of a ResultSet**:\n\n- `getColumnCount()`\n- `getColumnName(i)` and `getColumnLabel(i)`, where the label honours aliases\n- `getColumnType(i)` (a `java.sql.Types` constant) and `getColumnTypeName(i)` (for example \"VARCHAR2\")\n- `getPrecision(i)` and `getScale(i)`\n- `isNullable(i)`, `isAutoIncrement(i)`\n- `getColumnClassName(i)`, the Java class you will get\n- `getTableName(i)`\n\nIt lets generic code, such as report generators, CSV exporters and ORMs, process query results without knowing the columns in advance.",
      ],
      [
        "Q23. What is DatabaseMetaData?",
        "`con.getMetaData()` returns **information about the database and the driver as a whole**:\n\n- product name and version, and driver name and version\n- the JDBC version supported\n- the URL and user name\n- feature support checks (`supportsBatchUpdates`, `supportsTransactions`, `supportsResultSetType`, `supportsSavepoints`)\n- limits (`getMaxConnections`)\n- catalog browsing: `getTables`, `getColumns`, `getPrimaryKeys`, `getImportedKeys`, `getIndexInfo` and `getProcedures`, all returned as ResultSets\n\nTools such as database IDEs, schema migration tools and ORMs use it to adapt to different databases.",
      ],
      [
        "Q24. How do you implement pagination?",
        "Let the **database** do it, so that only one page travels over the network.\n\n- **Standard SQL** (Oracle 12c+, PostgreSQL, SQL Server 2012+, DB2): `SELECT ... ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`.\n- **MySQL and PostgreSQL**: `LIMIT ? OFFSET ?`.\n- **Older Oracle**: a ROWNUM wrapper, `SELECT * FROM (SELECT t.*, ROWNUM rn FROM (SELECT ... ORDER BY id) t WHERE ROWNUM <= :end) WHERE rn > :start`.\n\nBind the offset and the page size with a PreparedStatement, and always use a deterministic ORDER BY. For deep pages, **keyset (seek) pagination** is much faster: `WHERE id > :lastSeenId ORDER BY id FETCH FIRST ? ROWS ONLY`. `setMaxRows` and scrollable result sets are client-side alternatives, and they are inefficient.",
      ],
      [
        "Q25. How do you fetch the top N rows?",
        "- **Standard (Oracle 12c+, PostgreSQL, DB2)**: `SELECT ... ORDER BY salary DESC FETCH FIRST ? ROWS ONLY`.\n- **MySQL and PostgreSQL**: `ORDER BY salary DESC LIMIT ?`.\n- **SQL Server**: `SELECT TOP (?) ...`.\n- **Old Oracle**: `SELECT * FROM (SELECT ... ORDER BY salary DESC) WHERE ROWNUM <= ?`. The ORDER BY must be inside the subquery, because ROWNUM is assigned before ORDER BY in the same query block.\n\nTo include ties, use `FETCH FIRST n ROWS WITH TIES`, or `RANK()` and `DENSE_RANK()`. To get the top N per group, use `ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)`.",
      ],
      [
        "Q26. How do you insert a date?",
        "Bind it with a PreparedStatement rather than formatting date strings. The modern way (JDBC 4.2) is `ps.setObject(i, LocalDate.of(2026, 11, 19))`, read back with `rs.getObject(\"hired\", LocalDate.class)`. The legacy way is `ps.setDate(i, java.sql.Date.valueOf(localDate))` with `rs.getDate(...).toLocalDate()`. Never insert `new java.util.Date()` text through string concatenation, because the format and timezone then depend on database settings. A literal date in SQL should use `DATE '2026-11-19'`. Note that Oracle's DATE type also stores a time of day.",
      ],
      [
        "Q27. How do you insert a timestamp?",
        "Use `ps.setObject(i, LocalDateTime.now())` for a TIMESTAMP column, or `ps.setTimestamp(i, Timestamp.valueOf(ldt))`. For an instant with a time zone, use `OffsetDateTime` with a `TIMESTAMP WITH TIME ZONE` column, or store UTC: `setObject(i, OffsetDateTime.now(ZoneOffset.UTC))`. Read the value with `rs.getObject(\"created\", LocalDateTime.class)` or `getTimestamp(...).toLocalDateTime()`. `java.sql.Timestamp` keeps nanoseconds, but many databases store only microseconds. Server-side defaults (`DEFAULT SYSTIMESTAMP`, `CURRENT_TIMESTAMP`) avoid clock differences between clients.",
      ],
      [
        "Q28. What is a RowSet? What are connected and disconnected RowSets?",
        "`javax.sql.RowSet` extends ResultSet and makes it a **JavaBeans component**. It carries its own connection properties and command (`setUrl`, `setCommand`, `execute()`), supports listeners for row changes, and is **scrollable and updatable** by default. A **connected** RowSet keeps a database connection open while you use it, like a wrapped ResultSet. A **disconnected** RowSet loads the data, closes the connection, lets you read and modify the rows **offline**, can be serialized and sent across tiers, and reconnects only to write changes back with `acceptChanges()`. You create them with `RowSetProvider.newFactory()`.",
      ],
      [
        "Q29. What are the connected RowSets?",
        "**JdbcRowSet** is the one connected implementation in `javax.sql.rowset`. It wraps a ResultSet and keeps the connection open, adding JavaBeans properties, event listeners, and scrollability and updatability even when the driver's ResultSet lacks them. It is not serializable in practice, because it holds a live connection. Use it when you want ResultSet behaviour with a bean-style API, for example in a GUI bound to the table.",
      ],
      [
        "Q30. What are the disconnected RowSets?",
        "- **CachedRowSet**: caches all the rows in memory, works offline, and syncs back with `acceptChanges()`, detecting conflicts through a SyncProvider.\n- **WebRowSet** (extends CachedRowSet): can read and write its data and metadata as **XML** (`writeXml` and `readXml`).\n- **JoinRowSet**: performs an in-memory SQL-style **JOIN** of several RowSets on a match column.\n- **FilteredRowSet**: applies a **Predicate** filter to a cached row set without querying the database again.\n\nAll of them are serializable, and suit transferring small to medium datasets between tiers.",
      ],
      [
        "Q31. What is the difference between a ResultSet and a RowSet?",
        "- **Connection**: a ResultSet is always tied to an open Statement and Connection. A RowSet can be connected (JdbcRowSet) or disconnected (CachedRowSet and its subtypes).\n- **Scrolling and updates**: a ResultSet is forward-only and read-only by default. A RowSet is scrollable and updatable by default.\n- **JavaBeans**: a RowSet has properties and listeners; a ResultSet has neither.\n- **Serialization**: a ResultSet cannot be serialized. Disconnected RowSets can.\n- **Creation**: a ResultSet comes from executing a Statement. A RowSet can execute its own command.\n- **Offline editing and XML**: only RowSets support them (CachedRowSet and WebRowSet).\n\nThe trade-off is that disconnected RowSets keep all rows in memory.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.time.*;
import javax.sql.rowset.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE", USER = "hr", PWD = "hr";

    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(URL, USER, PWD)) {
            // Q21 + Q23: connection and database metadata.
            DatabaseMetaData db = con.getMetaData();
            System.out.println("Q23 " + db.getDatabaseProductName() + " " + db.getDatabaseMajorVersion()
                    + ", JDBC " + db.getJDBCMajorVersion() + "." + db.getJDBCMinorVersion()
                    + ", batch updates " + db.supportsBatchUpdates() + ", savepoints " + db.supportsSavepoints());
            System.out.println("Q21 connection valid " + con.isValid(2) + ", auto-commit " + con.getAutoCommit());

            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE iq_staff (id NUMBER PRIMARY KEY, name VARCHAR2(20), salary NUMBER, hired DATE, created TIMESTAMP)");
            }

            // Q26 + Q27: java.time values bound with setObject.
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_staff VALUES (?, ?, ?, ?, ?)")) {
                String[] names = {"Anu", "Bala", "Chitra", "Dev", "Esha", "Farid", "Gita"};
                for (int i = 0; i < names.length; i++) {
                    ps.setInt(1, i + 1);
                    ps.setString(2, names[i]);
                    ps.setInt(3, 30000 + i * 5000);
                    ps.setObject(4, LocalDate.of(2020 + i % 3, 1 + i, 15));                 // DATE
                    ps.setObject(5, LocalDateTime.of(2026, 11, 19, 9, 30).plusMinutes(i));  // TIMESTAMP
                    ps.addBatch();
                }
                ps.executeBatch();
            }
            try (PreparedStatement ps = con.prepareStatement("SELECT hired, created FROM iq_staff WHERE id = 3");
                 ResultSet rs = ps.executeQuery()) {
                rs.next();
                System.out.println("Q26 hired " + rs.getObject("hired", LocalDate.class) + " | Q27 created " + rs.getObject("created", LocalDateTime.class));
            }

            // Q22: column information for any query.
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT id, name AS staff_name, salary FROM iq_staff")) {
                ResultSetMetaData md = rs.getMetaData();
                StringBuilder cols = new StringBuilder();
                for (int i = 1; i <= md.getColumnCount(); i++) cols.append(md.getColumnLabel(i)).append(':').append(md.getColumnTypeName(i)).append(' ');
                System.out.println("Q22 " + md.getColumnCount() + " columns -> " + cols.toString().trim());
            }

            // Q24: page 2 with 3 rows per page (OFFSET ... FETCH).
            try (PreparedStatement ps = con.prepareStatement("SELECT name FROM iq_staff ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY")) {
                int page = 2, size = 3;
                ps.setInt(1, (page - 1) * size);
                ps.setInt(2, size);
                try (ResultSet rs = ps.executeQuery()) {
                    StringBuilder names = new StringBuilder();
                    while (rs.next()) names.append(rs.getString(1)).append(' ');
                    System.out.println("Q24 page " + page + " -> " + names.toString().trim());
                }
            }

            // Q25: top 2 earners.
            try (PreparedStatement ps = con.prepareStatement("SELECT name, salary FROM iq_staff ORDER BY salary DESC FETCH FIRST ? ROWS ONLY")) {
                ps.setInt(1, 2);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) System.out.println("Q25 top earner " + rs.getString(1) + " " + rs.getInt(2));
                }
            }

            // Q29: a connected JdbcRowSet keeps the connection while used.
            RowSetFactory factory = RowSetProvider.newFactory();
            try (JdbcRowSet jrs = factory.createJdbcRowSet()) {
                jrs.setUrl(URL); jrs.setUsername(USER); jrs.setPassword(PWD);
                jrs.setCommand("SELECT name FROM iq_staff ORDER BY id");
                jrs.execute();
                jrs.last();
                System.out.println("Q29 JdbcRowSet (connected) last row: " + jrs.getString(1));
            }

            // Q28 + Q30 + Q31: a disconnected CachedRowSet edited offline, then synced.
            try (CachedRowSet crs = factory.createCachedRowSet()) {
                crs.setUrl(URL); crs.setUsername(USER); crs.setPassword(PWD);
                crs.setCommand("SELECT id, name, salary FROM iq_staff WHERE id <= 2");
                crs.setKeyColumns(new int[] {1});
                crs.execute();                                      // fills the cache, then disconnects
                System.out.println("Q30 CachedRowSet loaded " + crs.size() + " rows and closed its connection");
                crs.absolute(1);
                crs.updateInt("salary", 99000);                     // offline change
                crs.updateRow();
                con.setAutoCommit(false);
                crs.acceptChanges(con);                             // reconnects, writes, commits
                con.setAutoCommit(true);
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT salary FROM iq_staff WHERE id = 1")) {
                rs.next();
                System.out.println("Q31 change made offline is now in the table: " + rs.getInt(1));
            }

            try (Statement st = con.createStatement()) { st.executeUpdate("DROP TABLE iq_staff"); }
        } catch (SQLException e) {
            System.out.println("Database error " + e.getSQLState() + ": " + e.getMessage());
        }
    }
}`,
    mode: "compile",
    note,
    sample: String.raw`Q23 Oracle 21, JDBC 4.3, batch updates true, savepoints true
Q21 connection valid true, auto-commit true
Q26 hired 2022-03-15 | Q27 created 2026-11-19T09:32
Q22 3 columns -> ID:NUMBER STAFF_NAME:VARCHAR2 SALARY:NUMBER
Q24 page 2 -> Dev Esha Farid
Q25 top earner Gita 60000
Q25 top earner Farid 55000
Q29 JdbcRowSet (connected) last row: Gita
Q30 CachedRowSet loaded 2 rows and closed its connection
Q31 change made offline is now in the table: 99000`,
    walk:
      "DatabaseMetaData reports the product, the JDBC version and the supported features, and the Connection confirms that it is valid (Q21, Q23). Seven staff rows are inserted in one batch. Dates and timestamps are bound as `LocalDate` and `LocalDateTime` with `setObject`, and read back with typed `getObject` (Q26, Q27). ResultSetMetaData lists the query's three columns and shows the alias STAFF_NAME as the label (Q22).\n\nPage 2 with three rows per page skips three rows and fetches Dev, Esha and Farid, using OFFSET and FETCH (Q24). `FETCH FIRST 2 ROWS ONLY` after a descending sort returns the two top earners (Q25). A JdbcRowSet runs its own command over a live connection, and scrolls to the last row (Q29). A CachedRowSet loads two rows and disconnects. The program changes a salary offline, and `acceptChanges(con)` writes the change back, which the final query confirms (Q28, Q30, Q31).",
    anim: [
      "A disconnected CachedRowSet",
      [
        ["db", "database", "iq_staff"],
        ["crs", "CachedRowSet", "rows in memory"],
        ["app", "application", "edits offline"],
        ["sync", "SyncProvider", "acceptChanges"],
      ],
      [
        ["crs", "db", "execute()", "The RowSet connects, runs its command and copies the rows into memory."],
        ["db", "crs", "disconnect", "The connection is closed; the rows stay available, scrollable and updatable."],
        ["app", "crs", "updateRow()", "The application changes a salary without any open connection."],
        ["crs", "sync", "acceptChanges", "On sync, the provider reconnects and compares the original values."],
        ["sync", "db", "UPDATE", "If no conflict is found, the change is written and committed."],
      ],
    ],
    mistakes: [
      "Paginating by loading all rows and skipping them in Java. Let the database return only the page.",
      "Writing ROWNUM and ORDER BY in the same query block for a top-N query. ROWNUM is assigned before sorting.",
      "Formatting dates into SQL strings instead of binding `LocalDate` or `LocalDateTime`.",
      "Loading large tables into a CachedRowSet. All rows live in memory.",
    ],
    qa: [
      [
        "Why is OFFSET pagination slow for deep pages?",
        "The database must still read and discard all the skipped rows. Keyset pagination (`WHERE id > lastId ORDER BY id`) jumps straight to the next page through the index.",
      ],
      [
        "What is the difference between getColumnName and getColumnLabel?",
        "`getColumnName` is the underlying column name, while `getColumnLabel` is the name the query gives it (its alias). Generic code should use the label.",
      ],
      [
        "Is the RowSet API still used?",
        "Rarely in new code, which uses DTOs, JSON and ORMs instead. It is still part of the JDK (module `java.sql.rowset`), and appears in legacy and desktop applications.",
      ],
    ],
    ex: [
      "Rewrite the Q24 query as keyset pagination that returns the next 3 staff after the last id seen.",
      "`SELECT id, name FROM iq_staff WHERE id > ? ORDER BY id FETCH FIRST 3 ROWS ONLY`, binding the last id from the previous page. It uses the primary key index, so every page costs the same, however deep it is.",
    ],
  }),

  lesson("JDBC Q32-Q40: Connection Pooling, Best Practices, SQLExceptions, ORA Errors, Functions, Batch and Savepoints", {
    intro:
      "The last JDBC questions, 32 to 40, are about running JDBC in production:\n\n- connection pooling\n- best practices\n- the SQLExceptions you meet most often\n- invalid column name and invalid column index errors\n- ORA-01000 (maximum open cursors exceeded) and ORA-12560 (TNS protocol adapter error)\n- executing database functions\n- batch processing\n- savepoints and partial rollback\n\nThe program reproduces the column errors, runs a batch, calls a function, and rolls back to a savepoint.",
    topics: [
      [
        "Q32. What is connection pooling?",
        "Creating a physical database connection is expensive: TCP set-up, authentication and a server session can take tens of milliseconds. A **connection pool** keeps a set of open connections ready. `dataSource.getConnection()` borrows one, and `close()` **returns it to the pool** instead of closing it. Pools cap the number of connections, which protects the database, validate connections (test queries, `isValid`), time out idle and abandoned ones, and expose metrics. Popular pools are **HikariCP** (the Spring Boot default), Apache DBCP2, c3p0, Oracle UCP, and application-server pools exposed through JNDI. The typical settings are maximumPoolSize, minimumIdle, connectionTimeout, idleTimeout and maxLifetime.",
      ],
      [
        "Q33. What are the JDBC best practices?",
        "1. Use a **connection pool** (DataSource), not DriverManager, in servers.\n2. Close resources with **try-with-resources**, in reverse order.\n3. Always use **PreparedStatement** with bound parameters: safe and cacheable.\n4. **Batch** inserts and updates.\n5. Manage **transactions** explicitly, keep them short, and roll back on failure.\n6. Select only the columns you need, never `SELECT *`.\n7. Tune `setFetchSize` for large reads.\n8. Use `java.time` types through setObject and getObject.\n9. Handle SQLException with its **SQLState and vendor error code**, and log the context.\n10. Paginate in SQL.\n11. Avoid N+1 query patterns.\n12. Externalise credentials, and use least-privilege database accounts.\n13. Set query and network timeouts (`setQueryTimeout`).",
      ],
      [
        "Q34. Which SQLExceptions occur most often?",
        "- **Connection failures**: wrong URL, host or port, a listener that is down (SQLState class 08), or ORA-12541 and ORA-12560.\n- **Authentication**: wrong user or password (ORA-01017).\n- **Syntax errors**: SQLState 42000, `SQLSyntaxErrorException`, ORA-00942 (table or view does not exist).\n- **Constraint violations**: duplicate key (ORA-00001), foreign key or NOT NULL violations, all `SQLIntegrityConstraintViolationException` (SQLState 23xxx).\n- **Invalid column index or name** (Q35).\n- **Data errors**: ORA-01722 (invalid number), value too large (ORA-12899), conversion and truncation errors (SQLState 22).\n- **Resource and state errors**: ORA-01000 (Q36), a closed connection, ResultSet or statement, `SQLTimeoutException`.\n- **Concurrency**: deadlocks and lock timeouts, which are `SQLTransactionRollbackException` (SQLState 40001).\n\nJDBC 4 groups them into subclasses of `SQLTransientException`, `SQLNonTransientException` and `SQLRecoverableException`.",
      ],
      [
        "Q35. What causes invalid column name and invalid column index errors?",
        "**Invalid column index** (Oracle ORA-17003) means you used a parameter or column index that does not exist:\n\n- 0-based indexes, when JDBC indexes start at **1**\n- `ps.setString(3, ...)` when the SQL has only two `?` placeholders\n- `rs.getString(5)` on a query that returns four columns\n- a `?` written inside quotes (`'?'`), which is a literal, not a placeholder\n\n**Invalid column name** (ORA-17006 from the driver, or ORA-00904 \"invalid identifier\" from the server) means a name in `rs.getString(\"nme\")`, or in the SQL itself, does not match any column or alias in the result. Typical causes are typos, using the column name when an alias was given, or selecting a column that was never in the query. Fix the index or name. ResultSetMetaData shows what the result really contains.",
      ],
      [
        "Q36. What is ORA-01000: maximum open cursors exceeded?",
        "Each open Statement and ResultSet holds a **cursor** in the Oracle session, and the database limits how many a session may have (the `OPEN_CURSORS` parameter, often 300). ORA-01000 almost always means a **resource leak**: statements or result sets that are created in a loop and never closed, or closed only on the success path. The fix is to close every Statement and ResultSet in **try-with-resources**, and to reuse a single PreparedStatement inside loops instead of preparing a new one per iteration. Raising OPEN_CURSORS only hides the leak. Statement caching in the driver keeps a few cursors open on purpose, and that is normal.",
      ],
      [
        "Q37. What is ORA-12560: TNS protocol adapter error?",
        "It is an Oracle Net (TNS) error meaning the client **could not reach the database through the protocol adapter**. It is common with local, Windows and OCI or SQL*Plus connections. The causes:\n\n- the database service or the **listener is not running** (on Windows, the OracleServiceXE or OracleXETNSListener services are stopped)\n- the `ORACLE_SID` environment variable is wrong or not set for a local connection\n- a wrong host or port in the connect string, or a firewall\n\nThe fixes are to start the service and the listener (`lsnrctl start`), set ORACLE_SID, check `tnsnames.ora` and `listener.ora`, and test with `tnsping`. With the JDBC thin driver, the equivalents are ORA-12541 (no listener) or \"IO Error: The Network Adapter could not establish the connection\".",
      ],
      [
        "Q38. How do you execute a database function from JDBC?",
        "Use a **CallableStatement** with the function escape syntax: `{? = call function_name(?, ?)}`. Register the **return value as parameter 1** (`cs.registerOutParameter(1, Types.NUMERIC)`), set the input parameters starting at index 2, call `execute()`, and read the result with `cs.getBigDecimal(1)`. A function can also be called inside a plain query: `SELECT function_name(?) FROM dual` in Oracle, or `SELECT function_name(?)` elsewhere, executed through a PreparedStatement and read from the ResultSet.",
      ],
      [
        "Q39. What is batch processing?",
        "Batch processing sends **many statements to the database in one round trip**, instead of one at a time, which can be ten to a hundred times faster for bulk inserts and updates. With a PreparedStatement: set the parameters, call `addBatch()`, repeat, then call `executeBatch()`, which returns an `int[]` of update counts. `Statement.addBatch(sql)` also works for different SQL strings. Do it inside a transaction (auto-commit off), commit after each chunk of, say, 1,000 rows, and handle `BatchUpdateException`, whose `getUpdateCounts()` shows how far the batch got. Drivers may return `Statement.SUCCESS_NO_INFO` (-2) instead of exact counts. Check `DatabaseMetaData.supportsBatchUpdates()`.",
      ],
      [
        "Q40. What are savepoints, and how do you roll back to one?",
        "A **savepoint** marks a point **inside a transaction** that you can roll back to without undoing the whole transaction. With auto-commit off, `Savepoint sp = con.setSavepoint(\"afterOrder\");` creates one. `con.rollback(sp)` undoes only the work done after it, and the transaction stays open, so earlier work can still be committed. `con.releaseSavepoint(sp)` discards a savepoint you no longer need. Savepoints are useful for optional steps, such as sending a loyalty bonus whose failure should not cancel the main order. A full `rollback()` or `commit()` ends the transaction and invalidates all its savepoints.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(URL, "hr", "hr")) {
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE iq_orders (id NUMBER PRIMARY KEY, item VARCHAR2(20), qty NUMBER)");
                st.executeUpdate("CREATE OR REPLACE FUNCTION iq_total_qty RETURN NUMBER AS t NUMBER; "
                        + "BEGIN SELECT NVL(SUM(qty), 0) INTO t FROM iq_orders; RETURN t; END;");
            }

            // Q39: batch insert in a transaction, committing once.
            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_orders VALUES (?, ?, ?)")) {
                for (int i = 1; i <= 5; i++) {
                    ps.setInt(1, i); ps.setString(2, "item" + i); ps.setInt(3, i * 2);
                    ps.addBatch();                                    // queued, not sent yet
                }
                int[] counts = ps.executeBatch();                     // one round trip
                con.commit();
                System.out.println("Q39 batch executed " + counts.length + " inserts, update counts " + Arrays.toString(counts));
            }

            // Q39: a failing batch reports how far it got.
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_orders VALUES (?, ?, ?)")) {
                ps.setInt(1, 6); ps.setString(2, "ok"); ps.setInt(3, 1); ps.addBatch();
                ps.setInt(1, 1); ps.setString(2, "duplicate"); ps.setInt(3, 1); ps.addBatch();   // primary key clash
                ps.executeBatch();
            } catch (BatchUpdateException e) {
                con.rollback();
                System.out.println("Q34 BatchUpdateException " + e.getErrorCode() + " (ORA-00001 unique constraint), rolled back");
            }

            // Q40: savepoint - keep the order, undo only the optional bonus step.
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_orders VALUES (?, ?, ?)")) {
                ps.setInt(1, 10); ps.setString(2, "laptop"); ps.setInt(3, 1); ps.executeUpdate();
                Savepoint afterOrder = con.setSavepoint("afterOrder");
                ps.setInt(1, 11); ps.setString(2, "bonus-mug"); ps.setInt(3, 1); ps.executeUpdate();
                con.rollback(afterOrder);                             // undo the bonus only
                con.commit();
                System.out.println("Q40 rolled back to savepoint 'afterOrder' and committed the order");
            }
            con.setAutoCommit(true);

            // Q38: call a database function.
            try (CallableStatement cs = con.prepareCall("{? = call iq_total_qty}")) {
                cs.registerOutParameter(1, Types.NUMERIC);
                cs.execute();
                System.out.println("Q38 iq_total_qty() = " + cs.getInt(1) + " (30 from the batch + 1 laptop)");
            }

            // Q35: invalid column index and invalid column name.
            try (PreparedStatement ps = con.prepareStatement("SELECT item FROM iq_orders WHERE id = ?")) {
                ps.setInt(2, 1);                                      // only one placeholder exists
            } catch (SQLException e) {
                System.out.println("Q35 " + e.getMessage().trim());
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT item FROM iq_orders WHERE id = 1")) {
                rs.next();
                rs.getString("itme");                                 // typo
            } catch (SQLException e) {
                System.out.println("Q35 " + e.getMessage().trim());
            }

            // Q36: the leak pattern behind ORA-01000, and the fix.
            for (int i = 0; i < 3; i++) {
                try (PreparedStatement ps = con.prepareStatement("SELECT qty FROM iq_orders WHERE id = ?")) {  // closed every time
                    ps.setInt(1, i + 1);
                    try (ResultSet rs = ps.executeQuery()) { rs.next(); }
                }
            }
            System.out.println("Q36 statements and result sets closed in try-with-resources: no cursor leak");

            // Q32 + Q33: pooled connections come from a DataSource (HikariCP in production);
            // closing a pooled connection returns it to the pool.
            System.out.println("Q32 this demo uses DriverManager; production code calls dataSource.getConnection()");

            try (Statement st = con.createStatement()) { st.executeUpdate("DROP TABLE iq_orders"); st.executeUpdate("DROP FUNCTION iq_total_qty"); }
        } catch (SQLException e) {
            // Q34 + Q37: SQLState and vendor code identify the failure (ORA-12560 / ORA-12541 when unreachable).
            System.out.println("Database error SQLState " + e.getSQLState() + ", code " + e.getErrorCode() + ": " + e.getMessage());
        }
    }
}`,
    mode: "compile",
    note,
    sample: String.raw`Q39 batch executed 5 inserts, update counts [1, 1, 1, 1, 1]
Q34 BatchUpdateException 1 (ORA-00001 unique constraint), rolled back
Q40 rolled back to savepoint 'afterOrder' and committed the order
Q38 iq_total_qty() = 31 (30 from the batch + 1 laptop)
Q35 Invalid column index
Q35 Invalid column name
Q36 statements and result sets closed in try-with-resources: no cursor leak
Q32 this demo uses DriverManager; production code calls dataSource.getConnection()`,
    walk:
      "Five inserts are queued with `addBatch()` and sent in one `executeBatch()` round trip inside a transaction, and each update count is 1 (Q39). A second batch contains a duplicate primary key. The driver throws BatchUpdateException with Oracle error 1 (ORA-00001), and the transaction is rolled back (Q34). The savepoint step inserts an order, marks a savepoint, inserts a bonus item, then rolls back to the savepoint and commits, so only the laptop order remains (Q40).\n\nThe function call uses `{? = call ...}` with the return value registered as parameter 1. It returns 31: 2 + 4 + 6 + 8 + 10 = 30 from the batch, plus the one laptop (Q38). Binding parameter 2 when the SQL has one placeholder gives \"Invalid column index\", and reading the misspelt column \"itme\" gives \"Invalid column name\" (Q35). The loop closes every statement and result set, the pattern that prevents ORA-01000 (Q36). The outer catch shows where the SQLState and vendor code of connection errors such as ORA-12560 would surface (Q37).",
    anim: [
      "Savepoint: undo part of a transaction",
      [
        ["tx", "transaction", "auto-commit off"],
        ["ins1", "INSERT laptop", "the order"],
        ["sp", "savepoint", "afterOrder"],
        ["ins2", "INSERT bonus", "optional step"],
        ["commit", "commit()", "durable"],
      ],
      [
        ["tx", "ins1", "insert", "The main order row is inserted inside the open transaction."],
        ["ins1", "sp", "setSavepoint", "A savepoint marks this point so later work can be undone on its own."],
        ["sp", "ins2", "insert", "The optional bonus row is inserted after the savepoint."],
        ["ins2", "sp", "rollback(sp)", "rollback(savepoint) undoes only the bonus; the order row stays."],
        ["sp", "commit", "commit", "commit() makes the order durable; the transaction and savepoint end."],
      ],
    ],
    mistakes: [
      "Creating a new PreparedStatement inside a loop without closing it. This causes ORA-01000.",
      "Running large batches in auto-commit mode, which commits every row and loses the speed-up.",
      "Treating `con.close()` on a pooled connection as harmful. It is required, because it returns the connection to the pool.",
      "Using 0-based parameter indexes.",
    ],
    qa: [
      [
        "How do you tell a retryable SQLException from a permanent one?",
        "Check the subclass. `SQLTransientException` (such as SQLTransactionRollbackException for deadlocks, and SQLTimeoutException) may succeed on retry, while `SQLNonTransientException` (syntax errors, constraint violations) will not. The SQLState class (40, 08, 23, 42) gives the same hint.",
      ],
      [
        "What is the ideal connection pool size?",
        "Smaller than most people think. The usual starting point is about `cores * 2` plus the number of effective disk spindles, for example around 10 for a typical OLTP database. Measure from there, because too many connections cause contention inside the database.",
      ],
      [
        "Does `rollback()` release savepoints?",
        "Yes. A full rollback or commit ends the transaction, and every savepoint created in it becomes invalid.",
      ],
    ],
    ex: [
      "Insert 100,000 rows as fast as possible with JDBC while keeping memory use flat. Describe the loop.",
      "Turn auto-commit off and prepare one INSERT statement. In the loop, set the parameters and `addBatch()`. Every 1,000 rows, call `executeBatch()` and `commit()`, which bounds both memory and redo per transaction. After the loop, execute and commit the remainder. Catch BatchUpdateException, roll back the failed chunk, and log `getUpdateCounts()`.",
    ],
  }),
];
