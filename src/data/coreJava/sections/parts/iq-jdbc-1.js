import { lesson } from "../../schema.js";

// JDBC programs compile with the JDK alone (java.sql is part of it) but need a running database,
// so these lessons use mode "compile" with output from a sample run against Oracle XE.
const note =
  "This program compiles with the JDK alone, but needs a running database (Oracle XE with the ojdbc driver on the classpath) to execute, so the output shown is from a sample run.";

export default [
  lesson("JDBC Q1-Q10: JDBC, Drivers, Connecting, Statement, PreparedStatement, CallableStatement and Cursors", {
    intro:
      "JDBC questions 1 to 10 cover the core API:\n\n- what JDBC is, and which driver types you have used\n- how to connect to a database\n- Statement, PreparedStatement and when to use CallableStatement\n- stored procedures\n- cursors\n- how the three statement types compare\n- what a ResultSet is\n\nThe complete program connects, creates a table, inserts with PreparedStatement, calls a stored procedure, and reads results. Every step carries a comment.",
    topics: [
      [
        "Q1. What is JDBC?",
        "JDBC (Java Database Connectivity) is the standard Java API (`java.sql` and `javax.sql`) for talking to relational databases. Your code is written against interfaces (Connection, Statement, PreparedStatement, CallableStatement, ResultSet, DatabaseMetaData), and a vendor-supplied **driver** implements them for a specific database, such as Oracle, MySQL or PostgreSQL. The application can therefore switch databases mostly by changing the driver and the URL. JDBC handles connecting, executing SQL, processing results, transactions, batching and metadata. Higher-level tools (JPA/Hibernate, Spring JdbcTemplate, jOOQ, MyBatis) are all built on top of it.",
      ],
      [
        "Q2. What are the JDBC driver types? Which have you used?",
        "- **Type 1, the JDBC-ODBC bridge**: it translates JDBC calls to ODBC. It was removed in Java 8.\n- **Type 2, native API (partly Java)**: it calls the database's native client library through JNI, for example Oracle OCI. It is fast, but needs native libraries on every machine.\n- **Type 3, network protocol (pure Java to middleware)**: it talks to a middleware server that translates to the database protocol.\n- **Type 4, thin (pure Java)**: it speaks the database's wire protocol directly. Examples are Oracle thin (`jdbc:oracle:thin:`), MySQL Connector/J, the PostgreSQL JDBC driver and Microsoft's mssql-jdbc.\n\nIn practice almost everyone uses **Type 4**: it is platform independent, needs nothing installed, and has the best support.",
      ],
      [
        "Q3. How do you connect to a database?",
        "1. Put the driver JAR on the classpath. Since JDBC 4.0 (Java 6), drivers register themselves through the ServiceLoader, so `Class.forName(\"oracle.jdbc.OracleDriver\")` is no longer needed.\n2. Call `DriverManager.getConnection(url, user, password)`, for example `jdbc:oracle:thin:@localhost:1521:XE`, or obtain a connection from a pooled `DataSource` in production.\n3. Use the Connection to create statements.\n4. Close everything (ResultSet, Statement, Connection) with **try-with-resources**.\n\nConnection properties can also be passed in a `Properties` object, for timeouts, SSL and the like.",
      ],
      [
        "Q4. What is a Statement?",
        "`java.sql.Statement` executes **static SQL** strings, created with `connection.createStatement()`. Its methods:\n\n- `executeQuery(sql)` for SELECT, returning a ResultSet\n- `executeUpdate(sql)` for INSERT, UPDATE, DELETE and DDL, returning the affected row count\n- `execute(sql)` for any statement, returning true if the result is a ResultSet\n- `addBatch` and `executeBatch`\n\nThe SQL is parsed and planned on every execution. Building SQL by concatenating user input into a Statement is open to **SQL injection**. Use it for one-off DDL or for fixed queries without parameters.",
      ],
      [
        "Q5. What is a PreparedStatement?",
        "A `PreparedStatement` (a subinterface of Statement) is a **precompiled SQL statement with `?` placeholders**, created with `connection.prepareStatement(\"INSERT INTO emp VALUES (?, ?)\")`. Values are bound with typed setters (`setInt(1, id)`, `setString(2, name)`, `setDate`, `setNull`), then `executeQuery()` or `executeUpdate()` runs it. Its advantages:\n\n- **No SQL injection**: parameters are sent as data, never parsed as SQL.\n- **Better performance**: the database can reuse the parsed plan, and drivers cache statements.\n- **Automatic type conversion**: dates, BLOBs and null are handled for you.\n- **Efficient batching**.\n\nIt is the default choice for any SQL that contains values.",
      ],
      [
        "Q6. What is a CallableStatement, and when do you use it?",
        "`CallableStatement` (it extends PreparedStatement) calls **stored procedures and functions** in the database, using the escape syntax `{call proc_name(?, ?)}` or `{? = call func_name(?)}`. IN parameters are set like a PreparedStatement. OUT parameters are registered with `registerOutParameter(index, Types.INTEGER)` and read after execution with `getInt(index)`. INOUT parameters do both. Use it when business logic lives in the database (PL/SQL), for multi-step operations that should run close to the data, or to get several result sets or out-values from one round trip.",
      ],
      [
        "Q7. What are stored procedures?",
        "Stored procedures are **named programs stored and executed inside the database**, written in its procedural language: PL/SQL for Oracle, T-SQL for SQL Server, PL/pgSQL for PostgreSQL. They accept IN, OUT and INOUT parameters, can run several SQL statements with control flow, and are compiled and cached by the database. The benefits are fewer network round trips, centralised logic shared by many applications, security (applications can be granted EXECUTE without table access) and performance. The drawbacks are vendor lock-in, harder testing and versioning, and logic split between the application and the database. A **function** is similar but returns a value, and can be used inside SQL.",
      ],
      [
        "Q8. What are cursors?",
        "A cursor is the database's **pointer to the result set of a query** that lets rows be processed one at a time. **Implicit cursors** are created automatically for every SQL statement, and **explicit cursors** are declared in PL/SQL. In JDBC, a `ResultSet` is the client-side view of a cursor: `next()` moves it forward, and scrollable result sets move it in any direction. Drivers fetch rows in batches (`setFetchSize`) rather than all at once. Every open ResultSet or Statement holds a database cursor, so failing to close them leads to **ORA-01000: maximum open cursors exceeded**. A stored procedure can return a cursor as an OUT parameter (Oracle `SYS_REFCURSOR`), which JDBC reads as a ResultSet.",
      ],
      [
        "Q9. What is the difference between Statement, PreparedStatement and CallableStatement?",
        "- **Purpose**: Statement runs static SQL. PreparedStatement runs parameterised SQL. CallableStatement calls stored procedures and functions.\n- **Compilation**: Statement SQL is parsed on each execution. PreparedStatement SQL is precompiled and its plan can be reused. A CallableStatement runs code that is already compiled in the database.\n- **Parameters**: Statement has none, PreparedStatement has IN parameters, and CallableStatement has IN, OUT and INOUT.\n- **SQL injection**: Statement is vulnerable when SQL is concatenated, while the other two are safe through binding.\n- **Inheritance**: `CallableStatement extends PreparedStatement extends Statement`.\n- **Use**: Statement for DDL and one-off queries, PreparedStatement for almost all DML and queries, CallableStatement for database-side logic.",
      ],
      [
        "Q10. What is a ResultSet?",
        "A `ResultSet` is a **table of data returned by a query**, with a cursor that initially sits **before the first row**. You call `next()` (it returns false after the last row) and read columns with typed getters, by index (1-based) or by name: `getInt(\"id\")`, `getString(2)`, `getDate`, `getObject(col, LocalDate.class)`. `wasNull()` tells you whether the last value read was SQL NULL. Its behaviour depends on its **type** (forward-only or scrollable), **concurrency** (read-only or updatable) and **holdability**, all set when the statement is created. A ResultSet is closed automatically when its Statement is closed or re-executed. Close it promptly to free the cursor.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    // Q3: connection details. With JDBC 4+ the driver on the classpath registers itself.
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";
    static final String USER = "hr", PASSWORD = "hr";

    public static void main(String[] args) {
        // try-with-resources closes the Connection (and everything created from it) automatically.
        try (Connection con = DriverManager.getConnection(URL, USER, PASSWORD)) {
            System.out.println("Q3 connected to " + con.getMetaData().getDatabaseProductName());
            System.out.println("Q2 driver: " + con.getMetaData().getDriverName() + " (Type 4 thin)");

            // Q4: Statement for static DDL.
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE iq_emp (id NUMBER PRIMARY KEY, name VARCHAR2(40), salary NUMBER)");
                st.executeUpdate("CREATE OR REPLACE PROCEDURE iq_raise(p_id IN NUMBER, p_pct IN NUMBER, p_new OUT NUMBER) AS "
                        + "BEGIN UPDATE iq_emp SET salary = salary * (1 + p_pct / 100) WHERE id = p_id "
                        + "RETURNING salary INTO p_new; END;");                 // Q7: a stored procedure
                System.out.println("Q4 Statement created table iq_emp and procedure iq_raise");
            }

            // Q5: PreparedStatement with ? placeholders (safe from SQL injection).
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_emp (id, name, salary) VALUES (?, ?, ?)")) {
                Object[][] rows = {{1, "Asha", 50000}, {2, "Ravi", 42000}, {3, "O'Brien", 61000}};
                for (Object[] r : rows) {
                    ps.setInt(1, (Integer) r[0]);
                    ps.setString(2, (String) r[1]);   // the quote in O'Brien needs no escaping
                    ps.setInt(3, (Integer) r[2]);
                    ps.executeUpdate();
                }
                System.out.println("Q5 PreparedStatement inserted " + rows.length + " rows");
            }

            // Q6 + Q7: CallableStatement with IN and OUT parameters.
            try (CallableStatement cs = con.prepareCall("{call iq_raise(?, ?, ?)}")) {
                cs.setInt(1, 2);                                   // IN: employee id
                cs.setInt(2, 10);                                  // IN: raise percent
                cs.registerOutParameter(3, Types.NUMERIC);         // OUT: new salary
                cs.execute();
                System.out.println("Q6 procedure returned new salary for id 2: " + cs.getBigDecimal(3));
            }

            // Q8 + Q10: the ResultSet is the client-side view of a cursor.
            try (PreparedStatement ps = con.prepareStatement("SELECT id, name, salary FROM iq_emp WHERE salary > ? ORDER BY id")) {
                ps.setInt(1, 40000);
                ps.setFetchSize(50);                               // rows fetched per round trip
                try (ResultSet rs = ps.executeQuery()) {           // cursor starts before row 1
                    while (rs.next()) {
                        System.out.println("Q10 row " + rs.getInt("id") + " " + rs.getString("name") + " " + rs.getInt(3));
                    }
                }
            }

            // Q9: the same lookup three ways - only the Statement version is injectable.
            String userInput = "1 OR 1=1";
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM iq_emp WHERE id = " + userInput)) {
                rs.next();
                System.out.println("Q9 concatenated Statement matched " + rs.getInt(1) + " rows (injection!)");
            }
            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM iq_emp WHERE id = ?")) {
                ps.setString(1, userInput);
                try (ResultSet rs = ps.executeQuery()) { rs.next(); System.out.println("Q9 PreparedStatement matched " + rs.getInt(1)); }
            } catch (SQLException e) {
                System.out.println("Q9 PreparedStatement rejected the input as a value: " + e.getMessage().trim());
            }

            try (Statement st = con.createStatement()) {
                st.executeUpdate("DROP TABLE iq_emp");
                st.executeUpdate("DROP PROCEDURE iq_raise");
            }
        } catch (SQLException e) {
            System.out.println("Database error " + e.getSQLState() + ": " + e.getMessage());
        }
    }
}`,
    mode: "compile",
    note,
    sample: String.raw`Q3 connected to Oracle
Q2 driver: Oracle JDBC driver (Type 4 thin)
Q4 Statement created table iq_emp and procedure iq_raise
Q5 PreparedStatement inserted 3 rows
Q6 procedure returned new salary for id 2: 46200
Q10 row 1 Asha 50000
Q10 row 2 Ravi 46200
Q10 row 3 O'Brien 61000
Q9 concatenated Statement matched 3 rows (injection!)
Q9 PreparedStatement rejected the input as a value: ORA-01722: invalid number`,
    walk:
      "The program opens one Connection in try-with-resources, so it is always closed. It prints the product and driver names from DatabaseMetaData (Q2, Q3). A Statement runs the static DDL that creates the table and the PL/SQL procedure (Q4, Q7). A PreparedStatement inserts three rows by binding parameters. The apostrophe in O'Brien needs no escaping, because the values never become part of the SQL text (Q5).\n\nThe CallableStatement sets two IN parameters, registers the OUT parameter, executes the procedure and reads the raised salary, 46200 (Q6). The query runs through a PreparedStatement and walks the ResultSet cursor with `next()`, reading columns by name and by index (Q8, Q10). Q9 shows why PreparedStatement matters: concatenating `1 OR 1=1` into a Statement matches every row, while binding the same input as a value makes the database treat it as an invalid number.",
    anim: [
      "From Java call to stored procedure",
      [
        ["app", "Java code", "prepareCall"],
        ["cs", "CallableStmt", "{call iq_raise}"],
        ["drv", "JDBC driver", "Type 4 thin"],
        ["db", "Oracle DB", "runs PL/SQL"],
        ["out", "OUT param", "new salary"],
      ],
      [
        ["app", "cs", "set IN params", "setInt(1, 2) and setInt(2, 10) bind the employee id and the raise percent."],
        ["cs", "cs", "registerOut", "registerOutParameter(3, NUMERIC) declares where the result will come back."],
        ["cs", "drv", "execute()", "The driver encodes the call in Oracle's wire protocol: one network round trip."],
        ["drv", "db", "run procedure", "The database runs the compiled procedure: UPDATE ... RETURNING salary."],
        ["db", "out", "getBigDecimal(3)", "The OUT value travels back and is read with a typed getter: 46200."],
      ],
    ],
    mistakes: [
      "Concatenating user input into SQL strings. Always bind with PreparedStatement.",
      "Not closing ResultSets and Statements, which leaks database cursors (ORA-01000).",
      "Forgetting that JDBC column indexes start at 1, not 0.",
      "Calling `Class.forName` for every connection, which is unnecessary since JDBC 4.0.",
    ],
    qa: [
      [
        "What does `execute()` return?",
        "`true` if the first result is a ResultSet (read it with `getResultSet()`), or `false` if it is an update count (`getUpdateCount()`). Use `getMoreResults()` for statements that produce several results.",
      ],
      [
        "Is a PreparedStatement always faster?",
        "Usually for repeated execution, because of the plan reuse and the driver's statement cache. For a single dynamic query, the difference is negligible, but its safety is still the deciding reason to use it.",
      ],
      [
        "Can a ResultSet be used after its Connection is closed?",
        "No. Closing the Connection closes its Statements and ResultSets. To use data after closing, copy it into Java objects or use a disconnected CachedRowSet.",
      ],
    ],
    ex: [
      "Write the JDBC code to call an Oracle function `get_bonus(p_id IN NUMBER) RETURN NUMBER` and print the result for id 3.",
      "`try (CallableStatement cs = con.prepareCall(\"{? = call get_bonus(?)}\")) { cs.registerOutParameter(1, Types.NUMERIC); cs.setInt(2, 3); cs.execute(); System.out.println(cs.getBigDecimal(1)); }`. The return value is parameter 1, and the function's own argument is parameter 2.",
    ],
  }),

  lesson("JDBC Q11-Q20: ResultSet Types, Concurrency, Holdability, Navigation, LOBs, Transactions and DriverManager", {
    intro:
      "Questions 11 to 20 go deeper into result sets and data handling:\n\n- ResultSet types, concurrency modes and holdability\n- the navigation methods\n- scroll-insensitive vs scroll-sensitive\n- storing and retrieving images and files\n- CLOB vs BLOB\n- transactions\n- DriverManager\n\nThe program uses a scrollable, updatable ResultSet, stores a generated image as a BLOB and a text file as a CLOB, and commits and rolls back a transaction.",
    topics: [
      [
        "Q11. What are the ResultSet types?",
        "There are three, chosen in `createStatement(type, concurrency)` or `prepareStatement(sql, type, concurrency)`:\n\n- **TYPE_FORWARD_ONLY** (the default): the cursor moves only forward with `next()`. It is the fastest and uses the least memory.\n- **TYPE_SCROLL_INSENSITIVE**: the cursor can move in any direction, and the result is a snapshot that does **not** reflect changes other transactions make after the query.\n- **TYPE_SCROLL_SENSITIVE**: scrollable, and reflects changes to the underlying rows, typically re-fetched when the cursor revisits them.\n\nDrivers may downgrade an unsupported type; check `rs.getType()`, or `DatabaseMetaData.supportsResultSetType`.",
      ],
      [
        "Q12. What is ResultSet concurrency?",
        "Concurrency decides whether you can modify data **through** the ResultSet. **CONCUR_READ_ONLY** is the default: you can only read. **CONCUR_UPDATABLE** lets you change the current row with `updateString(\"name\", ...)` and `updateRow()`, delete it with `deleteRow()`, or insert with `moveToInsertRow()`, `updateXxx(...)`, `insertRow()` and `moveToCurrentRow()`. Updatable result sets usually require a simple single-table query that selects the primary key, and `SELECT *` often prevents updatability in Oracle. `rs.getConcurrency()` reports what you actually got.",
      ],
      [
        "Q13. What is ResultSet holdability?",
        "Holdability decides what happens to an open ResultSet when the transaction **commits**:\n\n- **HOLD_CURSORS_OVER_COMMIT**: the cursor stays open after commit, which is useful for reading a large result while committing batches of work.\n- **CLOSE_CURSORS_AT_COMMIT**: the cursor closes at commit, which frees resources sooner.\n\nYou set it with the three-argument `createStatement(type, concurrency, holdability)` or `con.setHoldability(...)`. The default depends on the driver (`DatabaseMetaData.getResultSetHoldability()`). Oracle supports only HOLD_CURSORS_OVER_COMMIT.",
      ],
      [
        "Q14. What are the ResultSet navigation methods?",
        "- `next()` and `previous()`.\n- `first()` and `last()`.\n- `beforeFirst()` and `afterLast()`.\n- `absolute(n)`: row n from the start, or from the end when n is negative (`absolute(-1)` is the last row).\n- `relative(n)`: move n rows from the current position.\n- `getRow()` returns the current row number.\n- `isFirst()`, `isLast()`, `isBeforeFirst()` and `isAfterLast()` report the position.\n\nOnly `next()` works on TYPE_FORWARD_ONLY; the others require a scrollable type and otherwise throw SQLException. A common trick to count rows is `last()` followed by `getRow()`, but `SELECT COUNT(*)` is better.",
      ],
      [
        "Q15. What is the difference between scroll-insensitive and scroll-sensitive result sets?",
        "Both can move in any direction. A **scroll-insensitive** result set is a **static snapshot**: changes committed by others after the query (updates, inserts, deletes) are invisible, so the data is stable and repeatable. A **scroll-sensitive** result set reflects **updates** made to the underlying rows while it is open, usually by re-fetching a row when you move to it or call `refreshRow()`. Inserts are usually not visible, and deletes may show as holes. Sensitivity costs more round trips. In Oracle, sensitive result sets see updates only after `refreshRow()`, or within the fetch window.",
      ],
      [
        "Q16. How do you store and retrieve an image?",
        "Use a **BLOB** column (Binary Large Object): `BLOB` in Oracle, `LONGBLOB` in MySQL, `BYTEA` in PostgreSQL. To store it, call `ps.setBinaryStream(index, inputStream, length)`, or `setBytes`, or `setBlob(index, inputStream)` with a FileInputStream of the image. To retrieve it, call `rs.getBinaryStream(\"img\")` and copy the stream to a FileOutputStream, or use `rs.getBlob(\"img\").getBytes(1, (int) blob.length())`. Streaming avoids loading huge images into memory. Many systems store images in object storage and keep only the path in the database.",
      ],
      [
        "Q17. How do you store and retrieve a file (text)?",
        "Use a **CLOB** column (Character Large Object): `CLOB` in Oracle, `LONGTEXT` in MySQL, `TEXT` in PostgreSQL. To store it, call `ps.setCharacterStream(index, reader, length)` with a FileReader (or a `Files.newBufferedReader` with an explicit charset), or `setClob(index, reader)`, or `setString` for small text. To retrieve it, call `rs.getCharacterStream(\"doc\")` and copy it to a Writer, or `rs.getClob(\"doc\").getSubString(1, (int) clob.length())`. Binary files of any type (PDF, ZIP) go into a BLOB instead.",
      ],
      [
        "Q18. What is the difference between CLOB and BLOB?",
        "- **Content**: a CLOB holds **character** data (large text, XML, JSON), while a BLOB holds **binary** data (images, audio, PDFs, ZIPs).\n- **Character set**: CLOB text is stored in the database character set and converted on transfer. BLOB bytes are stored exactly, with no conversion.\n- **JDBC access**: `setCharacterStream`, `getCharacterStream` and `getClob` for a CLOB; `setBinaryStream`, `getBinaryStream` and `getBlob` for a BLOB.\n- **Java types**: `java.sql.Clob` (and NClob for national character sets) vs `java.sql.Blob`.\n\nBoth can hold gigabytes (up to 4 GB times the block size in Oracle) and are read lazily through LOB locators. Free them with `free()` when you are done.",
      ],
      [
        "Q19. How do transactions work in JDBC?",
        "By default a Connection is in **auto-commit mode**: each statement commits immediately. For a transaction:\n\n1. Call `con.setAutoCommit(false)`.\n2. Run several statements.\n3. On success call `con.commit()`. On any exception call `con.rollback()` in the catch block, so either all changes persist or none do.\n4. Restore auto-commit if the connection is pooled.\n\nYou can set the **isolation level** with `con.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED)` (or READ_UNCOMMITTED, REPEATABLE_READ, SERIALIZABLE), and use **savepoints** for partial rollbacks (Q40). This gives the ACID properties: atomicity, consistency, isolation and durability.",
      ],
      [
        "Q20. What is DriverManager?",
        "`java.sql.DriverManager` is the basic service for **managing JDBC drivers and creating connections**. It keeps a registry of loaded drivers: since JDBC 4.0 they are discovered automatically from `META-INF/services/java.sql.Driver` in the driver JARs, or registered with `registerDriver`. `getConnection(url, user, pwd)` asks each registered driver whether it accepts the URL and connects with the first that does. Its other methods are `getDriver(url)`, `getDrivers()` (Java 9 adds `drivers()` as a stream), `setLoginTimeout`, `setLogWriter` and `deregisterDriver`. In servers, a pooled **DataSource** is preferred over DriverManager.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    public static void main(String[] args) throws IOException {
        // Q20: list the drivers DriverManager discovered on the classpath.
        DriverManager.drivers().forEach(d -> System.out.println("Q20 registered driver: " + d.getClass().getName()));

        try (Connection con = DriverManager.getConnection(URL, "hr", "hr")) {
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE iq_city (id NUMBER PRIMARY KEY, name VARCHAR2(30), pop NUMBER)");
                st.executeUpdate("CREATE TABLE iq_files (id NUMBER PRIMARY KEY, img BLOB, doc CLOB)");
                st.executeUpdate("INSERT INTO iq_city VALUES (1, 'Pune', 7)");
                st.executeUpdate("INSERT INTO iq_city VALUES (2, 'Agra', 2)");
                st.executeUpdate("INSERT INTO iq_city VALUES (3, 'Goa', 1)");
            }

            // Q11 + Q12 + Q14: scroll-insensitive, updatable ResultSet.
            try (Statement st = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
                 ResultSet rs = st.executeQuery("SELECT id, name, pop FROM iq_city ORDER BY id")) {
                rs.last();
                System.out.println("Q14 last() -> row " + rs.getRow() + " " + rs.getString("name"));
                rs.absolute(1);
                System.out.println("Q14 absolute(1) -> " + rs.getString("name") + ", relative(1) -> " + (rs.relative(1) ? rs.getString("name") : "-"));
                rs.updateInt("pop", 3);                         // Q12: change the current row
                rs.updateRow();
                rs.moveToInsertRow();                           // Q12: insert through the ResultSet
                rs.updateInt("id", 4); rs.updateString("name", "Surat"); rs.updateInt("pop", 6);
                rs.insertRow();
                rs.moveToCurrentRow();
                System.out.println("Q11 type scroll-insensitive: " + (rs.getType() == ResultSet.TYPE_SCROLL_INSENSITIVE)
                        + ", Q12 updatable: " + (rs.getConcurrency() == ResultSet.CONCUR_UPDATABLE));
            }

            // Q13: holdability.
            System.out.println("Q13 holdability: " + (con.getHoldability() == ResultSet.HOLD_CURSORS_OVER_COMMIT ? "HOLD_CURSORS_OVER_COMMIT" : "CLOSE_CURSORS_AT_COMMIT"));

            // Q16 + Q17 + Q18: store a binary image (BLOB) and a text file (CLOB).
            Path dir = Files.createTempDirectory("lob");
            Path image = dir.resolve("logo.png");
            Files.write(image, new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 0, 0, 0, 13}); // PNG header bytes
            Path text = Files.writeString(dir.resolve("notes.txt"), "line 1\nline 2 with ünicode\n");
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO iq_files VALUES (1, ?, ?)");
                 InputStream img = Files.newInputStream(image);
                 Reader doc = Files.newBufferedReader(text, StandardCharsets.UTF_8)) {
                ps.setBinaryStream(1, img, Files.size(image));  // BLOB: raw bytes
                ps.setCharacterStream(2, doc);                  // CLOB: characters
                ps.executeUpdate();
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT img, doc FROM iq_files WHERE id = 1")) {
                rs.next();
                Blob blob = rs.getBlob("img");
                Clob clob = rs.getClob("doc");
                byte[] bytes = blob.getBytes(1, (int) blob.length());
                String content = clob.getSubString(1, (int) clob.length());
                System.out.println("Q16 BLOB read back " + bytes.length + " bytes, starts with PNG signature: " + (bytes[1] == 'P' && bytes[2] == 'N'));
                System.out.println("Q17 CLOB read back " + content.lines().count() + " lines, second line: " + content.lines().skip(1).findFirst().orElse(""));
                blob.free(); clob.free();
            }

            // Q19: a transfer that commits, then one that rolls back.
            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement("UPDATE iq_city SET pop = pop + ? WHERE id = ?")) {
                ps.setInt(1, -1); ps.setInt(2, 1); ps.executeUpdate();
                ps.setInt(1, 1); ps.setInt(2, 2); ps.executeUpdate();
                con.commit();
                System.out.println("Q19 transaction 1 committed");
                ps.setInt(1, -100); ps.setInt(2, 1); ps.executeUpdate();
                throw new SQLException("simulated failure mid-transaction");
            } catch (SQLException e) {
                con.rollback();
                System.out.println("Q19 transaction 2 rolled back after: " + e.getMessage());
            } finally {
                con.setAutoCommit(true);
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT pop FROM iq_city WHERE id = 1")) {
                rs.next();
                System.out.println("Q19 Pune population after commit + rollback: " + rs.getInt(1));
            }

            try (Statement st = con.createStatement()) { st.executeUpdate("DROP TABLE iq_city"); st.executeUpdate("DROP TABLE iq_files"); }
        } catch (SQLException e) {
            System.out.println("Database error " + e.getSQLState() + ": " + e.getMessage());
        }
    }
}`,
    mode: "compile",
    note,
    sample: String.raw`Q20 registered driver: oracle.jdbc.OracleDriver
Q14 last() -> row 3 Goa
Q14 absolute(1) -> Pune, relative(1) -> Agra
Q11 type scroll-insensitive: true, Q12 updatable: true
Q13 holdability: HOLD_CURSORS_OVER_COMMIT
Q16 BLOB read back 12 bytes, starts with PNG signature: true
Q17 CLOB read back 2 lines, second line: line 2 with ünicode
Q19 transaction 1 committed
Q19 transaction 2 rolled back after: simulated failure mid-transaction
Q19 Pune population after commit + rollback: 6`,
    walk:
      "`DriverManager.drivers()` lists the drivers it auto-discovered: the Oracle JAR registers `oracle.jdbc.OracleDriver` (Q20). The scrollable, updatable ResultSet jumps to the last row (row 3, Goa), back to row 1, and one row forward. It then updates Agra's population with `updateRow()` and inserts Surat through the insert row (Q11, Q12, Q14). The connection's holdability is reported (Q13).\n\nA small PNG header is stored as a BLOB through `setBinaryStream`, and a UTF-8 text file as a CLOB through `setCharacterStream`. Reading them back with `getBlob` and `getClob` returns the same 12 bytes and the same two lines, including the non-ASCII character (Q16, Q17, Q18). In Q19, the first transfer commits (Pune 7 → 6). The second subtracts 100 and then fails, so `rollback()` undoes it, leaving Pune at 6.",
    anim: [
      "Commit and rollback in a JDBC transaction",
      [
        ["app", "Java code", "setAutoCommit(false)"],
        ["con", "Connection", "transaction"],
        ["db", "database", "uncommitted rows"],
        ["log", "redo/undo", "commit or undo"],
      ],
      [
        ["app", "con", "begin", "Turning auto-commit off makes the next statements part of one transaction."],
        ["con", "db", "UPDATE x2", "Both updates change rows that only this transaction can see so far."],
        ["app", "log", "commit()", "commit() makes both changes durable and visible to everyone at once."],
        ["con", "db", "UPDATE -100", "The next transaction subtracts 100, then the code hits an exception."],
        ["app", "log", "rollback()", "rollback() undoes the uncommitted change; Pune stays at 6."],
      ],
    ],
    mistakes: [
      "Calling `previous()` or `absolute()` on a TYPE_FORWARD_ONLY ResultSet, which throws SQLException.",
      "Storing binary files in a CLOB, where character conversion corrupts them.",
      "Forgetting `rollback()` in the catch block, which leaves locks and partial changes until the connection closes.",
      "Returning a pooled connection with auto-commit still off.",
    ],
    qa: [
      [
        "What is the default transaction isolation level?",
        "It depends on the database: READ COMMITTED for Oracle, PostgreSQL and SQL Server, REPEATABLE READ for MySQL InnoDB. Read it with `con.getTransactionIsolation()`.",
      ],
      [
        "Why might an updatable ResultSet come back read-only?",
        "The query was not updatable (a join, an aggregate, `SELECT *` in Oracle, or no primary key), so the driver downgraded it. Check `getConcurrency()` and the SQLWarnings on the connection.",
      ],
      [
        "Should large files be stored in the database?",
        "It works, and keeps the files transactional, but it increases database size and backup time. Many designs store files in a filesystem or object store, and keep only metadata and the path in a table.",
      ],
    ],
    ex: [
      "Write the code that streams a BLOB column directly to a file, without loading it fully into memory.",
      "`try (InputStream in = rs.getBinaryStream(\"img\"); OutputStream out = Files.newOutputStream(target)) { in.transferTo(out); }`. `getBinaryStream` reads the LOB in chunks as you consume it.",
    ],
  }),
];
