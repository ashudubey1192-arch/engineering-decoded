import { lesson, section } from "../schema.js";

// JDBC programs need a running database and its driver JAR, so they are compiled with the
// JDK (java.sql is part of it) and show the output of a sample run.
export default section("jdbc", "JDBC: Java Database Connectivity", [
  lesson("JDBC Architecture and Setting Up a Database", {
    intro:
      "JDBC (Java Database Connectivity) is the standard Java API for talking to relational databases. Your code uses interfaces in `java.sql` (Connection, Statement, ResultSet), and a vendor driver implements them for Oracle, MySQL, PostgreSQL or SQL Server. This lesson explains the JDBC architecture, how to install a database and its client tools (Oracle 11g with SQL Developer, or MySQL and PostgreSQL), and how to add the driver to a project.",
    topics: [
      [
        "JDBC architecture",
        "Application code calls the JDBC API (`java.sql` and `javax.sql`). `DriverManager` (or a `DataSource`) chooses a driver based on the JDBC URL. The driver translates calls into the database's wire protocol. Because code depends only on interfaces, switching databases mostly means changing the URL, the driver JAR and vendor-specific SQL.",
      ],
      [
        "Installing Oracle 11g and SQL Developer",
        "Download Oracle Database Express Edition (XE) for your platform (choose the 64-bit installer on a 64-bit OS), run the installer and set the SYS/SYSTEM password; it listens on port 1521 with service XE. Install Oracle SQL Developer (a free GUI) to create users and tables and run SQL; create a new connection with host localhost, port 1521, SID or service XE. Newer Oracle XE versions (21c) and Docker images work the same way.",
      ],
      [
        "Other databases",
        "MySQL (port 3306, MySQL Workbench), PostgreSQL (port 5432, pgAdmin or psql) and SQL Server (port 1433, SQL Server Management Studio) are all common. Running them in Docker (`docker run -p 5432:5432 postgres`) is the quickest way to get a local database.",
      ],
      [
        "Adding the JDBC driver",
        "Download the driver JAR (ojdbc for Oracle, mysql-connector-j, postgresql, mssql-jdbc) or add it as a Maven/Gradle dependency, and put it on the classpath. JDBC 4 drivers register themselves automatically through the ServiceLoader mechanism, so `Class.forName(\"oracle.jdbc.OracleDriver\")` is no longer required.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.Collections;

public class Main {
    // Change these for your database; the driver JAR must be on the classpath.
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";
    static final String USER = "shop", PASSWORD = "shop_pw";

    public static void main(String[] args) {
        System.out.println("registered JDBC drivers:");
        for (Driver d : Collections.list(DriverManager.getDrivers())) {
            System.out.println("  " + d.getClass().getName() + " " + d.getMajorVersion() + "." + d.getMinorVersion());
        }
        try (Connection con = DriverManager.getConnection(URL, USER, PASSWORD)) {
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("connected to " + meta.getDatabaseProductName() + " " + meta.getDatabaseMajorVersion());
            System.out.println("driver " + meta.getDriverName() + " " + meta.getDriverVersion());
            System.out.println("JDBC version " + meta.getJDBCMajorVersion() + "." + meta.getJDBCMinorVersion());
        } catch (SQLException e) {
            System.out.println("could not connect: " + e.getMessage() + " (SQLState " + e.getSQLState() + ")");
        }
    }
}`,
    mode: "compile",
    sample: String.raw`registered JDBC drivers:
  oracle.jdbc.OracleDriver 11.2
connected to Oracle 11
driver Oracle JDBC driver 11.2.0.4.0
JDBC version 4.0`,
    walk:
      "`DriverManager.getDrivers()` lists every driver registered automatically from the classpath; with the Oracle JAR present it shows `oracle.jdbc.OracleDriver`. `getConnection` picks the driver whose URL prefix (`jdbc:oracle:thin:`) matches and opens a connection to the XE instance on port 1521.\n\n`DatabaseMetaData` then reports the database product and version, the driver and the JDBC version it implements. Without a running database the same program prints the connection error and its SQLState instead; the output shown is from a sample run against Oracle XE 11g.",
    anim: [
      "JDBC layers",
      [
        ["app", "your code", "java.sql API"],
        ["dm", "DriverManager", "picks driver"],
        ["driver", "vendor driver", "ojdbc, pgjdbc"],
        ["net", "wire protocol", "TCP"],
        ["db", "database", "Oracle, MySQL"],
      ],
      [
        ["app", "dm", "getConnection", "Code asks DriverManager for a connection using a JDBC URL."],
        ["dm", "driver", "match URL", "The driver that understands the URL prefix is chosen."],
        ["driver", "net", "translate", "The driver translates JDBC calls into the database's network protocol."],
        ["net", "db", "SQL", "The database executes the SQL and the results flow back the same way."],
      ],
    ],
    mistakes: [
      "Forgetting to put the driver JAR on the runtime classpath (\"No suitable driver found\").",
      "Installing a 32-bit database or client on a 64-bit system without matching tools.",
      "Hard-coding credentials in source code; read them from configuration or environment variables.",
    ],
    qa: [
      ["What is JDBC?", "The standard Java API (java.sql, javax.sql) for connecting to relational databases, executing SQL and processing results, implemented by vendor drivers."],
      ["Is Class.forName required to load a JDBC driver?", "Not since JDBC 4.0: drivers on the classpath register themselves automatically."],
      ["What are the main JDBC interfaces?", "Driver, Connection, Statement, PreparedStatement, CallableStatement, ResultSet, ResultSetMetaData, DatabaseMetaData and DataSource."],
    ],
    ex: [
      "What JDBC URL and port would you use for a local PostgreSQL database named `shop`?",
      "`jdbc:postgresql://localhost:5432/shop` with the postgresql driver JAR on the classpath.",
    ],
  }),

  lesson("JDBC Driver Types", {
    intro:
      "JDBC drivers are classified into four types according to how they reach the database. Almost every modern driver is Type 4, but the classification is a classic interview question and explains historical designs. This lesson describes all four types with their pros, cons and examples.",
    topics: [
      [
        "Type 1: JDBC-ODBC bridge",
        "Translated JDBC calls into ODBC calls, which then used the ODBC driver of the database. Needed ODBC configured on every client machine, was slow, and platform dependent. Removed from the JDK in Java 8.",
      ],
      [
        "Type 2: Native-API driver",
        "Partly Java, partly native code: it calls the database's client library (for example Oracle Call Interface) through JNI. Faster than Type 1, but each client machine needs the vendor's native libraries installed. Oracle's OCI driver is an example.",
      ],
      [
        "Type 3: Network protocol (middleware) driver",
        "Pure Java on the client, talking to a middleware server which then talks to the database. Allows one client driver for many databases and centralised connection management, but adds a network hop and a server to maintain.",
      ],
      [
        "Type 4: Thin (pure Java) driver",
        "Pure Java, speaking the database's native network protocol directly over a socket. No client installation besides the JAR, portable and fast. Examples: Oracle thin driver (`jdbc:oracle:thin:`), MySQL Connector/J, PostgreSQL JDBC, Microsoft mssql-jdbc.",
      ],
      [
        "Which one to use",
        "Use a Type 4 driver unless you need a vendor feature available only through native libraries. Type 1 no longer exists in the JDK and Type 3 is rare.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<String, String> urls = new LinkedHashMap<>();
        urls.put("Type 4 Oracle thin", "jdbc:oracle:thin:@localhost:1521:XE");
        urls.put("Type 2 Oracle OCI", "jdbc:oracle:oci:@XE");
        urls.put("Type 4 MySQL", "jdbc:mysql://localhost:3306/shop");
        urls.put("Type 4 PostgreSQL", "jdbc:postgresql://localhost:5432/shop");
        urls.put("Type 4 SQL Server", "jdbc:sqlserver://localhost:1433;databaseName=shop;encrypt=false");
        urls.put("Type 1 ODBC bridge", "jdbc:odbc:shopDSN");

        for (Map.Entry<String, String> e : urls.entrySet()) {
            try {
                Driver d = DriverManager.getDriver(e.getValue());
                System.out.printf("%-20s handled by %s%n", e.getKey(), d.getClass().getName());
            } catch (SQLException ex) {
                System.out.printf("%-20s no driver on the classpath (%s)%n", e.getKey(), ex.getSQLState());
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`Type 4 Oracle thin   handled by oracle.jdbc.OracleDriver
Type 2 Oracle OCI    handled by oracle.jdbc.OracleDriver
Type 4 MySQL         handled by com.mysql.cj.jdbc.Driver
Type 4 PostgreSQL    handled by org.postgresql.Driver
Type 4 SQL Server    handled by com.microsoft.sqlserver.jdbc.SQLServerDriver
Type 1 ODBC bridge   no driver on the classpath (08001)`,
    walk:
      "`DriverManager.getDriver(url)` asks each registered driver whether it accepts a URL. In the sample run, the Oracle, MySQL, PostgreSQL and SQL Server JARs are on the classpath, so their Type 4 drivers claim the matching URLs; the Oracle JAR also accepts the OCI (Type 2) URL, which would additionally need the native Oracle client libraries to connect.\n\nThe ODBC URL finds no driver at all, because the Type 1 JDBC-ODBC bridge was removed in Java 8, so the lookup fails with SQLState 08001.",
    anim: [
      "Four routes to the database",
      [
        ["app", "Java app", "JDBC calls"],
        ["t1", "Type 1", "via ODBC"],
        ["t2", "Type 2", "via native lib"],
        ["t3", "Type 3", "via middleware"],
        ["t4", "Type 4", "direct protocol"],
        ["db", "database", "server"],
      ],
      [
        ["app", "t1", "bridge", "Type 1 converted JDBC to ODBC calls; removed in Java 8."],
        ["app", "t2", "JNI", "Type 2 calls the vendor's native client library through JNI."],
        ["app", "t3", "network", "Type 3 talks to a middleware server that talks to the database."],
        ["app", "t4", "pure Java", "Type 4 speaks the database protocol directly over a socket."],
        ["t4", "db", "socket", "That direct, portable route is why almost all modern drivers are Type 4."],
      ],
    ],
    mistakes: [
      "Trying to use the JDBC-ODBC bridge on Java 8 or later.",
      "Choosing a Type 2 driver without installing the native client on every machine.",
    ],
    qa: [
      ["What are the four types of JDBC drivers?", "Type 1 JDBC-ODBC bridge, Type 2 native-API, Type 3 network protocol (middleware) and Type 4 thin pure-Java drivers."],
      ["Which JDBC driver type is most commonly used?", "Type 4, because it is pure Java, needs no client installation and is fast."],
      ["Is the Oracle thin driver Type 2 or Type 4?", "Type 4; the OCI driver is Type 2."],
    ],
    ex: [
      "A company wants one JAR to reach Oracle, DB2 and MySQL with centrally managed connections on a separate server. Which driver type matches that design?",
      "Type 3: a pure Java client driver talks to a middleware server that manages connections to all the databases.",
    ],
  }),

  lesson("DriverManager and Connection: Your First JDBC Program", {
    intro:
      "Every JDBC program follows the same steps: get a connection, create a statement, execute SQL, process the results and close everything. This lesson writes a first complete JDBC program, explains `DriverManager` and the `Connection` interface, and shows the connection URLs for Oracle, MySQL, Microsoft SQL Server and PostgreSQL.",
    topics: [
      [
        "DriverManager",
        "`DriverManager.getConnection(url, user, password)` (or with a `Properties` object) returns a new physical connection. It loops over registered drivers and uses the first that accepts the URL. `setLoginTimeout(seconds)` limits how long it waits. In applications, a pooled `DataSource` is usually used instead.",
      ],
      [
        "Connection",
        "Represents a session with the database. It creates statements (`createStatement`, `prepareStatement`, `prepareCall`), controls transactions (`setAutoCommit`, `commit`, `rollback`, `setSavepoint`), exposes `getMetaData()`, and must be closed to release the database session. `isValid(timeout)` checks whether it is still alive.",
      ],
      [
        "The five steps",
        "1. Get a Connection. 2. Create a Statement or PreparedStatement. 3. Execute a query (`executeQuery` returns a ResultSet) or an update (`executeUpdate` returns a row count). 4. Iterate the ResultSet with `next()` and read columns with `getString`, `getInt` and so on. 5. Close the ResultSet, Statement and Connection, ideally all in one try-with-resources.",
      ],
      [
        "Connection URLs",
        "Oracle: `jdbc:oracle:thin:@host:1521:SID` or `jdbc:oracle:thin:@//host:1521/service`. MySQL: `jdbc:mysql://host:3306/db`. SQL Server: `jdbc:sqlserver://host:1433;databaseName=db;encrypt=true;trustServerCertificate=true`. PostgreSQL: `jdbc:postgresql://host:5432/db`.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String ORACLE = "jdbc:oracle:thin:@localhost:1521:XE";
    static final String MYSQL = "jdbc:mysql://localhost:3306/shop";
    static final String SQLSERVER = "jdbc:sqlserver://localhost:1433;databaseName=shop;encrypt=true;trustServerCertificate=true";
    static final String POSTGRES = "jdbc:postgresql://localhost:5432/shop";

    public static void main(String[] args) {
        String url = args.length > 0 ? args[0] : ORACLE;          // pick a database
        DriverManager.setLoginTimeout(5);
        try (Connection con = DriverManager.getConnection(url, "shop", "shop_pw");      // 1. connect
             Statement st = con.createStatement();                                        // 2. statement
             ResultSet rs = st.executeQuery("SELECT id, name, price FROM product ORDER BY id")) {   // 3. execute

            System.out.println("connected: " + con.getMetaData().getDatabaseProductName() + ", valid: " + con.isValid(2));
            while (rs.next()) {                                                            // 4. process
                System.out.printf("  %d  %-10s %8.2f%n", rs.getInt("id"), rs.getString("name"), rs.getBigDecimal("price"));
            }
        } catch (SQLException e) {                                                         // 5. closed automatically
            System.out.println("SQL error " + e.getErrorCode() + ": " + e.getMessage());
        }
        System.out.println("other URLs: " + MYSQL + " | " + SQLSERVER + " | " + POSTGRES);
    }
}`,
    mode: "compile",
    sample: String.raw`connected: Oracle, valid: true
  1  Pen            10.50
  2  Notebook       45.00
  3  Ink bottle     99.00
other URLs: jdbc:mysql://localhost:3306/shop | jdbc:sqlserver://localhost:1433;databaseName=shop;encrypt=true;trustServerCertificate=true | jdbc:postgresql://localhost:5432/shop`,
    walk:
      "The program follows the five steps. `DriverManager.getConnection` opens a session to Oracle XE (pass another URL as the first argument to use MySQL, SQL Server or PostgreSQL; only the URL and driver JAR change). `createStatement` and `executeQuery` run a SELECT, and the `while (rs.next())` loop reads each row's columns by name.\n\nAll three resources are declared in one try-with-resources header, so the ResultSet, Statement and Connection close automatically in reverse order, even if an exception occurs. The sample output shows the product table in a test schema.",
    anim: [
      "The five JDBC steps",
      [
        ["con", "Connection", "1. connect"],
        ["st", "Statement", "2. create"],
        ["exec", "executeQuery", "3. execute"],
        ["rs", "ResultSet", "4. next() loop"],
        ["close", "close()", "5. release"],
      ],
      [
        ["con", "st", "create", "The connection creates a statement object for sending SQL."],
        ["st", "exec", "send", "executeQuery sends the SELECT to the database."],
        ["exec", "rs", "rows", "The result comes back as a ResultSet cursor positioned before the first row."],
        ["rs", "close", "finish", "After reading the rows, everything is closed, releasing the database session."],
      ],
    ],
    mistakes: [
      "Not closing connections, which exhausts the database's session limit.",
      "Reading columns before calling `rs.next()` (\"Exhausted Resultset\" or invalid cursor state).",
      "Concatenating user input into SQL in a Statement (SQL injection); use PreparedStatement.",
    ],
    qa: [
      ["What are the steps to connect to a database in JDBC?", "Get a Connection, create a Statement/PreparedStatement, execute SQL, process the ResultSet, close the resources."],
      ["What is DriverManager?", "A class that manages registered JDBC drivers and creates connections from a JDBC URL."],
      ["What is the difference between executeQuery and executeUpdate?", "executeQuery runs a SELECT and returns a ResultSet; executeUpdate runs INSERT, UPDATE, DELETE or DDL and returns the affected row count."],
    ],
    ex: [
      "Change the program to print only products cheaper than 50. Should you add the price to the SQL or filter in Java?",
      "Filter in SQL (`WHERE price < ?` with a PreparedStatement) so the database does the work and only matching rows travel over the network.",
    ],
  }),

  lesson("Statement vs PreparedStatement vs CallableStatement", {
    intro:
      "JDBC has three statement interfaces. `Statement` runs static SQL, `PreparedStatement` runs precompiled SQL with parameters, and `CallableStatement` calls stored procedures and functions. Choosing correctly affects security, performance and readability. This lesson explains each and lists twelve differences.",
    topics: [
      [
        "Statement",
        "Created with `con.createStatement()`. Executes a SQL string as is. Good for one-off DDL (`CREATE TABLE`) or fixed queries. Building SQL by concatenating values invites SQL injection and forces the database to parse each new string.",
      ],
      [
        "PreparedStatement",
        "Created with `con.prepareStatement(\"SELECT * FROM emp WHERE dept = ?\")`. The SQL is sent once with `?` placeholders; values are bound with `setInt`, `setString`, `setDate` and so on. Values are never interpreted as SQL, which prevents injection, and the database can reuse the execution plan. It extends Statement.",
      ],
      [
        "CallableStatement",
        "Created with `con.prepareCall(\"{call raise_salary(?, ?)}\")` or `{? = call get_bonus(?)}` for functions. Supports IN parameters (`setX`), OUT parameters (`registerOutParameter` then `getX`) and IN OUT parameters. It extends PreparedStatement.",
      ],
      [
        "Twelve differences",
        "1. Purpose: static SQL / parameterised SQL / stored procedures. 2. Creation method: createStatement / prepareStatement / prepareCall. 3. Parameters: none / IN only / IN, OUT and IN OUT. 4. Compilation: parsed every execution / precompiled once / procedure precompiled in the database. 5. SQL injection: vulnerable when concatenating / safe / safe. 6. Performance for repeated SQL: lowest / high / high. 7. Binary data (BLOB) and dates: awkward / setBinaryStream, setDate / same. 8. Batch: SQL strings / one SQL with many parameter sets / procedure calls. 9. Readability: string building / clean placeholders / call escape syntax. 10. Inheritance: base interface / extends Statement / extends PreparedStatement. 11. Typical use: DDL, ad-hoc / almost all DML / database-side logic. 12. Results: ResultSet or update count / same / plus OUT parameters and multiple results.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:mysql://localhost:3306/shop";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            String userInput = "' OR '1'='1";                            // malicious value

            try (Statement st = con.createStatement();                    // Statement: concatenation
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM customer WHERE name = '" + userInput + "'")) {
                rs.next();
                System.out.println("Statement with concatenated input matched " + rs.getInt(1) + " rows (SQL injection!)");
            }

            try (PreparedStatement ps = con.prepareStatement("SELECT COUNT(*) FROM customer WHERE name = ?")) {
                ps.setString(1, userInput);                                // bound as data, never as SQL
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    System.out.println("PreparedStatement with the same input matched " + rs.getInt(1) + " rows");
                }
                ps.setString(1, "Asha");                                   // reuse the precompiled statement
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    System.out.println("reused for 'Asha': " + rs.getInt(1) + " row");
                }
            }

            try (CallableStatement cs = con.prepareCall("{call count_orders(?, ?)}")) {   // IN customer, OUT count
                cs.setString(1, "Asha");
                cs.registerOutParameter(2, Types.INTEGER);
                cs.execute();
                System.out.println("CallableStatement OUT parameter: Asha has " + cs.getInt(2) + " orders");
            }
            System.out.println("PreparedStatement is a Statement: " + Statement.class.isAssignableFrom(PreparedStatement.class)
                    + ", CallableStatement is a PreparedStatement: " + PreparedStatement.class.isAssignableFrom(CallableStatement.class));
        }
    }
}`,
    mode: "compile",
    sample: String.raw`Statement with concatenated input matched 25 rows (SQL injection!)
PreparedStatement with the same input matched 0 rows
reused for 'Asha': 1 row
CallableStatement OUT parameter: Asha has 4 orders
PreparedStatement is a Statement: true, CallableStatement is a PreparedStatement: true`,
    walk:
      "The malicious input `' OR '1'='1` concatenated into a `Statement` turns the WHERE clause into a condition that is always true, so all 25 customers match: SQL injection. The same input bound with `PreparedStatement.setString` is treated purely as a value, so nothing matches, and the precompiled statement is reused with a different parameter.\n\nThe `CallableStatement` calls a stored procedure with an IN parameter (the customer name) and an OUT parameter (the order count) registered with `registerOutParameter`. The last line confirms the inheritance chain: CallableStatement extends PreparedStatement, which extends Statement.",
    anim: [
      "Why PreparedStatement is safe",
      [
        ["input", "' OR '1'='1", "user input"],
        ["stmt", "Statement", "string concat"],
        ["sql", "WHERE ... OR 1=1", "changed SQL"],
        ["ps", "PreparedStmt", "? placeholder"],
        ["data", "plain value", "never SQL"],
      ],
      [
        ["input", "stmt", "concatenate", "With Statement, the input is pasted into the SQL text."],
        ["stmt", "sql", "parse", "The database parses the injected OR condition as part of the query."],
        ["input", "ps", "bind", "With PreparedStatement, the SQL was already sent with a placeholder."],
        ["ps", "data", "setString", "The input is bound as a value, so it can never change the query's structure."],
      ],
    ],
    mistakes: [
      "Using Statement with concatenated user input.",
      "Creating a new PreparedStatement for every execution in a loop instead of reusing it.",
      "Forgetting `registerOutParameter` before executing a CallableStatement.",
    ],
    qa: [
      ["What is the difference between Statement and PreparedStatement?", "Statement runs static SQL parsed each time and is vulnerable to injection when concatenating; PreparedStatement is precompiled with ? parameters, safe from injection and faster when reused."],
      ["How does PreparedStatement prevent SQL injection?", "Parameter values are sent separately from the SQL text and are never parsed as SQL."],
      ["What is CallableStatement used for?", "Calling stored procedures and functions, including OUT and IN OUT parameters."],
    ],
    ex: [
      "Rewrite `st.executeQuery(\"SELECT * FROM emp WHERE dept='\" + dept + \"' AND salary > \" + min)` safely.",
      "`PreparedStatement ps = con.prepareStatement(\"SELECT * FROM emp WHERE dept = ? AND salary > ?\"); ps.setString(1, dept); ps.setBigDecimal(2, min); ResultSet rs = ps.executeQuery();`.",
    ],
  }),

  lesson("CRUD Operations with Statement", {
    intro:
      "CRUD means Create, Read, Update and Delete, the four basic operations on data. This lesson performs all of them with a plain `Statement`: creating a table (DDL), inserting rows, selecting them, updating and deleting, and reading the update counts each operation returns. It is the simplest form of JDBC code and the baseline for the PreparedStatement version.",
    topics: [
      [
        "CREATE (DDL)",
        "`st.executeUpdate(\"CREATE TABLE employee (id NUMBER PRIMARY KEY, name VARCHAR2(50), salary NUMBER(10,2))\")` returns 0 for DDL statements. `DROP TABLE` and `ALTER TABLE` work the same way.",
      ],
      [
        "INSERT",
        "`executeUpdate(\"INSERT INTO employee VALUES (1, 'Asha', 90000)\")` returns the number of rows inserted (1). With literal values in SQL strings, quotes inside values must be escaped, which is one reason to prefer PreparedStatement.",
      ],
      [
        "SELECT",
        "`executeQuery(\"SELECT ...\")` returns a ResultSet; iterate with `next()` and read columns by name or by index (starting at 1).",
      ],
      [
        "UPDATE and DELETE",
        "`executeUpdate(\"UPDATE employee SET salary = salary * 1.1 WHERE id = 1\")` and `executeUpdate(\"DELETE FROM employee WHERE salary < 50000\")` return the number of affected rows, which is 0 when no row matched, a useful check that the target existed.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    static void printAll(Statement st) throws SQLException {
        try (ResultSet rs = st.executeQuery("SELECT id, name, salary FROM employee ORDER BY id")) {
            while (rs.next()) System.out.printf("    %d %-6s %10.2f%n", rs.getInt(1), rs.getString("name"), rs.getDouble("salary"));
        }
    }

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw");
             Statement st = con.createStatement()) {

            int ddl = st.executeUpdate("CREATE TABLE employee (id NUMBER PRIMARY KEY, name VARCHAR2(50), salary NUMBER(10,2))");
            System.out.println("CREATE TABLE returned " + ddl);

            int inserted = 0;
            inserted += st.executeUpdate("INSERT INTO employee VALUES (1, 'Asha', 90000)");
            inserted += st.executeUpdate("INSERT INTO employee VALUES (2, 'Ravi', 45000)");
            inserted += st.executeUpdate("INSERT INTO employee VALUES (3, 'Meera', 120000)");
            System.out.println("INSERT rows: " + inserted);

            System.out.println("SELECT:");
            printAll(st);

            int updated = st.executeUpdate("UPDATE employee SET salary = salary * 1.10 WHERE id = 1");
            int noMatch = st.executeUpdate("UPDATE employee SET salary = 0 WHERE id = 99");
            System.out.println("UPDATE rows: " + updated + ", UPDATE with no match: " + noMatch);

            int deleted = st.executeUpdate("DELETE FROM employee WHERE salary < 50000");
            System.out.println("DELETE rows: " + deleted);
            System.out.println("after update and delete:");
            printAll(st);

            st.executeUpdate("DROP TABLE employee");
            System.out.println("table dropped");
        }
    }
}`,
    mode: "compile",
    sample: String.raw`CREATE TABLE returned 0
INSERT rows: 3
SELECT:
    1 Asha     90000.00
    2 Ravi     45000.00
    3 Meera   120000.00
UPDATE rows: 1, UPDATE with no match: 0
DELETE rows: 1
after update and delete:
    1 Asha     99000.00
    3 Meera   120000.00
table dropped`,
    walk:
      "One `Statement` runs every operation. `CREATE TABLE` is DDL, so `executeUpdate` returns 0. Each INSERT returns 1, for a total of 3. The SELECT is printed by reading columns by index (`getInt(1)`) and by name (`getString(\"name\")`).\n\nThe UPDATE raises Asha's salary by 10% and reports 1 affected row, while an UPDATE for a non-existent id reports 0, a handy way to detect missing records. The DELETE removes Ravi, the only employee earning less than 50,000. Auto-commit is on by default, so each statement is committed immediately.",
    anim: [
      "CRUD with update counts",
      [
        ["create", "CREATE TABLE", "returns 0"],
        ["insert", "INSERT x3", "returns 1 each"],
        ["select", "SELECT", "ResultSet"],
        ["update", "UPDATE", "rows changed"],
        ["delete", "DELETE", "rows removed"],
      ],
      [
        ["create", "insert", "then", "DDL creates the table; executeUpdate returns 0 for DDL."],
        ["insert", "select", "then", "Each INSERT returns 1, the number of rows added."],
        ["select", "update", "then", "SELECT returns rows through a ResultSet rather than a count."],
        ["update", "delete", "then", "UPDATE and DELETE return how many rows matched their WHERE clause."],
      ],
    ],
    mistakes: [
      "Ignoring the update count and assuming an UPDATE changed a row.",
      "Embedding values with quotes (O'Brien) into SQL strings and breaking the statement.",
      "Running DDL inside application code paths instead of migrations.",
    ],
    qa: [
      ["What does executeUpdate return for DDL?", "0, since DDL does not affect rows."],
      ["How do you know if an UPDATE found the row?", "Check the returned update count; 0 means no row matched."],
      ["Are column indexes in ResultSet zero-based?", "No, they start at 1."],
    ],
    ex: [
      "Write the Statement call that deletes all employees and prints how many were removed.",
      "`int n = st.executeUpdate(\"DELETE FROM employee\"); System.out.println(n + \" rows deleted\");` (TRUNCATE is faster but cannot be rolled back in most databases).",
    ],
  }),

  lesson("CRUD Operations with PreparedStatement", {
    intro:
      "Real applications perform CRUD with `PreparedStatement`: values are bound to `?` placeholders with type-specific setters, so the code is safe from SQL injection, handles quotes and dates correctly, and reuses execution plans. This lesson repeats every CRUD operation with PreparedStatement, retrieves generated keys and handles NULL values.",
    topics: [
      [
        "Binding parameters",
        "Placeholders are numbered from 1: `ps.setInt(1, id)`, `setString`, `setBigDecimal` (money), `setDate`/`setTimestamp` or `setObject(i, LocalDate)` (JDBC 4.2), `setBoolean`. `setNull(i, Types.VARCHAR)` writes SQL NULL. `clearParameters()` resets them.",
      ],
      [
        "Reusing a statement",
        "Prepare once and execute many times with different parameters, inside the same connection. Many drivers and pools also cache prepared statements across uses.",
      ],
      [
        "Generated keys",
        "For identity or sequence-generated primary keys, prepare with `con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)` (or a column-name array for Oracle) and read them with `ps.getGeneratedKeys()` after executing the INSERT.",
      ],
      [
        "NULL handling when reading",
        "`rs.getInt(\"bonus\")` returns 0 for SQL NULL; check `rs.wasNull()` afterwards, or use `rs.getObject(\"bonus\", Integer.class)`, which returns null.",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;
import java.sql.*;

public class Main {
    static final String URL = "jdbc:postgresql://localhost:5432/shop";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE customer (id SERIAL PRIMARY KEY, name VARCHAR(50), city VARCHAR(30), credit NUMERIC(10,2), bonus INT)");
            }

            String insert = "INSERT INTO customer (name, city, credit, bonus) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insert, Statement.RETURN_GENERATED_KEYS)) {
                Object[][] rows = {{"Asha", "Pune", "1500.00", 200}, {"O'Brien", "Delhi", "300.50", null}, {"Meera", "Pune", "980.00", 50}};
                for (Object[] r : rows) {
                    ps.setString(1, (String) r[0]);                     // quotes handled safely
                    ps.setString(2, (String) r[1]);
                    ps.setBigDecimal(3, new BigDecimal((String) r[2]));
                    if (r[3] == null) ps.setNull(4, Types.INTEGER); else ps.setInt(4, (Integer) r[3]);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        keys.next();
                        System.out.println("inserted " + r[0] + " with generated id " + keys.getInt(1));
                    }
                }
            }

            try (PreparedStatement ps = con.prepareStatement("SELECT id, name, credit, bonus FROM customer WHERE city = ? ORDER BY id")) {
                ps.setString(1, "Pune");
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) System.out.println("  Pune: " + rs.getString("name") + " credit " + rs.getBigDecimal("credit"));
                }
                ps.setString(1, "Delhi");                                   // reuse with another value
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    int bonus = rs.getInt("bonus");
                    System.out.println("  Delhi: " + rs.getString("name") + ", getInt(bonus) = " + bonus + ", wasNull = " + rs.wasNull()
                            + ", getObject = " + rs.getObject("bonus", Integer.class));
                }
            }

            try (PreparedStatement ps = con.prepareStatement("UPDATE customer SET credit = credit + ? WHERE city = ?")) {
                ps.setBigDecimal(1, new BigDecimal("100"));
                ps.setString(2, "Pune");
                System.out.println("UPDATE rows: " + ps.executeUpdate());
            }
            try (PreparedStatement ps = con.prepareStatement("DELETE FROM customer WHERE name = ?")) {
                ps.setString(1, "O'Brien");
                System.out.println("DELETE rows: " + ps.executeUpdate());
            }
            try (Statement st = con.createStatement()) { st.executeUpdate("DROP TABLE customer"); }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`inserted Asha with generated id 1
inserted O'Brien with generated id 2
inserted Meera with generated id 3
  Pune: Asha credit 1500.00
  Pune: Meera credit 980.00
  Delhi: O'Brien, getInt(bonus) = 0, wasNull = true, getObject = null
UPDATE rows: 2
DELETE rows: 1`,
    walk:
      "One INSERT PreparedStatement, prepared with `RETURN_GENERATED_KEYS`, is executed three times with different values, and `getGeneratedKeys()` returns each new SERIAL id. The name \"O'Brien\" needs no escaping because it is bound as data, and the missing bonus is written as SQL NULL with `setNull`.\n\nThe SELECT is reused for two cities. For O'Brien, `getInt(\"bonus\")` returns 0 even though the column is NULL; `wasNull()` reveals the truth, and `getObject(\"bonus\", Integer.class)` returns null directly. The UPDATE adds 100 credit to both Pune customers (2 rows) and the DELETE removes O'Brien by name.",
    anim: [
      "Prepare once, execute many",
      [
        ["sql", "INSERT (?,?,?,?)", "template"],
        ["prep", "prepareStatement", "parse once"],
        ["bind", "setString(...)", "bind values"],
        ["exec", "executeUpdate", "run"],
        ["keys", "getGeneratedKeys", "new id"],
      ],
      [
        ["sql", "prep", "send", "The SQL with placeholders is sent and parsed by the database once."],
        ["bind", "exec", "values", "For each row, values are bound to the numbered placeholders."],
        ["exec", "keys", "id", "After the insert, the generated primary key can be read back."],
        ["exec", "bind", "repeat", "The same prepared statement is reused for the next row."],
      ],
    ],
    mistakes: [
      "Using `getInt` for nullable columns without checking `wasNull()`.",
      "Using double for money instead of `BigDecimal` and `setBigDecimal`.",
      "Using placeholders for table or column names (they only work for values).",
    ],
    qa: [
      ["How do you get an auto-generated key after INSERT?", "Prepare with Statement.RETURN_GENERATED_KEYS (or column names) and call getGeneratedKeys() after executing."],
      ["How do you insert NULL with PreparedStatement?", "ps.setNull(index, Types.X) or setObject(index, null, Types.X)."],
      ["Can ? placeholders be used for table names?", "No. They bind values only; identifiers must be validated and inserted into the SQL text separately."],
    ],
    ex: [
      "Write a PreparedStatement query that finds customers whose name starts with a user-supplied prefix.",
      "`PreparedStatement ps = con.prepareStatement(\"SELECT * FROM customer WHERE name LIKE ?\"); ps.setString(1, prefix + \"%\");` (escape % and _ in the prefix if users might type them).",
    ],
  }),

  lesson("Batch Processing with Statement and PreparedStatement", {
    intro:
      "Sending thousands of INSERT or UPDATE statements one at a time means thousands of network round trips. JDBC batching groups many statements into one call with `addBatch` and `executeBatch`, often making bulk operations ten to a hundred times faster. This lesson batches inserts, updates and deletes with both Statement and PreparedStatement, inside a transaction, and handles batch failures.",
    topics: [
      [
        "Batch with Statement",
        "`st.addBatch(\"INSERT ...\")`, `st.addBatch(\"UPDATE ...\")`, then `int[] counts = st.executeBatch()`. Each SQL string can be different (insert, update and delete mixed), but each is parsed separately.",
      ],
      [
        "Batch with PreparedStatement",
        "Bind parameters, call `ps.addBatch()`, repeat, then `ps.executeBatch()`. One SQL statement with many parameter sets is the most efficient form. Execute in chunks (for example every 500 rows) to limit memory, and call `clearBatch()` if you need to discard.",
      ],
      [
        "Results and failures",
        "`executeBatch` returns an update count per statement; `Statement.SUCCESS_NO_INFO` (-2) means success with unknown count. If one fails, a `BatchUpdateException` is thrown; `getUpdateCounts()` shows what happened to the others, which depends on the driver (some stop, some continue).",
      ],
      [
        "Transactions and driver settings",
        "Disable auto-commit, execute the batch, and commit once, rolling back on failure, so the batch is all-or-nothing. Some drivers need settings to send true batches, for example MySQL's `rewriteBatchedStatements=true`.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.Arrays;

public class Main {
    static final String URL = "jdbc:mysql://localhost:3306/shop?rewriteBatchedStatements=true";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (Statement st = con.createStatement()) {
                st.executeUpdate("CREATE TABLE reading (id INT PRIMARY KEY, sensor VARCHAR(10), value DOUBLE)");
            }
            con.setAutoCommit(false);                                   // one transaction for the batch

            long start = System.nanoTime();
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO reading VALUES (?, ?, ?)")) {
                for (int i = 1; i <= 10_000; i++) {
                    ps.setInt(1, i);
                    ps.setString(2, "S" + (i % 5));
                    ps.setDouble(3, 20 + i % 10);
                    ps.addBatch();
                    if (i % 1000 == 0) ps.executeBatch();               // send in chunks of 1000
                }
                ps.executeBatch();
            }
            con.commit();
            System.out.println("PreparedStatement batch inserted 10000 rows in " + ((System.nanoTime() - start) / 1_000_000 < 5_000 ? "well under 5 s" : "a long time"));

            try (Statement st = con.createStatement()) {                // mixed batch with Statement
                st.addBatch("UPDATE reading SET value = value + 1 WHERE sensor = 'S1'");
                st.addBatch("DELETE FROM reading WHERE sensor = 'S4'");
                st.addBatch("INSERT INTO reading VALUES (20001, 'S9', 99.9)");
                int[] counts = st.executeBatch();
                con.commit();
                System.out.println("Statement batch update counts: " + Arrays.toString(counts));
            }

            try (PreparedStatement ps = con.prepareStatement("INSERT INTO reading VALUES (?, ?, ?)")) {
                for (int id : new int[] {30001, 1, 30002}) {              // id 1 already exists
                    ps.setInt(1, id); ps.setString(2, "S0"); ps.setDouble(3, 1.0);
                    ps.addBatch();
                }
                ps.executeBatch();
                con.commit();
            } catch (BatchUpdateException e) {
                con.rollback();                                          // all-or-nothing
                System.out.println("BatchUpdateException: " + e.getMessage().split(" for key")[0] + ", counts " + Arrays.toString(e.getUpdateCounts()) + ", rolled back");
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM reading")) {
                rs.next();
                System.out.println("rows now: " + rs.getInt(1));
                st.executeUpdate("DROP TABLE reading");
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`PreparedStatement batch inserted 10000 rows in well under 5 s
Statement batch update counts: [2000, 2000, 1]
BatchUpdateException: Duplicate entry '1', counts [-3, -3, -3], rolled back
rows now: 8001`,
    walk:
      "With auto-commit off, 10,000 parameter sets are added to one PreparedStatement batch and sent every 1,000 rows, then committed once; with MySQL's `rewriteBatchedStatements=true` this becomes a few multi-row inserts instead of 10,000 round trips.\n\nA `Statement` batch mixes an UPDATE (2,000 rows for sensor S1), a DELETE (2,000 rows for S4) and an INSERT (1 row) and returns one count per statement. The last batch contains a duplicate primary key; `executeBatch` throws `BatchUpdateException`, its update counts show how the driver treated each statement (-3 means EXECUTE_FAILED), and the rollback discards the whole batch, leaving 8,001 rows.",
    anim: [
      "Batching round trips",
      [
        ["app", "application", "10,000 rows"],
        ["add", "addBatch()", "queue locally"],
        ["exec", "executeBatch()", "every 1000"],
        ["db", "database", "few round trips"],
        ["commit", "commit()", "all or nothing"],
      ],
      [
        ["app", "add", "bind", "Each row's values are bound and queued with addBatch, without contacting the database."],
        ["add", "exec", "flush", "executeBatch sends the queued statements together in one request."],
        ["exec", "db", "bulk", "The database processes the whole chunk, saving thousands of round trips."],
        ["db", "commit", "commit", "A single commit at the end makes the batch atomic; on failure, rollback."],
      ],
    ],
    mistakes: [
      "Leaving auto-commit on, so every statement in the batch is committed separately.",
      "Accumulating millions of rows in one batch and running out of memory; flush in chunks.",
      "Assuming every driver continues after a failed batch entry.",
    ],
    qa: [
      ["How do you perform batch processing in JDBC?", "Call addBatch() for each statement or parameter set and executeBatch() to send them together, typically inside a transaction."],
      ["What does executeBatch return?", "An int array of update counts, one per batched statement (or SUCCESS_NO_INFO / EXECUTE_FAILED)."],
      ["What happens when one statement in a batch fails?", "A BatchUpdateException is thrown; getUpdateCounts tells what happened to each entry, and you usually roll back."],
    ],
    ex: [
      "Why is a PreparedStatement batch usually faster than a Statement batch with the same number of inserts?",
      "The PreparedStatement SQL is parsed once and only parameter values are sent, while each Statement batch entry is a separate SQL string the database must parse.",
    ],
  }),

  lesson("Stored Procedures and Functions with CallableStatement", {
    intro:
      "Stored procedures and functions run inside the database, close to the data, and are called from Java through `CallableStatement`. This lesson calls procedures with IN, OUT and IN OUT parameters, calls a function that returns a value, executes procedure calls in a batch, and reads an Oracle REF CURSOR (a procedure that returns a result set).",
    topics: [
      [
        "Escape syntax",
        "Procedures: `{call proc_name(?, ?)}`. Functions: `{? = call func_name(?)}`. The driver translates this standard syntax into the database's native call syntax.",
      ],
      [
        "IN, OUT and IN OUT parameters",
        "IN: bind with `setX` like PreparedStatement. OUT: `registerOutParameter(index, Types.X)` before executing, read with `getX(index)` after. IN OUT: both set a value and register it as an out parameter; the procedure can change it.",
      ],
      [
        "Functions",
        "The first placeholder is the return value: register it as an out parameter, bind the arguments, execute, then read the result with `getX(1)`.",
      ],
      [
        "Batch procedure calls",
        "`addBatch()` and `executeBatch()` work with CallableStatement for procedures that have only IN parameters, calling the same procedure many times in one round trip.",
      ],
      [
        "Oracle cursors (REF CURSOR)",
        "A procedure can return an open cursor as an OUT parameter. Register it with `Types.REF_CURSOR` (JDBC 4.2) or `OracleTypes.CURSOR`, execute, and get it with `getObject(index, ResultSet.class)` to iterate like a normal ResultSet.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";
    /* Database objects used (Oracle PL/SQL):
       CREATE PROCEDURE raise_salary(p_id IN NUMBER, p_pct IN NUMBER, p_new OUT NUMBER) AS
       BEGIN UPDATE employee SET salary = salary * (1 + p_pct/100) WHERE id = p_id RETURNING salary INTO p_new; END;
       CREATE PROCEDURE double_it(p_value IN OUT NUMBER) AS BEGIN p_value := p_value * 2; END;
       CREATE FUNCTION annual_bonus(p_id IN NUMBER) RETURN NUMBER AS v NUMBER;
       BEGIN SELECT salary * 0.1 INTO v FROM employee WHERE id = p_id; RETURN v; END;
       CREATE PROCEDURE log_event(p_msg IN VARCHAR2) AS BEGIN INSERT INTO audit_log(msg) VALUES (p_msg); END;
       CREATE PROCEDURE employees_in(p_dept IN VARCHAR2, p_rows OUT SYS_REFCURSOR) AS
       BEGIN OPEN p_rows FOR SELECT name, salary FROM employee WHERE dept = p_dept ORDER BY name; END; */

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (CallableStatement cs = con.prepareCall("{call raise_salary(?, ?, ?)}")) {      // IN, IN, OUT
                cs.setInt(1, 1);
                cs.setInt(2, 10);
                cs.registerOutParameter(3, Types.NUMERIC);
                cs.execute();
                System.out.println("IN/OUT: new salary of employee 1 = " + cs.getBigDecimal(3));
            }

            try (CallableStatement cs = con.prepareCall("{call double_it(?)}")) {               // IN OUT
                cs.setInt(1, 21);
                cs.registerOutParameter(1, Types.INTEGER);
                cs.execute();
                System.out.println("IN OUT: 21 doubled by the procedure = " + cs.getInt(1));
            }

            try (CallableStatement cs = con.prepareCall("{? = call annual_bonus(?)}")) {        // function
                cs.registerOutParameter(1, Types.NUMERIC);
                cs.setInt(2, 1);
                cs.execute();
                System.out.println("function annual_bonus(1) = " + cs.getBigDecimal(1));
            }

            con.setAutoCommit(false);
            try (CallableStatement cs = con.prepareCall("{call log_event(?)}")) {               // batch of calls
                for (String msg : new String[] {"login", "view", "logout"}) { cs.setString(1, msg); cs.addBatch(); }
                System.out.println("batched procedure calls: " + cs.executeBatch().length);
            }
            con.commit();

            try (CallableStatement cs = con.prepareCall("{call employees_in(?, ?)}")) {         // Oracle REF CURSOR
                cs.setString(1, "DEV");
                cs.registerOutParameter(2, Types.REF_CURSOR);
                cs.execute();
                try (ResultSet rs = cs.getObject(2, ResultSet.class)) {
                    System.out.println("REF CURSOR rows for DEV:");
                    while (rs.next()) System.out.println("  " + rs.getString("name") + " " + rs.getBigDecimal("salary"));
                }
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`IN/OUT: new salary of employee 1 = 99000
IN OUT: 21 doubled by the procedure = 42
function annual_bonus(1) = 9900
batched procedure calls: 3
REF CURSOR rows for DEV:
  Asha 99000
  Meera 120000`,
    walk:
      "The comment lists the PL/SQL objects the program calls. `raise_salary` takes two IN parameters and returns the new salary through an OUT parameter registered before `execute()`. `double_it` uses a single IN OUT parameter: the program sets 21 and reads back 42. The function call uses the `{? = call ...}` form, where placeholder 1 is the return value.\n\nThree `log_event` calls are batched and committed together. Finally `employees_in` returns a `SYS_REFCURSOR`; registering it as `Types.REF_CURSOR` and reading it with `getObject(2, ResultSet.class)` gives an ordinary ResultSet of the DEV employees.",
    anim: [
      "Parameter directions",
      [
        ["java", "Java", "CallableStatement"],
        ["in", "IN", "setInt(1, 1)"],
        ["proc", "procedure", "in the DB"],
        ["out", "OUT", "registerOut.."],
        ["inout", "IN OUT", "both ways"],
      ],
      [
        ["java", "in", "bind", "IN parameters carry values from Java into the procedure."],
        ["in", "proc", "call", "The database runs the procedure close to the data."],
        ["proc", "out", "return", "OUT parameters, registered before execute, carry results back to Java."],
        ["inout", "proc", "both", "IN OUT parameters send a value in and receive the changed value back."],
      ],
    ],
    mistakes: [
      "Reading an OUT parameter without registering it first.",
      "Using the wrong SQL type in registerOutParameter.",
      "Putting heavy business logic in procedures that then becomes hard to test and version.",
    ],
    qa: [
      ["How do you call a stored procedure from Java?", "con.prepareCall(\"{call name(?, ?)}\"), bind IN parameters, register OUT parameters, execute, then read the OUT values."],
      ["How do you call a database function?", "Use \"{? = call func(?)}\", register parameter 1 as the return type, bind the arguments, execute and read getX(1)."],
      ["How do you read a REF CURSOR?", "Register the parameter as Types.REF_CURSOR (or OracleTypes.CURSOR), execute, and get it as a ResultSet with getObject."],
    ],
    ex: [
      "Write the call for a procedure `transfer(from IN, to IN, amount IN, status OUT VARCHAR2)`.",
      "`CallableStatement cs = con.prepareCall(\"{call transfer(?, ?, ?, ?)}\"); cs.setInt(1, a); cs.setInt(2, b); cs.setBigDecimal(3, amt); cs.registerOutParameter(4, Types.VARCHAR); cs.execute(); String status = cs.getString(4);`.",
    ],
  }),

  lesson("execute(), getResultSet() and getUpdateCount()", {
    intro:
      "`executeQuery` is for SELECT and `executeUpdate` for INSERT, UPDATE, DELETE and DDL. But sometimes you do not know in advance what a SQL string will return, or a stored procedure returns several results. The general `execute()` method handles all cases. This lesson explains `execute`, `getResultSet`, `getUpdateCount` and `getMoreResults`.",
    topics: [
      [
        "execute()",
        "`boolean hasResultSet = st.execute(sql)` runs any SQL. It returns true if the first result is a ResultSet and false if it is an update count (or there is no result).",
      ],
      [
        "getResultSet() and getUpdateCount()",
        "After `execute`, `getResultSet()` returns the current ResultSet (or null), and `getUpdateCount()` returns the current update count, or -1 if the current result is a ResultSet or there are no more results.",
      ],
      [
        "getMoreResults()",
        "Moves to the next result, closing the current ResultSet by default, and returns true if it is a ResultSet. The standard loop processes results until `getMoreResults()` is false and `getUpdateCount()` is -1.",
      ],
      [
        "When to use it",
        "SQL consoles and tools that run user-typed SQL, generic migration runners, and procedures returning multiple result sets (common in SQL Server). In ordinary application code, `executeQuery` and `executeUpdate` are clearer.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:sqlserver://localhost:1433;databaseName=shop;encrypt=true;trustServerCertificate=true";

    static void runAny(Statement st, String sql) throws SQLException {
        boolean isResultSet = st.execute(sql);
        int resultNumber = 1;
        while (true) {
            if (isResultSet) {
                try (ResultSet rs = st.getResultSet()) {
                    int rows = 0;
                    while (rs.next()) rows++;
                    System.out.println("  result " + resultNumber + ": ResultSet with " + rows + " rows, columns " + rs.getMetaData().getColumnCount());
                }
            } else {
                int count = st.getUpdateCount();
                if (count == -1) break;                                    // no more results
                System.out.println("  result " + resultNumber + ": update count " + count);
            }
            resultNumber++;
            isResultSet = st.getMoreResults();
        }
    }

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw");
             Statement st = con.createStatement()) {
            System.out.println("SELECT via execute():");
            runAny(st, "SELECT id, name FROM product");
            System.out.println("UPDATE via execute():");
            runAny(st, "UPDATE product SET price = price * 1.05 WHERE price < 50");
            System.out.println("CREATE via execute():");
            runAny(st, "CREATE TABLE temp_note (id INT)");
            System.out.println("batch of statements returning several results:");
            runAny(st, "INSERT INTO temp_note VALUES (1); INSERT INTO temp_note VALUES (2); SELECT * FROM temp_note; DROP TABLE temp_note");
        }
    }
}`,
    mode: "compile",
    sample: String.raw`SELECT via execute():
  result 1: ResultSet with 3 rows, columns 2
UPDATE via execute():
  result 1: update count 2
CREATE via execute():
  result 1: update count 0
batch of statements returning several results:
  result 1: update count 1
  result 2: update count 1
  result 3: ResultSet with 2 rows, columns 1
  result 4: update count 0`,
    walk:
      "`runAny` can execute any SQL without knowing what it returns. `execute()` tells it whether the first result is a ResultSet; it then reads either the ResultSet or the update count, and calls `getMoreResults()` to move on, stopping when there is no ResultSet and the update count is -1.\n\nA SELECT gives one ResultSet, an UPDATE an update count of 2, and DDL an update count of 0. SQL Server allows several statements in one string, which produces four results in sequence: two insert counts, a ResultSet and the DROP's count; the same loop handles stored procedures that return multiple results.",
    anim: [
      "Walking through multiple results",
      [
        ["exec", "execute(sql)", "true/false"],
        ["rs", "getResultSet", "if true"],
        ["uc", "getUpdateCount", "if false"],
        ["more", "getMoreResults", "next result"],
        ["done", "count == -1", "finished"],
      ],
      [
        ["exec", "rs", "ResultSet", "If execute returns true, the current result is a ResultSet."],
        ["exec", "uc", "count", "If it returns false, read the update count instead."],
        ["rs", "more", "advance", "getMoreResults moves to the next result and says whether it is a ResultSet."],
        ["uc", "done", "end", "When there is no ResultSet and the update count is -1, there are no more results."],
      ],
    ],
    mistakes: [
      "Stopping after the first result of a procedure that returns several.",
      "Using execute() everywhere instead of the clearer executeQuery/executeUpdate.",
    ],
    qa: [
      ["What does Statement.execute() return?", "true if the first result is a ResultSet, false if it is an update count or there is no result."],
      ["What does getUpdateCount() return when the current result is a ResultSet?", "-1 (also -1 when there are no more results)."],
      ["How do you process multiple results from one call?", "Loop with getResultSet/getUpdateCount and getMoreResults until getMoreResults is false and getUpdateCount is -1."],
    ],
    ex: [
      "A SQL console lets users type any statement. Which method do you call and how do you decide what to print?",
      "Call `execute(sql)`; if it returns true print the ResultSet as a table, otherwise print \"N rows affected\" from getUpdateCount, and loop with getMoreResults for additional results.",
    ],
  }),

  lesson("ResultSet Types, Concurrency and Holdability", {
    intro:
      "A ResultSet is a cursor over query results, and three settings decide how it behaves: its type (whether it can scroll and whether it sees changes), its concurrency (read-only or updatable) and its holdability (whether it survives a commit). This lesson explains `TYPE_FORWARD_ONLY`, `TYPE_SCROLL_INSENSITIVE`, `TYPE_SCROLL_SENSITIVE`, `CONCUR_READ_ONLY`, `CONCUR_UPDATABLE`, `HOLD_CURSORS_OVER_COMMIT` and `CLOSE_CURSORS_AT_COMMIT`, and how to find a ResultSet's size.",
    topics: [
      [
        "ResultSet types",
        "`TYPE_FORWARD_ONLY` (default): only `next()`, cheapest, streams rows. `TYPE_SCROLL_INSENSITIVE`: can move anywhere (`previous`, `first`, `last`, `absolute(n)`, `relative(n)`, `beforeFirst`, `afterLast`) over a snapshot that does not reflect later changes by others. `TYPE_SCROLL_SENSITIVE`: scrollable and may reflect changes made to the underlying rows while it is open (support varies by driver).",
      ],
      [
        "Concurrency",
        "`CONCUR_READ_ONLY` (default) allows only reading. `CONCUR_UPDATABLE` allows `updateRow`, `insertRow` and `deleteRow` through the ResultSet (next lesson). Request them with `con.createStatement(type, concurrency)` or `prepareStatement(sql, type, concurrency)`; the driver may downgrade unsupported combinations, so check `rs.getType()` and `getConcurrency()`.",
      ],
      [
        "Holdability",
        "`HOLD_CURSORS_OVER_COMMIT`: the ResultSet stays open after `commit()`. `CLOSE_CURSORS_AT_COMMIT`: it is closed when the transaction commits. Set it with the three-argument `createStatement` or `con.setHoldability`, and read the default with `DatabaseMetaData.getResultSetHoldability()`.",
      ],
      [
        "Finding the size of a ResultSet",
        "There is no size method. With a scrollable ResultSet: `rs.last(); int size = rs.getRow(); rs.beforeFirst();`. With forward-only ones, count while iterating or run a separate `SELECT COUNT(*)`, which is usually best.",
      ],
      [
        "Errors from the wrong type",
        "Calling `previous()`, `first()` or `absolute()` on a forward-only ResultSet throws \"Invalid operation for forward only resultset\" (Oracle) or a similar SQLException.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (Statement st = con.createStatement();                                           // defaults
                 ResultSet rs = st.executeQuery("SELECT name FROM product ORDER BY id")) {
                System.out.println("default type forward only: " + (rs.getType() == ResultSet.TYPE_FORWARD_ONLY)
                        + ", read only: " + (rs.getConcurrency() == ResultSet.CONCUR_READ_ONLY));
                rs.next();
                try {
                    rs.previous();
                } catch (SQLException e) {
                    System.out.println("previous() on forward-only: " + e.getMessage());
                }
            }

            try (Statement st = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
                 ResultSet rs = st.executeQuery("SELECT name FROM product ORDER BY id")) {
                rs.last();
                int size = rs.getRow();                                                        // size via last()
                System.out.println("scroll insensitive: size " + size + ", last = " + rs.getString(1));
                rs.first();
                System.out.println("first() = " + rs.getString(1));
                rs.absolute(2);
                System.out.println("absolute(2) = " + rs.getString(1));
                rs.relative(-1);
                System.out.println("relative(-1) = " + rs.getString(1) + ", isFirst " + rs.isFirst());
                rs.afterLast();
                StringBuilder backwards = new StringBuilder();
                while (rs.previous()) backwards.append(rs.getString(1)).append(" ");
                System.out.println("iterated backwards: " + backwards.toString().trim());
            }

            try (Statement st = con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
                ResultSet rs = st.executeQuery("SELECT id, name FROM product");
                System.out.println("requested scroll sensitive + updatable, got sensitive: " + (rs.getType() == ResultSet.TYPE_SCROLL_SENSITIVE)
                        + ", updatable: " + (rs.getConcurrency() == ResultSet.CONCUR_UPDATABLE));
                rs.close();
            }

            DatabaseMetaData meta = con.getMetaData();
            System.out.println("supports HOLD_CURSORS_OVER_COMMIT: " + meta.supportsResultSetHoldability(ResultSet.HOLD_CURSORS_OVER_COMMIT)
                    + ", default holdability is hold: " + (meta.getResultSetHoldability() == ResultSet.HOLD_CURSORS_OVER_COMMIT));
            con.setAutoCommit(false);
            try (Statement st = con.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY, ResultSet.HOLD_CURSORS_OVER_COMMIT);
                 ResultSet rs = st.executeQuery("SELECT name FROM product ORDER BY id")) {
                rs.next();
                con.commit();
                System.out.println("after commit with HOLD_CURSORS_OVER_COMMIT, still open: " + !rs.isClosed() + ", next row: " + (rs.next() ? rs.getString(1) : "none"));
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`default type forward only: true, read only: true
previous() on forward-only: Invalid operation for forward only resultset : previous
scroll insensitive: size 3, last = Ink bottle
first() = Pen
absolute(2) = Notebook
relative(-1) = Pen, isFirst true
iterated backwards: Ink bottle Notebook Pen
requested scroll sensitive + updatable, got sensitive: true, updatable: true
supports HOLD_CURSORS_OVER_COMMIT: true, default holdability is hold: true
after commit with HOLD_CURSORS_OVER_COMMIT, still open: true, next row: Notebook`,
    walk:
      "A default Statement produces a forward-only, read-only ResultSet, and calling `previous()` on it fails with Oracle's \"Invalid operation for forward only resultset\". A `TYPE_SCROLL_INSENSITIVE` ResultSet can move anywhere: `last()` plus `getRow()` gives its size (3), and `first`, `absolute`, `relative`, `afterLast` and `previous` navigate and iterate backwards.\n\nRequesting `TYPE_SCROLL_SENSITIVE` with `CONCUR_UPDATABLE` is supported for a simple single-table query; checking `getType()` and `getConcurrency()` confirms the driver did not downgrade it. Finally a cursor created with `HOLD_CURSORS_OVER_COMMIT` stays open after `commit()` and can keep reading.",
    anim: [
      "Moving a scrollable cursor",
      [
        ["before", "beforeFirst", "position 0"],
        ["r1", "row 1", "Pen"],
        ["r2", "row 2", "Notebook"],
        ["r3", "row 3", "Ink bottle"],
        ["after", "afterLast", "position 4"],
      ],
      [
        ["before", "r1", "next()", "A new ResultSet starts before the first row; next() moves to row 1."],
        ["r1", "r3", "last()", "last() jumps straight to row 3, and getRow() reports 3: the size."],
        ["r3", "r2", "previous()", "Scrollable result sets can move backwards with previous()."],
        ["after", "r3", "from the end", "afterLast() then previous() iterates in reverse; forward-only sets cannot."],
      ],
    ],
    mistakes: [
      "Requesting scrollable result sets for huge queries; they may cache every row in memory.",
      "Assuming the driver honoured the requested type or concurrency without checking.",
      "Counting rows with `last()` when a `SELECT COUNT(*)` would be cheaper.",
    ],
    qa: [
      ["What are the ResultSet types?", "TYPE_FORWARD_ONLY, TYPE_SCROLL_INSENSITIVE and TYPE_SCROLL_SENSITIVE."],
      ["What is the difference between scroll-sensitive and scroll-insensitive?", "Both can scroll; a sensitive ResultSet may reflect changes made to the underlying data while it is open, an insensitive one shows a snapshot."],
      ["What is ResultSet holdability?", "Whether the cursor stays open (HOLD_CURSORS_OVER_COMMIT) or closes (CLOSE_CURSORS_AT_COMMIT) when the transaction commits."],
      ["How do you get the number of rows in a ResultSet?", "With a scrollable ResultSet call last() and getRow(); otherwise count while iterating or use SELECT COUNT(*)."],
    ],
    ex: [
      "You must show page 3 (rows 21 to 30) of a query result in a desktop app using JDBC only. Which ResultSet type and methods help, and what is a better alternative for large tables?",
      "A TYPE_SCROLL_INSENSITIVE ResultSet with absolute(21) then reading 10 rows works, but for large tables use SQL pagination (OFFSET/FETCH or ROWNUM) so only the needed rows are transferred.",
    ],
  }),

  lesson("Updatable ResultSet: updateRow(), insertRow() and deleteRow()", {
    intro:
      "With `CONCUR_UPDATABLE`, a ResultSet is not just for reading: you can change the current row, insert new rows and delete rows through it, and the driver writes the changes to the table. This lesson uses `updateXxx` with `updateRow()`, the insert row with `moveToInsertRow()` and `insertRow()`, and `deleteRow()`, and explains the requirements and limits.",
    topics: [
      [
        "Requirements",
        "Create the statement with `ResultSet.CONCUR_UPDATABLE` (and usually a scrollable type). The query must be simple: a single table, selecting its primary key or row id, no joins, aggregates, DISTINCT or `SELECT *` on some drivers (Oracle requires explicit column names). Otherwise the driver silently returns a read-only ResultSet.",
      ],
      [
        "updateRow()",
        "Position on a row, call `rs.updateString(\"name\", \"New\")`, `updateBigDecimal`, `updateNull` and so on, then `rs.updateRow()` to write it. `cancelRowUpdates()` discards pending changes; moving to another row before `updateRow` also discards them.",
      ],
      [
        "insertRow()",
        "`rs.moveToInsertRow()` moves to a special staging row; set every required column with `updateXxx`, call `rs.insertRow()`, then `rs.moveToCurrentRow()` to return to where you were.",
      ],
      [
        "deleteRow()",
        "Position on a row and call `rs.deleteRow()`; the row is removed from the table (and, depending on the driver, either removed from the ResultSet or left as a hole: check `rowDeleted()`).",
      ],
      [
        "When to use it",
        "Handy for small interactive tools and admin screens. For application code, explicit UPDATE, INSERT and DELETE statements are clearer, easier to batch and work with any query.",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;
import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    static void print(Connection con, String label) throws SQLException {
        try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT id, name, price FROM product ORDER BY id")) {
            StringBuilder sb = new StringBuilder(label + ":");
            while (rs.next()) sb.append(" [").append(rs.getInt(1)).append(" ").append(rs.getString(2)).append(" ").append(rs.getBigDecimal(3)).append("]");
            System.out.println(sb);
        }
    }

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            print(con, "before");
            try (Statement st = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
                 ResultSet rs = st.executeQuery("SELECT id, name, price FROM product")) {      // single table, explicit columns
                System.out.println("updatable: " + (rs.getConcurrency() == ResultSet.CONCUR_UPDATABLE));

                while (rs.next()) {
                    if (rs.getString("name").equals("Pen")) {
                        rs.updateBigDecimal("price", new BigDecimal("12.00"));              // change in place
                        rs.updateRow();
                    }
                }

                rs.moveToInsertRow();                                                        // staging row
                rs.updateInt("id", 4);
                rs.updateString("name", "Stapler");
                rs.updateBigDecimal("price", new BigDecimal("150.00"));
                rs.insertRow();
                rs.moveToCurrentRow();

                rs.absolute(2);                                                              // Notebook
                String removed = rs.getString("name");
                rs.deleteRow();
                System.out.println("deleted " + removed);

                rs.absolute(1);
                rs.updateString("name", "Pencil");
                rs.cancelRowUpdates();                                                       // discard
                System.out.println("cancelled update, name still: " + rs.getString("name"));
            }
            print(con, "after");

            try (Statement st = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
                 ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM product")) {             // aggregate: not updatable
                System.out.println("aggregate query downgraded to read only: " + (rs.getConcurrency() == ResultSet.CONCUR_READ_ONLY)
                        + ", warning: " + (st.getWarnings() != null));
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`before: [1 Pen 10.50] [2 Notebook 45.00] [3 Ink bottle 99.00]
updatable: true
deleted Notebook
cancelled update, name still: Pen
after: [1 Pen 12.00] [3 Ink bottle 99.00] [4 Stapler 150.00]
aggregate query downgraded to read only: true, warning: true`,
    walk:
      "The updatable ResultSet is created from a single-table query with explicit columns. The loop finds the Pen row, changes its price with `updateBigDecimal` and writes it with `updateRow()`. `moveToInsertRow()`, three `updateXxx` calls and `insertRow()` add a Stapler, and `moveToCurrentRow()` returns to the cursor position.\n\n`absolute(2)` positions on the Notebook and `deleteRow()` removes it from the table. An update to row 1 is discarded with `cancelRowUpdates()`. The table afterwards shows all three changes. A query with an aggregate cannot be updatable, so the driver downgrades it to read-only and records a warning on the statement.",
    anim: [
      "Editing through a ResultSet",
      [
        ["rs", "updatable RS", "cursor"],
        ["upd", "updateXxx", "pending change"],
        ["row", "updateRow()", "write"],
        ["ins", "moveToInsertRow", "staging row"],
        ["table", "product table", "database"],
      ],
      [
        ["rs", "upd", "set", "updateBigDecimal changes the current row's value in the ResultSet only."],
        ["upd", "row", "commit row", "updateRow() sends the change to the database as an UPDATE."],
        ["ins", "table", "insertRow", "The staging row is filled and insertRow() sends an INSERT."],
        ["rs", "table", "deleteRow", "deleteRow() on the current row sends a DELETE for it."],
      ],
    ],
    mistakes: [
      "Moving the cursor before calling updateRow, silently losing the change.",
      "Expecting joins or SELECT * queries to be updatable.",
      "Forgetting to set NOT NULL columns before insertRow.",
    ],
    qa: [
      ["How do you update a row through a ResultSet?", "Create the statement with CONCUR_UPDATABLE, position on the row, call updateXxx methods and then updateRow()."],
      ["How do you insert a row through a ResultSet?", "moveToInsertRow(), set columns with updateXxx, insertRow(), then moveToCurrentRow()."],
      ["When is a ResultSet not updatable even if you request it?", "For queries with joins, aggregates, DISTINCT, missing primary key or other non-simple forms; the driver downgrades it to read-only."],
    ],
    ex: [
      "Using an updatable ResultSet, increase the price of every product by 5%. What is the simpler alternative?",
      "Loop with `rs.next()`, `rs.updateBigDecimal(\"price\", rs.getBigDecimal(\"price\").multiply(new BigDecimal(\"1.05\")))`, `rs.updateRow()`. Simpler and faster: `UPDATE product SET price = price * 1.05`.",
    ],
  }),

  lesson("Transactions: commit, rollback, setAutoCommit and Savepoints", {
    intro:
      "A transaction groups several SQL statements so they all succeed or all fail together, like debiting one account and crediting another. JDBC connections are in auto-commit mode by default, committing every statement immediately. This lesson manages transactions explicitly with `setAutoCommit(false)`, `commit()` and `rollback()`, uses savepoints for partial rollback, and introduces isolation levels.",
    topics: [
      [
        "Auto-commit",
        "By default each statement is its own transaction, committed as soon as it completes. `con.setAutoCommit(false)` starts manual transaction mode: changes stay pending until you call `commit()` or `rollback()`.",
      ],
      [
        "commit and rollback",
        "`commit()` makes all pending changes permanent and visible to others; `rollback()` undoes them. The standard pattern: `setAutoCommit(false)`; try { statements; `commit()` } catch (SQLException e) { `rollback()`; rethrow } finally { restore auto-commit or close }.",
      ],
      [
        "Savepoints",
        "`Savepoint sp = con.setSavepoint(\"afterOrder\")` marks a point inside a transaction; `con.rollback(sp)` undoes only the work after it, keeping earlier changes pending; `releaseSavepoint(sp)` discards the marker. Useful for optional steps in a larger unit of work.",
      ],
      [
        "Isolation levels",
        "`con.setTransactionIsolation(...)`: READ_UNCOMMITTED (dirty reads possible), READ_COMMITTED (default in Oracle, PostgreSQL, SQL Server), REPEATABLE_READ (default in MySQL InnoDB) and SERIALIZABLE (strictest). Higher levels prevent more anomalies (dirty reads, non-repeatable reads, phantom reads) at the cost of concurrency.",
      ],
      [
        "ACID",
        "Transactions provide Atomicity (all or nothing), Consistency (constraints hold), Isolation (concurrent transactions do not interfere) and Durability (committed data survives crashes).",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;
import java.sql.*;

public class Main {
    static final String URL = "jdbc:postgresql://localhost:5432/bank";

    static BigDecimal balance(Connection con, int id) throws SQLException {
        try (PreparedStatement ps = con.prepareStatement("SELECT balance FROM account WHERE id = ?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) { rs.next(); return rs.getBigDecimal(1); }
        }
    }

    static void transfer(Connection con, int from, int to, String amount) throws SQLException {
        boolean previous = con.getAutoCommit();
        con.setAutoCommit(false);
        try (PreparedStatement debit = con.prepareStatement("UPDATE account SET balance = balance - ? WHERE id = ? AND balance >= ?");
             PreparedStatement credit = con.prepareStatement("UPDATE account SET balance = balance + ? WHERE id = ?")) {
            BigDecimal amt = new BigDecimal(amount);
            debit.setBigDecimal(1, amt); debit.setInt(2, from); debit.setBigDecimal(3, amt);
            if (debit.executeUpdate() != 1) throw new SQLException("insufficient funds in account " + from);
            credit.setBigDecimal(1, amt); credit.setInt(2, to);
            if (credit.executeUpdate() != 1) throw new SQLException("account " + to + " not found");
            con.commit();                                                     // both or nothing
            System.out.println("transfer of " + amount + " committed");
        } catch (SQLException e) {
            con.rollback();
            System.out.println("rolled back: " + e.getMessage());
        } finally {
            con.setAutoCommit(previous);
        }
    }

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "bank", "bank_pw")) {
            System.out.println("auto-commit by default: " + con.getAutoCommit() + ", isolation READ_COMMITTED: "
                    + (con.getTransactionIsolation() == Connection.TRANSACTION_READ_COMMITTED));
            System.out.println("start: A=" + balance(con, 1) + " B=" + balance(con, 2));
            transfer(con, 1, 2, "300.00");
            transfer(con, 1, 2, "5000.00");                                   // not enough money
            transfer(con, 1, 99, "10.00");                                    // missing account
            System.out.println("after: A=" + balance(con, 1) + " B=" + balance(con, 2));

            con.setAutoCommit(false);
            try (Statement st = con.createStatement()) {
                st.executeUpdate("INSERT INTO audit_log(msg) VALUES ('order placed')");
                Savepoint afterOrder = con.setSavepoint("afterOrder");
                st.executeUpdate("INSERT INTO audit_log(msg) VALUES ('optional coupon applied')");
                con.rollback(afterOrder);                                     // undo only the coupon
                con.commit();
                try (ResultSet rs = st.executeQuery("SELECT msg FROM audit_log ORDER BY id DESC LIMIT 1")) {
                    rs.next();
                    System.out.println("savepoint: last committed log entry = " + rs.getString(1));
                }
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`auto-commit by default: true, isolation READ_COMMITTED: true
start: A=1000.00 B=500.00
transfer of 300.00 committed
rolled back: insufficient funds in account 1
rolled back: account 99 not found
after: A=700.00 B=800.00
savepoint: last committed log entry = order placed`,
    walk:
      "A new connection is in auto-commit mode with READ_COMMITTED isolation (PostgreSQL's default). `transfer` switches auto-commit off, debits only if the balance is sufficient (checked by the update count), credits the target, and commits both updates together.\n\nThe second transfer fails the balance check and the third fails because account 99 does not exist; in that case the debit had already succeeded, but `rollback()` undoes it, so no money disappears. The final balances reflect only the first transfer. The savepoint example keeps the \"order placed\" entry while rolling back the optional coupon step after the savepoint.",
    anim: [
      "All or nothing",
      [
        ["begin", "autoCommit off", "begin"],
        ["debit", "debit A", "-300"],
        ["credit", "credit B", "+300"],
        ["commit", "commit()", "both saved"],
        ["rollback", "rollback()", "both undone"],
      ],
      [
        ["begin", "debit", "update", "With auto-commit off, the debit is pending, not yet visible to others."],
        ["debit", "credit", "update", "The credit is also pending in the same transaction."],
        ["credit", "commit", "success", "If both succeed, commit makes the transfer permanent at once."],
        ["credit", "rollback", "failure", "If anything fails, rollback undoes the debit too: no money is lost."],
      ],
    ],
    mistakes: [
      "Leaving auto-commit on for multi-statement operations, so a failure leaves half-done changes.",
      "Forgetting to roll back on failure, leaving locks held until the connection closes.",
      "Returning a connection to a pool with auto-commit still false.",
    ],
    qa: [
      ["What is auto-commit mode?", "The default JDBC mode in which each statement is committed immediately as its own transaction."],
      ["How do you manage a transaction in JDBC?", "setAutoCommit(false), execute the statements, commit() on success and rollback() on failure."],
      ["What is a Savepoint?", "A marker inside a transaction that you can roll back to without undoing work done before it."],
      ["What are the transaction isolation levels?", "READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ and SERIALIZABLE."],
    ],
    ex: [
      "An order placement inserts an order, its items and decrements stock. Which statements belong in one transaction, and where would a savepoint help?",
      "All three belong in one transaction so a failure leaves no partial order. A savepoint after the order and items could allow an optional step, such as applying a loyalty bonus, to be rolled back alone.",
    ],
  }),

  lesson("ResultSetMetaData and DatabaseMetaData", {
    intro:
      "JDBC can describe data as well as fetch it. `ResultSetMetaData` reports the columns of a query result: names, types, sizes and nullability. `DatabaseMetaData` describes the database itself: product and version, supported features, and catalog objects such as tables, views, procedures, functions, indexes, sequences and triggers. This lesson uses both, as generic tools and ORMs do.",
    topics: [
      [
        "ResultSetMetaData",
        "`rs.getMetaData()` gives `getColumnCount()`, `getColumnName(i)` and `getColumnLabel(i)` (alias), `getColumnType(i)` (a `java.sql.Types` constant) and `getColumnTypeName(i)` (database type name), `getPrecision`, `getScale`, `isNullable`, `isAutoIncrement` and `getTableName`. Columns are numbered from 1.",
      ],
      [
        "DatabaseMetaData: the database",
        "`con.getMetaData()` gives `getDatabaseProductName()`, `getDatabaseProductVersion()`, `getDriverName()`, `getUserName()`, `getURL()`, and feature checks such as `supportsTransactions()`, `supportsBatchUpdates()` and `supportsResultSetType(...)`.",
      ],
      [
        "DatabaseMetaData: catalog objects",
        "Each method returns a ResultSet: `getTables(catalog, schema, pattern, new String[] {\"TABLE\"})` (use \"VIEW\" for views, \"SEQUENCE\" where supported), `getColumns`, `getPrimaryKeys`, `getIndexInfo` (indexes), `getProcedures`, `getFunctions` and `getImportedKeys` (foreign keys). Triggers and sequences are vendor specific: query the data dictionary (Oracle `USER_TRIGGERS`, `USER_SEQUENCES`).",
      ],
      [
        "Uses",
        "Generic table viewers and CSV exporters, schema documentation tools, migration and ORM tools (Hibernate validation), and code that must adapt to different databases.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (Statement st = con.createStatement();
                 ResultSet rs = st.executeQuery("SELECT id, name AS product_name, price, created_on FROM product")) {
                ResultSetMetaData md = rs.getMetaData();
                System.out.println("columns: " + md.getColumnCount());
                for (int i = 1; i <= md.getColumnCount(); i++) {
                    System.out.printf("  %-13s type %-10s jdbc %4d precision %2d scale %d nullable %s%n", md.getColumnLabel(i),
                            md.getColumnTypeName(i), md.getColumnType(i), md.getPrecision(i), md.getScale(i),
                            md.isNullable(i) == ResultSetMetaData.columnNullable ? "yes" : "no");
                }
            }

            DatabaseMetaData db = con.getMetaData();
            System.out.println("database: " + db.getDatabaseProductName() + ", user " + db.getUserName()
                    + ", batch updates " + db.supportsBatchUpdates() + ", transactions " + db.supportsTransactions());
            String schema = db.getUserName();
            print(db.getTables(null, schema, "%", new String[] {"TABLE"}), "TABLE_NAME", "tables");
            print(db.getTables(null, schema, "%", new String[] {"VIEW"}), "TABLE_NAME", "views");
            print(db.getProcedures(null, schema, "%"), "PROCEDURE_NAME", "procedures");
            print(db.getFunctions(null, schema, "%"), "FUNCTION_NAME", "functions");
            print(db.getIndexInfo(null, schema, "PRODUCT", false, false), "INDEX_NAME", "indexes on PRODUCT");
            print(db.getPrimaryKeys(null, schema, "PRODUCT"), "COLUMN_NAME", "primary key of PRODUCT");

            try (Statement st = con.createStatement()) {
                print(st.executeQuery("SELECT sequence_name FROM user_sequences ORDER BY 1"), "SEQUENCE_NAME", "sequences (data dictionary)");
                print(st.executeQuery("SELECT trigger_name FROM user_triggers ORDER BY 1"), "TRIGGER_NAME", "triggers (data dictionary)");
            }
        }
    }

    static void print(ResultSet rs, String column, String label) throws SQLException {
        StringBuilder sb = new StringBuilder();
        try (rs) {
            while (rs.next()) if (rs.getString(column) != null) sb.append(rs.getString(column)).append(" ");
        }
        System.out.println(label + ": " + sb.toString().trim());
    }
}`,
    mode: "compile",
    sample: String.raw`columns: 4
  ID            type NUMBER     jdbc    2 precision 10 scale 0 nullable no
  PRODUCT_NAME  type VARCHAR2   jdbc   12 precision 50 scale 0 nullable yes
  PRICE         type NUMBER     jdbc    2 precision 10 scale 2 nullable yes
  CREATED_ON    type DATE       jdbc   93 precision  0 scale 0 nullable yes
database: Oracle, user SHOP, batch updates true, transactions true
tables: AUDIT_LOG CUSTOMER EMPLOYEE PRODUCT
views: PRODUCT_SUMMARY
procedures: DOUBLE_IT EMPLOYEES_IN LOG_EVENT RAISE_SALARY
functions: ANNUAL_BONUS
indexes on PRODUCT: PK_PRODUCT IDX_PRODUCT_NAME
primary key of PRODUCT: ID
sequences (data dictionary): PRODUCT_SEQ
triggers (data dictionary): TRG_PRODUCT_AUDIT`,
    walk:
      "`ResultSetMetaData` describes the query's four columns: the alias `PRODUCT_NAME` comes from `getColumnLabel`, Oracle's NUMBER maps to JDBC type 2 (NUMERIC) with precision and scale, VARCHAR2 to 12 (VARCHAR), and DATE to 93 (TIMESTAMP, because Oracle dates include time).\n\n`DatabaseMetaData` reports the product, user and supported features, then lists catalog objects for the user's schema through standard methods: tables, views, procedures, functions, indexes and the primary key. Sequences and triggers have no portable JDBC method, so the program queries Oracle's data dictionary views `USER_SEQUENCES` and `USER_TRIGGERS`.",
    anim: [
      "Two kinds of metadata",
      [
        ["con", "Connection", "session"],
        ["dbmd", "DatabaseMetaData", "the database"],
        ["rs", "ResultSet", "query result"],
        ["rsmd", "ResultSetMD", "its columns"],
        ["cat", "tables, procs", "catalog"],
      ],
      [
        ["con", "dbmd", "getMetaData", "Connection.getMetaData describes the database, driver and features."],
        ["dbmd", "cat", "query", "Its methods list tables, views, procedures, functions, indexes and keys."],
        ["rs", "rsmd", "getMetaData", "ResultSet.getMetaData describes the columns of one particular result."],
        ["rsmd", "rs", "read", "Generic tools use it to print any result without knowing its columns."],
      ],
    ],
    mistakes: [
      "Passing schema or table names in the wrong case (Oracle stores unquoted names in upper case).",
      "Calling DatabaseMetaData methods in hot paths; they can be slow.",
      "Confusing column name and column label when aliases are used.",
    ],
    qa: [
      ["What is ResultSetMetaData?", "An object describing a ResultSet's columns: count, names, labels, types, sizes and nullability."],
      ["What is DatabaseMetaData?", "An object describing the database and driver, its capabilities, and its catalog of tables, procedures, functions, indexes and keys."],
      ["How do you list all tables with JDBC?", "con.getMetaData().getTables(null, schema, \"%\", new String[] {\"TABLE\"})."],
    ],
    ex: [
      "Write a generic method that prints any ResultSet as CSV with a header row.",
      "Read `ResultSetMetaData`, print the column labels joined by commas, then for each row print `rs.getString(i)` for i = 1..columnCount joined by commas (quoting values containing commas).",
    ],
  }),

  lesson("RowSet and JdbcRowSet: ResultSet vs RowSet", {
    intro:
      "A `RowSet` is a ResultSet that is also a JavaBean: it can be configured with properties, execute its own command, scroll, update and notify listeners. `JdbcRowSet` stays connected to the database; `CachedRowSet` works disconnected and can be serialized or passed between layers. This lesson uses both through `RowSetProvider` and compares ResultSet with RowSet.",
    topics: [
      [
        "Creating RowSets",
        "`RowSetFactory factory = RowSetProvider.newFactory();` then `factory.createJdbcRowSet()`, `createCachedRowSet()`, `createWebRowSet()` (XML), `createFilteredRowSet()` and `createJoinRowSet()`. Configure with `setUrl`, `setUsername`, `setPassword`, `setCommand(sql)` and `setInt(1, ...)` parameters, then `execute()`.",
      ],
      [
        "JdbcRowSet",
        "A connected wrapper around a ResultSet that is scrollable and updatable by default and supports listeners (`addRowSetListener`) for cursor moves and row changes. It keeps the connection open while in use.",
      ],
      [
        "CachedRowSet",
        "Fetches all rows into memory and disconnects, so it can be serialized, sent to another tier and modified offline; `acceptChanges()` reconnects and writes the changes back with optimistic conflict detection. Suitable only for small result sets.",
      ],
      [
        "ResultSet vs RowSet",
        "ResultSet: obtained from a Statement, always connected, forward-only by default, not serializable, not a JavaBean. RowSet: created and configured directly, can be disconnected (CachedRowSet), scrollable and updatable by default, serializable (disconnected types), JavaBean with properties and event listeners, and can be represented as XML (WebRowSet).",
      ],
    ],
    code: String.raw`import java.math.BigDecimal;
import java.sql.SQLException;
import javax.sql.RowSetEvent;
import javax.sql.RowSetListener;
import javax.sql.rowset.CachedRowSet;
import javax.sql.rowset.JdbcRowSet;
import javax.sql.rowset.RowSetFactory;
import javax.sql.rowset.RowSetProvider;

public class Main {
    static final String URL = "jdbc:mysql://localhost:3306/shop";

    public static void main(String[] args) throws Exception {
        RowSetFactory factory = RowSetProvider.newFactory();

        try (JdbcRowSet jrs = factory.createJdbcRowSet()) {
            jrs.setUrl(URL);
            jrs.setUsername("shop");
            jrs.setPassword("shop_pw");
            jrs.setCommand("SELECT id, name, price FROM product WHERE price < ?");
            jrs.setBigDecimal(1, new BigDecimal("100"));
            jrs.addRowSetListener(new RowSetListener() {
                public void rowSetChanged(RowSetEvent e) { System.out.println("  event: rowset executed"); }
                public void rowChanged(RowSetEvent e) { System.out.println("  event: row changed"); }
                public void cursorMoved(RowSetEvent e) { }
            });
            jrs.execute();
            System.out.println("JdbcRowSet (connected, scrollable by default):");
            jrs.last();
            System.out.println("  last row: " + jrs.getString("name") + ", row number " + jrs.getRow());
            jrs.first();
            jrs.updateBigDecimal("price", new BigDecimal("11.00"));
            jrs.updateRow();
        }

        CachedRowSet crs = factory.createCachedRowSet();
        crs.setUrl(URL);
        crs.setUsername("shop");
        crs.setPassword("shop_pw");
        crs.setCommand("SELECT id, name, price FROM product");
        crs.execute();                                        // fetches rows, then disconnects
        System.out.println("CachedRowSet holds " + crs.size() + " rows offline");

        java.io.ByteArrayOutputStream bytes = new java.io.ByteArrayOutputStream();
        try (java.io.ObjectOutputStream out = new java.io.ObjectOutputStream(bytes)) { out.writeObject(crs); }   // serializable
        System.out.println("serialized for another tier: " + (bytes.size() > 0));

        crs.absolute(3);
        crs.updateString("name", "Ink bottle (large)");
        crs.updateRow();                                      // changed in memory only
        crs.acceptChanges();                                  // reconnect and write back
        System.out.println("acceptChanges wrote the offline edit back to the database");
        crs.close();
    }
}`,
    mode: "compile",
    sample: String.raw`  event: rowset executed
JdbcRowSet (connected, scrollable by default):
  last row: Ink bottle, row number 3
  event: row changed
CachedRowSet holds 3 rows offline
serialized for another tier: true
acceptChanges wrote the offline edit back to the database`,
    walk:
      "`RowSetProvider.newFactory()` creates RowSets without any Statement. The `JdbcRowSet` is configured like a JavaBean (URL, user, password, command and a parameter), notifies its listener when executed and when a row changes, and is scrollable and updatable by default, so `last()` and `updateRow()` work without special statement options.\n\nThe `CachedRowSet` loads all three rows and disconnects. It can be serialized and sent to another tier, edited in memory, and `acceptChanges()` later reconnects and writes the edit to the database, checking that the row was not changed by someone else in the meantime.",
    anim: [
      "Connected vs disconnected",
      [
        ["db", "database", "product table"],
        ["jrs", "JdbcRowSet", "stays connected"],
        ["crs", "CachedRowSet", "rows in memory"],
        ["tier", "other tier", "serialized"],
        ["accept", "acceptChanges", "write back"],
      ],
      [
        ["jrs", "db", "live", "JdbcRowSet keeps its connection open while you read and update."],
        ["db", "crs", "fetch", "CachedRowSet copies all rows into memory and disconnects."],
        ["crs", "tier", "send", "Being serializable, it can travel to another tier and be edited offline."],
        ["accept", "db", "sync", "acceptChanges reconnects and writes the offline edits back."],
      ],
    ],
    mistakes: [
      "Using CachedRowSet for large result sets (it loads everything into memory).",
      "Assuming RowSets remove the need for transactions and conflict handling.",
    ],
    qa: [
      ["What is a RowSet?", "A JavaBean-style extension of ResultSet that can be configured with properties, executed directly, scrolled, updated and, for some types, used disconnected."],
      ["What is the difference between JdbcRowSet and CachedRowSet?", "JdbcRowSet stays connected to the database; CachedRowSet caches rows in memory, works disconnected and is serializable."],
      ["What is the difference between ResultSet and RowSet?", "A ResultSet comes from a Statement and is always connected and not serializable; a RowSet is a configurable JavaBean, scrollable and updatable by default, and can be disconnected and serialized."],
    ],
    ex: [
      "Which RowSet would you use to send a small lookup table to a Swing client that edits it offline and syncs later?",
      "CachedRowSet: it caches the rows, can be serialized to the client, edited without a connection, and acceptChanges synchronises the edits.",
    ],
  }),

  lesson("Storing Images (BLOB) and Files (CLOB) in a Database", {
    intro:
      "Databases can store binary data such as images in BLOB columns and large text such as documents in CLOB columns. JDBC streams these values with `setBinaryStream`/`getBlob` and `setCharacterStream`/`getClob` so they never need to fit in a single String or byte array. This lesson stores and retrieves an image and a text file, and compares BLOB, CLOB and NCLOB in Oracle.",
    topics: [
      [
        "Storing an image in a BLOB",
        "`ps.setBinaryStream(index, inputStream, length)` streams a file into a BLOB column; `setBlob(index, inputStream)` or `setBytes` (small data) also work.",
      ],
      [
        "Retrieving an image from a BLOB",
        "`Blob blob = rs.getBlob(\"photo\")`, then `blob.getBinaryStream()` to copy it to a file, or `blob.getBytes(1, (int) blob.length())` for small values. `rs.getBinaryStream(\"photo\")` skips the Blob object. Call `blob.free()` when finished.",
      ],
      [
        "Storing and retrieving a text file in a CLOB",
        "`ps.setCharacterStream(index, reader, length)` writes text; `Clob clob = rs.getClob(\"content\")`, then `clob.getCharacterStream()` or `clob.getSubString(1, (int) clob.length())` reads it back. `rs.getCharacterStream` streams directly.",
      ],
      [
        "BLOB vs CLOB vs NCLOB (Oracle)",
        "BLOB stores raw bytes (images, PDFs, ZIP files) with no character set. CLOB stores character data in the database character set. NCLOB stores character data in the national character set (Unicode), for multilingual text when the database character set is not Unicode. All can hold up to (4 GB - 1) x block size in Oracle. Many systems store large files in object storage and keep only a path in the database.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;

public class Main {
    static final String URL = "jdbc:oracle:thin:@localhost:1521:XE";
    /* CREATE TABLE document (id NUMBER PRIMARY KEY, photo BLOB, content CLOB) */

    public static void main(String[] args) throws Exception {
        Path dir = Files.createTempDirectory("lob");
        Path image = dir.resolve("logo.png");
        Files.write(image, new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10, 0, 0, 0, 13});   // PNG header bytes
        Path text = dir.resolve("terms.txt");
        Files.writeString(text, "Terms and conditions\n".repeat(500), StandardCharsets.UTF_8);

        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO document (id, photo, content) VALUES (?, ?, ?)");
                 InputStream imageIn = Files.newInputStream(image);
                 Reader textIn = Files.newBufferedReader(text, StandardCharsets.UTF_8)) {
                ps.setInt(1, 1);
                ps.setBinaryStream(2, imageIn, Files.size(image));                 // BLOB
                ps.setCharacterStream(3, textIn, Files.readString(text).length());  // CLOB
                System.out.println("inserted rows: " + ps.executeUpdate());
            }

            try (PreparedStatement ps = con.prepareStatement("SELECT photo, content FROM document WHERE id = ?")) {
                ps.setInt(1, 1);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    Blob blob = rs.getBlob("photo");
                    Path restoredImage = dir.resolve("logo-restored.png");
                    try (InputStream in = blob.getBinaryStream()) { Files.copy(in, restoredImage); }
                    System.out.println("BLOB length " + blob.length() + " bytes, restored file identical: " + (Files.mismatch(image, restoredImage) == -1));
                    blob.free();

                    Clob clob = rs.getClob("content");
                    Path restoredText = dir.resolve("terms-restored.txt");
                    try (Reader in = clob.getCharacterStream(); Writer out = Files.newBufferedWriter(restoredText, StandardCharsets.UTF_8)) {
                        in.transferTo(out);
                    }
                    System.out.println("CLOB length " + clob.length() + " chars, first line: " + clob.getSubString(1, 20)
                            + ", restored file identical: " + (Files.mismatch(text, restoredText) == -1));
                    clob.free();
                }
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`inserted rows: 1
BLOB length 12 bytes, restored file identical: true
CLOB length 10500 chars, first line: Terms and conditions, restored file identical: true`,
    walk:
      "The program creates a small image file (PNG header bytes) and a 10,500-character text file. The INSERT streams the image into the BLOB column with `setBinaryStream` and the text into the CLOB column with `setCharacterStream`, without loading either into a String or byte array.\n\nReading back, `getBlob` returns a `Blob` whose binary stream is copied to a new file, and `getClob` returns a `Clob` whose character stream is copied to another file; `getSubString(1, 20)` reads just the first 20 characters. `Files.mismatch` confirms both restored files are identical to the originals, and `free()` releases the LOB resources.",
    anim: [
      "Streaming LOBs",
      [
        ["img", "logo.png", "bytes"],
        ["bin", "setBinaryStream", "BLOB in"],
        ["table", "document row", "BLOB + CLOB"],
        ["get", "getBlob/getClob", "LOB handles"],
        ["out", "restored files", "identical"],
      ],
      [
        ["img", "bin", "stream", "The image is streamed into the statement instead of read fully into memory."],
        ["bin", "table", "insert", "The database stores raw bytes in the BLOB and text in the CLOB column."],
        ["table", "get", "select", "Querying returns lightweight Blob and Clob handles."],
        ["get", "out", "copy", "Their streams are copied back into files, byte for byte identical."],
      ],
    ],
    mistakes: [
      "Reading huge LOBs with getBytes or getString, exhausting memory.",
      "Storing text in BLOBs (losing the character set) or binary data in CLOBs (corrupting it).",
      "Forgetting `free()` on LOBs in long loops, holding database resources.",
    ],
    qa: [
      ["How do you store an image in a database with JDBC?", "Use a BLOB column and PreparedStatement.setBinaryStream (or setBlob/setBytes)."],
      ["How do you read a CLOB?", "rs.getClob(column) then getCharacterStream() or getSubString(1, length), or rs.getCharacterStream directly."],
      ["What is the difference between BLOB and CLOB?", "BLOB holds raw binary data without a character set; CLOB holds character data in the database character set (NCLOB in the national/Unicode set)."],
    ],
    ex: [
      "Which column type and setter would you use for storing uploaded PDF invoices, and why might you store them outside the database instead?",
      "A BLOB with setBinaryStream. Storing them in object storage (or files) with only a path in the database keeps backups small and lets a CDN serve them.",
    ],
  }),

  lesson("Inserting and Reading Dates and Timestamps", {
    intro:
      "Dates are where many JDBC bugs hide: time zones, lost time portions and the confusing `java.sql.Date`. This lesson inserts and reads DATE, TIMESTAMP and TIMESTAMP WITH TIME ZONE values using the legacy `java.sql.Date`/`java.sql.Timestamp` classes and the modern JDBC 4.2 way with `LocalDate`, `LocalDateTime` and `OffsetDateTime` via `setObject`/`getObject`.",
    topics: [
      [
        "java.sql.Date, Time and Timestamp",
        "Legacy wrappers around `java.util.Date`: `java.sql.Date` (date only), `java.sql.Time` (time only) and `java.sql.Timestamp` (date and time with nanoseconds). Use `ps.setDate`, `setTimestamp`, `rs.getDate`, `getTimestamp`. They are interpreted in the JVM's default time zone unless you pass a Calendar, a frequent source of shifts.",
      ],
      [
        "The modern way (JDBC 4.2)",
        "`ps.setObject(i, LocalDate.of(2026, 11, 19))`, `setObject(i, LocalDateTime)` and `setObject(i, OffsetDateTime)`; read with `rs.getObject(\"col\", LocalDate.class)` and so on. No time zone conversion surprises for local types, and precise instants with offsets.",
      ],
      [
        "Converting",
        "`java.sql.Date.valueOf(localDate)` and `date.toLocalDate()`, `Timestamp.valueOf(localDateTime)` and `ts.toLocalDateTime()`, `Timestamp.from(instant)` and `ts.toInstant()`.",
      ],
      [
        "Column types",
        "DATE (Oracle DATE also stores time to the second), TIMESTAMP (fractional seconds), TIMESTAMP WITH TIME ZONE (stores the offset or zone) and, in PostgreSQL, `timestamptz` (stores an instant in UTC). Store instants (events, audit times) in UTC or with a time zone; store calendar dates (birthdays) as DATE.",
      ],
      [
        "Database-side timestamps",
        "Using `CURRENT_TIMESTAMP` or a column DEFAULT in SQL gives the database server's time, consistent across application servers; using Java's time requires synchronised clocks.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.time.*;

public class Main {
    static final String URL = "jdbc:postgresql://localhost:5432/shop";
    /* CREATE TABLE event (id INT PRIMARY KEY, event_date DATE, starts_at TIMESTAMP, logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP) */

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO event (id, event_date, starts_at, logged_at) VALUES (?, ?, ?, ?)")) {
                ps.setInt(1, 1);                                                          // legacy types
                ps.setDate(2, java.sql.Date.valueOf("2026-11-19"));
                ps.setTimestamp(3, Timestamp.valueOf("2026-11-19 14:30:00.250"));
                ps.setTimestamp(4, Timestamp.from(Instant.parse("2026-11-19T09:00:00Z")));
                ps.executeUpdate();

                ps.setInt(1, 2);                                                          // JDBC 4.2 java.time
                ps.setObject(2, LocalDate.of(2026, 12, 25));
                ps.setObject(3, LocalDateTime.of(2026, 12, 25, 10, 0));
                ps.setObject(4, OffsetDateTime.of(2026, 12, 25, 10, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30)));
                ps.executeUpdate();
            }

            try (Statement st = con.createStatement()) {
                st.executeUpdate("INSERT INTO event (id, event_date, starts_at) VALUES (3, CURRENT_DATE, CURRENT_TIMESTAMP)");   // DB time
            }

            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT * FROM event WHERE id < 3 ORDER BY id")) {
                while (rs.next()) {
                    LocalDate date = rs.getObject("event_date", LocalDate.class);
                    LocalDateTime start = rs.getObject("starts_at", LocalDateTime.class);
                    OffsetDateTime logged = rs.getObject("logged_at", OffsetDateTime.class);
                    System.out.println("event " + rs.getInt("id") + ": date " + date + ", starts " + start + ", logged (UTC) " + logged
                            + ", same instant as IST input: " + logged.toInstant());
                }
            }
            try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT starts_at FROM event WHERE id = 1")) {
                rs.next();
                Timestamp ts = rs.getTimestamp(1);
                System.out.println("legacy Timestamp keeps nanos: " + ts.getNanos() + ", toLocalDateTime " + ts.toLocalDateTime());
            }
        }
    }
}`,
    mode: "compile",
    sample: String.raw`event 1: date 2026-11-19, starts 2026-11-19T14:30:00.250, logged (UTC) 2026-11-19T09:00Z, same instant as IST input: 2026-11-19T09:00:00Z
event 2: date 2026-12-25, starts 2026-12-25T10:00, logged (UTC) 2026-12-25T04:30Z, same instant as IST input: 2026-12-25T04:30:00Z
legacy Timestamp keeps nanos: 250000000, toLocalDateTime 2026-11-19T14:30:00.250`,
    walk:
      "Row 1 is inserted with the legacy classes: `java.sql.Date.valueOf`, `Timestamp.valueOf` with milliseconds and `Timestamp.from(instant)`. Row 2 uses the JDBC 4.2 way, passing `LocalDate`, `LocalDateTime` and an `OffsetDateTime` at +05:30 straight to `setObject`. Row 3 lets the database fill in its own current date and time.\n\nReading with `getObject(col, LocalDate.class)` and friends returns java.time values. The `timestamptz` column normalises to UTC: 10:00 at +05:30 comes back as 04:30Z, the same instant. The legacy `Timestamp` keeps fractional seconds as nanoseconds and converts with `toLocalDateTime()`.",
    anim: [
      "From Java to SQL types",
      [
        ["ld", "LocalDate", "2026-12-25"],
        ["ldt", "LocalDateTime", "10:00 local"],
        ["odt", "OffsetDateTime", "10:00 +05:30"],
        ["setobj", "setObject()", "JDBC 4.2"],
        ["cols", "DATE / TS / TSTZ", "columns"],
      ],
      [
        ["ld", "setobj", "date", "A LocalDate maps to a DATE column with no time zone involved."],
        ["ldt", "setobj", "local", "A LocalDateTime maps to TIMESTAMP: a wall-clock time without zone."],
        ["odt", "setobj", "instant", "An OffsetDateTime maps to TIMESTAMP WITH TIME ZONE: a precise instant."],
        ["setobj", "cols", "store", "Reading back with getObject returns the same java.time types."],
      ],
    ],
    mistakes: [
      "Using `java.util.Date` for date-only values and getting time zone shifts around midnight.",
      "Storing event times without a zone and comparing them across servers in different zones.",
      "Converting through Strings instead of using typed setters and getters.",
    ],
    qa: [
      ["How do you insert a LocalDate with JDBC?", "ps.setObject(index, localDate) with a JDBC 4.2 driver (or setDate(index, java.sql.Date.valueOf(localDate)))."],
      ["What is the difference between java.sql.Date and java.sql.Timestamp?", "java.sql.Date represents a date only; Timestamp represents date and time with nanosecond precision."],
      ["Which column type should store an event instant?", "TIMESTAMP WITH TIME ZONE (timestamptz) or a UTC TIMESTAMP, mapped to Instant or OffsetDateTime in Java."],
    ],
    ex: [
      "Find all events starting in December 2026 using PreparedStatement and java.time.",
      "`SELECT * FROM event WHERE starts_at >= ? AND starts_at < ?` with `setObject(1, LocalDateTime.of(2026,12,1,0,0))` and `setObject(2, LocalDateTime.of(2027,1,1,0,0))`.",
    ],
  }),

  lesson("Pagination: Reading Large Tables and Fetching the Top N Records", {
    intro:
      "Loading a million-row table into memory at once is slow and may crash the application. This lesson shows how to fetch the top N records, page through results with OFFSET/FETCH and with keyset (seek) pagination, and stream all records from a large table efficiently with the fetch size.",
    topics: [
      [
        "Top N records",
        "Standard SQL: `ORDER BY salary DESC FETCH FIRST 5 ROWS ONLY` (Oracle 12c+, PostgreSQL, SQL Server 2012+ with OFFSET). MySQL/PostgreSQL: `LIMIT 5`. Older Oracle: `SELECT * FROM (SELECT ... ORDER BY ...) WHERE ROWNUM <= 5`. SQL Server: `SELECT TOP 5`. `Statement.setMaxRows(5)` limits rows client-side but the database may still do more work.",
      ],
      [
        "OFFSET pagination",
        "`ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY` (or `LIMIT ? OFFSET ?`). Simple and supports jumping to page N, but the database still scans and discards the offset rows, so deep pages get slow, and rows can be skipped or duplicated if data changes between requests.",
      ],
      [
        "Keyset (seek) pagination",
        "Remember the last key of the previous page and ask for `WHERE id > ? ORDER BY id FETCH FIRST n ROWS ONLY`. It uses the index directly, so every page is fast and stable, but you can only go to the next or previous page.",
      ],
      [
        "Reading all records from a large table",
        "Use a forward-only, read-only ResultSet and set `st.setFetchSize(n)` (for example 500) so the driver fetches rows in chunks instead of loading everything (Oracle's default is only 10 rows per round trip). PostgreSQL streams only with auto-commit off and a fetch size; MySQL needs `useCursorFetch=true` or `Integer.MIN_VALUE` streaming. Process each row and do not collect them all into a list.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String URL = "jdbc:postgresql://localhost:5432/shop";
    /* table "orders" with 1,000,000 rows: id (primary key), customer, amount */

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            try (PreparedStatement ps = con.prepareStatement("SELECT id, amount FROM orders ORDER BY amount DESC, id FETCH FIRST ? ROWS ONLY")) {
                ps.setInt(1, 3);
                try (ResultSet rs = ps.executeQuery()) {
                    System.out.print("top 3 orders by amount:");
                    while (rs.next()) System.out.print(" #" + rs.getLong("id") + "=" + rs.getBigDecimal("amount"));
                    System.out.println();
                }
            }

            int pageSize = 5, page = 3;
            try (PreparedStatement ps = con.prepareStatement("SELECT id FROM orders ORDER BY id OFFSET ? ROWS FETCH NEXT ? ROWS ONLY")) {
                ps.setInt(1, (page - 1) * pageSize);
                ps.setInt(2, pageSize);
                System.out.println("OFFSET page " + page + ": " + ids(ps.executeQuery()));
            }

            long lastSeenId = 0;
            try (PreparedStatement ps = con.prepareStatement("SELECT id FROM orders WHERE id > ? ORDER BY id FETCH FIRST ? ROWS ONLY")) {
                for (int p = 1; p <= 3; p++) {
                    ps.setLong(1, lastSeenId);
                    ps.setInt(2, pageSize);
                    String result = ids(ps.executeQuery());
                    System.out.println("keyset page " + p + " after id " + lastSeenId + ": " + result);
                    lastSeenId = Long.parseLong(result.substring(result.lastIndexOf(' ') + 1));
                }
            }

            con.setAutoCommit(false);                                    // PostgreSQL streams only inside a transaction
            try (Statement st = con.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
                st.setFetchSize(1000);                                   // 1000 rows per round trip
                long rows = 0;
                java.math.BigDecimal total = java.math.BigDecimal.ZERO;
                try (ResultSet rs = st.executeQuery("SELECT amount FROM orders")) {
                    while (rs.next()) { rows++; total = total.add(rs.getBigDecimal(1)); }   // process, do not collect
                }
                System.out.println("streamed " + rows + " rows with fetch size 1000, total amount " + total);
            }
            con.commit();
        }
    }

    static String ids(ResultSet rs) throws SQLException {
        StringBuilder sb = new StringBuilder();
        try (rs) { while (rs.next()) sb.append(" ").append(rs.getLong(1)); }
        return sb.toString().trim();
    }
}`,
    mode: "compile",
    sample: String.raw`top 3 orders by amount: #48211=99999.00 #902114=99998.50 #12873=99997.25
OFFSET page 3: 11 12 13 14 15
keyset page 1 after id 0: 1 2 3 4 5
keyset page 2 after id 5: 6 7 8 9 10
keyset page 3 after id 10: 11 12 13 14 15
streamed 1000000 rows with fetch size 1000, total amount 50012345678.90`,
    walk:
      "`FETCH FIRST ? ROWS ONLY` returns the three largest orders, ordered by amount with the id as a tie-breaker. OFFSET pagination computes page 3 by skipping 10 rows; keyset pagination instead remembers the last id of each page and asks for ids greater than it, which uses the primary key index directly and stays fast however deep you go (page 3 gives the same ids here).\n\nTo read the whole million-row table, the program uses a forward-only, read-only statement with a fetch size of 1,000 and auto-commit off (required for PostgreSQL to use a cursor), and aggregates rows as they arrive instead of collecting them, keeping memory use flat.",
    anim: [
      "OFFSET vs keyset",
      [
        ["req", "page 1000", "request"],
        ["offset", "OFFSET 9990", "scan + discard"],
        ["slow", "slow deep pages", "O(offset)"],
        ["keyset", "WHERE id > last", "seek"],
        ["fast", "index lookup", "always fast"],
      ],
      [
        ["req", "offset", "OFFSET", "OFFSET pagination asks the database to skip the earlier rows."],
        ["offset", "slow", "cost", "The skipped rows are still read and thrown away, so deep pages get slower."],
        ["req", "keyset", "keyset", "Keyset pagination passes the last id seen on the previous page."],
        ["keyset", "fast", "seek", "The index jumps straight to that id, so every page costs the same."],
      ],
    ],
    mistakes: [
      "Paginating without a deterministic ORDER BY, so pages overlap or skip rows.",
      "Using large OFFSETs on big tables.",
      "Loading an entire large table into a List instead of streaming it with a fetch size.",
    ],
    qa: [
      ["How do you fetch the top N records?", "ORDER BY ... FETCH FIRST n ROWS ONLY (or LIMIT n, TOP n, or ROWNUM in old Oracle)."],
      ["What is the difference between OFFSET and keyset pagination?", "OFFSET skips n rows and gets slower for deep pages; keyset filters by the last key seen and uses the index, staying fast and stable."],
      ["What does setFetchSize do?", "It hints how many rows the driver fetches per round trip, letting you stream large results without loading them all."],
    ],
    ex: [
      "A mobile app shows an infinite scroll of the newest posts. Which pagination style fits, and what is the WHERE clause?",
      "Keyset pagination on (created_at, id): `WHERE (created_at, id) < (?, ?) ORDER BY created_at DESC, id DESC FETCH FIRST 20 ROWS ONLY`, passing the last post's values.",
    ],
  }),

  lesson("Connection Pooling and JDBC Best Practices", {
    intro:
      "Opening a database connection takes tens of milliseconds and server resources, so applications reuse connections from a pool. This lesson explains connection pooling and `DataSource`, configures HikariCP (the most common pool), and lists JDBC best practices that keep database code fast, safe and leak-free.",
    topics: [
      [
        "Why pool connections",
        "A physical connection needs a TCP handshake, authentication and session setup. A pool keeps a set of open connections; `getConnection()` borrows one and `close()` returns it to the pool instead of closing it. This cuts latency and bounds the load on the database.",
      ],
      [
        "DataSource",
        "`javax.sql.DataSource` is the standard factory for connections, configured once (URL, credentials, pool settings) and injected where needed. Pool implementations (HikariCP, Apache DBCP, Tomcat JDBC, c3p0, Oracle UCP) implement it, and frameworks such as Spring Boot create a HikariCP DataSource automatically.",
      ],
      [
        "Pool settings",
        "Maximum pool size (often around 10 to 20, much smaller than people expect; a common starting point is cores * 2 + spindles), minimum idle connections, connection timeout (how long to wait for a free connection), idle timeout, max lifetime (shorter than the database's own timeout) and leak detection threshold.",
      ],
      [
        "Best practices",
        "Always close ResultSet, Statement and Connection with try-with-resources. Use PreparedStatement with parameters. Select only the columns you need and filter in SQL. Use batching for bulk writes and transactions for multi-statement work. Use appropriate fetch sizes. Do not hold connections during slow non-database work. Externalise credentials. Handle SQLException with context and use the SQLState. Index columns used in WHERE and JOIN clauses.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.concurrent.*;
import javax.sql.DataSource;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class Main {
    static DataSource createPool() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:5432/shop");
        config.setUsername(System.getenv().getOrDefault("DB_USER", "shop"));
        config.setPassword(System.getenv().getOrDefault("DB_PASSWORD", "shop_pw"));
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(3_000);          // wait at most 3 s for a free connection
        config.setMaxLifetime(30 * 60_000);
        config.setLeakDetectionThreshold(10_000);    // log connections held longer than 10 s
        return new HikariDataSource(config);
    }

    static String findName(DataSource ds, int id) throws SQLException {
        try (Connection con = ds.getConnection();                          // borrowed from the pool
             PreparedStatement ps = con.prepareStatement("SELECT name FROM customer WHERE id = ?")) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getString(1) : null;
            }
        }                                                                   // close() returns it to the pool
    }

    public static void main(String[] args) throws Exception {
        long start = System.nanoTime();
        try (Connection raw = DriverManager.getConnection("jdbc:postgresql://localhost:5432/shop", "shop", "shop_pw")) {
            System.out.println("one physical connection took about " + (System.nanoTime() - start) / 1_000_000 + " ms");
        }

        HikariDataSource ds = (HikariDataSource) createPool();
        findName(ds, 1);                                                    // warm up
        start = System.nanoTime();
        for (int i = 0; i < 1000; i++) findName(ds, 1 + i % 3);
        System.out.println("1000 pooled queries took " + (System.nanoTime() - start) / 1_000_000 + " ms in total");

        ExecutorService pool = Executors.newFixedThreadPool(50);
        for (int i = 0; i < 200; i++) pool.submit(() -> findName(ds, 1));
        pool.shutdown();
        pool.awaitTermination(30, TimeUnit.SECONDS);
        System.out.println("50 threads shared " + ds.getMaximumPoolSize() + " connections; active now " + ds.getHikariPoolMXBean().getActiveConnections()
                + ", idle " + ds.getHikariPoolMXBean().getIdleConnections());
        ds.close();
    }
}`,
    mode: "show",
    sample: String.raw`one physical connection took about 48 ms
1000 pooled queries took 310 ms in total
50 threads shared 10 connections; active now 0, idle 10`,
    walk:
      "Opening one physical connection with `DriverManager` takes tens of milliseconds. `createPool` configures HikariCP with a maximum of 10 connections, reading credentials from environment variables, with timeouts and leak detection. `findName` borrows a connection with `ds.getConnection()`, and `close()` at the end of try-with-resources returns it to the pool.\n\nA thousand pooled queries take about as long as a handful of fresh connections would. Fifty threads issuing 200 queries share only 10 connections; extra threads wait briefly for a free one, which protects the database. This program needs the HikariCP and PostgreSQL JARs on the classpath, so the output is a sample run.",
    anim: [
      "Borrow and return",
      [
        ["thread", "request thread", "needs DB"],
        ["pool", "Hikari pool", "10 connections"],
        ["con", "connection", "borrowed"],
        ["db", "database", "query"],
        ["back", "close()", "returned"],
      ],
      [
        ["thread", "pool", "getConnection", "A request asks the pool for a connection instead of opening a new one."],
        ["pool", "con", "lend", "An idle, already-open connection is handed out immediately."],
        ["con", "db", "query", "The query runs over the existing session: no handshake or login."],
        ["back", "pool", "return", "close() gives the connection back to the pool for the next request."],
      ],
    ],
    mistakes: [
      "Creating a new DataSource or pool per request.",
      "Setting the pool size to hundreds, overwhelming the database with concurrent sessions.",
      "Holding a connection while calling slow external services.",
      "Leaking connections by not closing them on error paths.",
    ],
    qa: [
      ["What is connection pooling?", "Keeping a set of open database connections that are reused: getConnection borrows one and close returns it."],
      ["What is the difference between DriverManager and DataSource?", "DriverManager opens a new physical connection each time; a DataSource is a configurable factory, usually backed by a pool, and is the preferred approach in applications."],
      ["What are JDBC best practices?", "Use pooling, try-with-resources, PreparedStatement, batching, transactions, appropriate fetch sizes, select only needed data, externalise credentials and handle SQLException with context."],
    ],
    ex: [
      "Your app logs \"Connection is not available, request timed out after 3000ms\". What are the likely causes?",
      "Connections are leaking (not closed), held too long (slow work while holding them), or the pool is too small for the load or the database is slow; enable leak detection and check query times before raising the pool size.",
    ],
  }),

  lesson("Common JDBC Errors and How to Fix Them", {
    intro:
      "JDBC failures surface as `SQLException`s with vendor codes and messages that are cryptic until you have seen them. This lesson explains SQLException itself and the most common errors: ORA-12560 TNS protocol adapter error, \"Exhausted Resultset\", ORA-01000 maximum open cursors exceeded, \"Invalid operation for forward only resultset\", invalid column name or index, ORA-01017 invalid username/password, ORA-12505 listener does not know of SID, ORA-17008 closed connection and ORA-00904 invalid identifier.",
    topics: [
      [
        "SQLException",
        "The checked exception for all database errors. `getMessage()`, `getErrorCode()` (vendor code, such as 1017 for ORA-01017), `getSQLState()` (standard five-character code: class 08 connection errors, 23 constraint violations, 42 syntax/access errors) and `getNextException()` for chained errors. Subclasses include `SQLIntegrityConstraintViolationException`, `SQLTimeoutException` and `SQLTransientConnectionException`.",
      ],
      [
        "Connection errors: ORA-12560, ORA-12505, ORA-01017, ORA-17008",
        "ORA-12560 (TNS: protocol adapter error): the Oracle service or listener is not running, or the local connection configuration is wrong; start the service and check the host and port. ORA-12505 (listener does not currently know of SID): wrong SID or service name in the URL; use `@//host:1521/serviceName` if you have a service name. ORA-01017 (invalid username/password; logon denied): wrong credentials or case-sensitive password. ORA-17008 (Closed Connection): using a connection after it was closed or timed out; get a fresh one from the pool and validate idle connections.",
      ],
      [
        "Cursor errors: Exhausted Resultset, forward-only, ORA-01000",
        "\"Exhausted Resultset\": reading a column after `next()` returned false (or before calling it); always check `next()`. \"Invalid operation for forward only resultset\": calling `previous`, `first`, `absolute` on a default ResultSet; request a scrollable type. ORA-01000 (maximum open cursors exceeded): Statements or ResultSets are not being closed, usually inside a loop; close them with try-with-resources.",
      ],
      [
        "Column errors: invalid column name or index, ORA-00904",
        "\"Invalid column name\" or \"Invalid column index\": `rs.getString(\"nme\")` with a misspelled or unselected column, or `getString(0)` (indexes start at 1), or a placeholder index that does not exist in `ps.setX`. ORA-00904 (invalid identifier): the SQL references a column that does not exist, often a typo or a case-sensitive quoted name.",
      ],
      [
        "Diagnosing",
        "Log the SQL (without sensitive values), the error code and the SQLState. Reproduce the statement in SQL Developer or psql. Check the URL, credentials and network with a minimal connection test, and inspect open cursors (`v$open_cursor` in Oracle) when leaks are suspected.",
      ],
    ],
    code: String.raw`import java.sql.*;

public class Main {
    static final String GOOD = "jdbc:oracle:thin:@localhost:1521:XE";

    static void attempt(String label, SqlAction action) {
        try {
            action.run();
            System.out.println(label + " -> ok");
        } catch (SQLException e) {
            System.out.println(label + " -> ORA/code " + e.getErrorCode() + ", SQLState " + e.getSQLState() + ": " + e.getMessage().lines().findFirst().orElse(""));
        }
    }
    interface SqlAction { void run() throws SQLException; }

    public static void main(String[] args) throws SQLException {
        attempt("wrong password", () -> DriverManager.getConnection(GOOD, "shop", "wrong").close());
        attempt("wrong SID", () -> DriverManager.getConnection("jdbc:oracle:thin:@localhost:1521:NOPE", "shop", "shop_pw").close());

        try (Connection con = DriverManager.getConnection(GOOD, "shop", "shop_pw")) {
            attempt("invalid identifier", () -> { try (Statement st = con.createStatement()) { st.executeQuery("SELECT nmae FROM product"); } });
            attempt("exhausted resultset", () -> {
                try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT name FROM product WHERE id = 1")) {
                    rs.next();
                    rs.next();                                   // no second row
                    rs.getString(1);
                }
            });
            attempt("forward only previous()", () -> {
                try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT name FROM product")) { rs.next(); rs.previous(); }
            });
            attempt("invalid column index 0", () -> {
                try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT name FROM product")) { rs.next(); rs.getString(0); }
            });
            attempt("invalid column name", () -> {
                try (Statement st = con.createStatement(); ResultSet rs = st.executeQuery("SELECT name FROM product")) { rs.next(); rs.getString("price"); }
            });
            attempt("unique constraint", () -> {
                try (Statement st = con.createStatement()) { st.executeUpdate("INSERT INTO product (id, name, price) VALUES (1, 'Dup', 1)"); }
            });
        }

        Connection closed = DriverManager.getConnection(GOOD, "shop", "shop_pw");
        closed.close();
        attempt("closed connection", () -> closed.createStatement());

        attempt("cursor leak (statements never closed)", () -> {
            try (Connection con = DriverManager.getConnection(GOOD, "shop", "shop_pw")) {
                for (int i = 0; i < 400; i++) con.createStatement().executeQuery("SELECT 1 FROM dual");   // leak on purpose
            }
        });
    }
}`,
    mode: "compile",
    sample: String.raw`wrong password -> ORA/code 1017, SQLState 72000: ORA-01017: invalid username/password; logon denied
wrong SID -> ORA/code 12505, SQLState 66000: Listener refused the connection with the following error: ORA-12505, TNS:listener does not currently know of SID given in connect descriptor
invalid identifier -> ORA/code 904, SQLState 42000: ORA-00904: "NMAE": invalid identifier
exhausted resultset -> ORA/code 17011, SQLState 99999: Exhausted Resultset
forward only previous() -> ORA/code 17075, SQLState 99999: Invalid operation for forward only resultset : previous
invalid column index 0 -> ORA/code 17003, SQLState 99999: Invalid column index
invalid column name -> ORA/code 17006, SQLState 99999: Invalid column name
unique constraint -> ORA/code 1, SQLState 23000: ORA-00001: unique constraint (SHOP.PK_PRODUCT) violated
closed connection -> ORA/code 17008, SQLState 08003: Closed Connection
cursor leak (statements never closed) -> ORA/code 1000, SQLState 72000: ORA-01000: maximum open cursors exceeded`,
    walk:
      "`attempt` runs one deliberately broken JDBC operation and prints the vendor error code, the SQLState and the first message line. Wrong credentials give ORA-01017 and a wrong SID ORA-12505. Selecting a misspelled column gives ORA-00904. Reading after `next()` returned false is \"Exhausted Resultset\", `previous()` on a default ResultSet is the forward-only error, index 0 and an unselected column name are invalid column errors, and a duplicate primary key is ORA-00001 with SQLState 23000.\n\nUsing a closed connection gives ORA-17008 (SQLState 08003), and creating 400 statements without closing them exceeds the session's `open_cursors` limit with ORA-01000. ORA-12560 does not appear because it is a client-side configuration error when the service is not running. The output is a sample run against Oracle XE.",
    anim: [
      "Diagnosing a SQLException",
      [
        ["ex", "SQLException", "caught"],
        ["code", "getErrorCode()", "vendor: 1017"],
        ["state", "getSQLState()", "class 08, 23, 42"],
        ["msg", "message", "ORA-01017 ..."],
        ["fix", "fix", "credentials"],
      ],
      [
        ["ex", "code", "read", "The vendor error code pinpoints the exact database error (1017 = ORA-01017)."],
        ["ex", "state", "read", "The SQLState class groups errors portably: 08 connection, 23 constraint, 42 syntax."],
        ["ex", "msg", "read", "The message adds detail, such as the offending identifier or constraint name."],
        ["msg", "fix", "act", "Together they point to the fix: here, correct the username or password."],
      ],
    ],
    mistakes: [
      "Logging only `e.getMessage()` and losing the error code and SQLState.",
      "Creating statements in loops without closing them, leading to ORA-01000.",
      "Catching SQLException and continuing with a closed or broken connection.",
    ],
    qa: [
      ["What causes ORA-01000: maximum open cursors exceeded?", "Statements and ResultSets that are not closed, typically created in a loop; close them with try-with-resources."],
      ["What does \"Exhausted Resultset\" mean?", "You read column data after next() returned false (no current row), or before calling next()."],
      ["What is the difference between getErrorCode and getSQLState?", "getErrorCode returns the vendor-specific code; getSQLState returns the standard five-character state whose class indicates the error category."],
      ["What does ORA-12505 mean?", "The listener does not know the SID in the connection URL; check the SID or use the service name syntax."],
    ],
    ex: [
      "Your code fails with ORA-00904 only in production, where the table was created with a quoted lower-case column name \"price\". Why, and how do you fix it?",
      "Quoted identifiers are case-sensitive in Oracle, so `SELECT price` looks for PRICE and fails. Quote it in the SQL (`SELECT \"price\"`) or, better, recreate the column unquoted.",
    ],
  }),

  lesson("JDBC Interview Questions", {
    intro:
      "This lesson collects the most frequently asked JDBC interview questions with concise answers, from architecture and drivers to statements, result sets, transactions, performance and errors. The program summarises several answers in code: statement choice, batching, transactions and metadata in one compact example.",
    topics: [
      [
        "Architecture and drivers",
        "What is JDBC; JDBC architecture and the DriverManager/Driver/Connection relationship; the four driver types; whether Class.forName is still needed; the difference between DriverManager and DataSource; connection URLs for common databases.",
      ],
      [
        "Statements and results",
        "Statement vs PreparedStatement vs CallableStatement; SQL injection and how PreparedStatement prevents it; execute vs executeQuery vs executeUpdate; ResultSet types, concurrency and holdability; updatable result sets; RowSet vs ResultSet; reading BLOBs and CLOBs; handling NULLs with wasNull.",
      ],
      [
        "Transactions and performance",
        "Auto-commit, commit, rollback and savepoints; isolation levels and the anomalies they prevent; batch processing; fetch size; connection pooling; pagination; stored procedures and OUT parameters; best practices for closing resources.",
      ],
    ],
    code: String.raw`import java.sql.*;
import java.util.Arrays;

public class Main {
    static final String URL = "jdbc:postgresql://localhost:5432/shop";

    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(URL, "shop", "shop_pw")) {
            DatabaseMetaData meta = con.getMetaData();
            System.out.println("Q: which isolation levels are supported? READ_COMMITTED " + meta.supportsTransactionIsolationLevel(Connection.TRANSACTION_READ_COMMITTED)
                    + ", SERIALIZABLE " + meta.supportsTransactionIsolationLevel(Connection.TRANSACTION_SERIALIZABLE));

            con.setAutoCommit(false);
            try (PreparedStatement ps = con.prepareStatement("INSERT INTO tag (name) VALUES (?)")) {
                for (String t : new String[] {"java", "jdbc", "sql"}) { ps.setString(1, t); ps.addBatch(); }
                System.out.println("Q: how do you insert many rows efficiently? batch counts " + Arrays.toString(ps.executeBatch()));
                con.rollback();                                            // demo only: undo
                System.out.println("Q: how do you undo uncommitted work? rollback() done");
            }

            try (PreparedStatement ps = con.prepareStatement("SELECT name FROM customer WHERE city = ?",
                    ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY)) {
                ps.setString(1, "Pune");
                try (ResultSet rs = ps.executeQuery()) {
                    rs.last();
                    System.out.println("Q: how many rows did the query return? " + rs.getRow() + " (scrollable last + getRow)");
                }
            }

            try (Statement st = con.createStatement()) {
                boolean isQuery = st.execute("SELECT 1");
                System.out.println("Q: what does execute() return for a SELECT? " + isQuery + ", update count " + st.getUpdateCount());
            }
            con.setAutoCommit(true);
        } catch (SQLException e) {
            System.out.println("Q: what should you log for a SQLException? code " + e.getErrorCode() + ", state " + e.getSQLState() + ", message " + e.getMessage());
        }
    }
}`,
    mode: "compile",
    sample: String.raw`Q: which isolation levels are supported? READ_COMMITTED true, SERIALIZABLE true
Q: how do you insert many rows efficiently? batch counts [1, 1, 1]
Q: how do you undo uncommitted work? rollback() done
Q: how many rows did the query return? 2 (scrollable last + getRow)
Q: what does execute() return for a SELECT? true, update count -1`,
    walk:
      "Each line answers an interview question in code. `DatabaseMetaData` reports which isolation levels the database supports. A PreparedStatement batch inserts three tags in one round trip, and because auto-commit is off, `rollback()` undoes them.\n\nA scrollable ResultSet gives its size with `last()` and `getRow()`. `execute()` returns true for a SELECT and the update count is -1 because the current result is a ResultSet. The catch block shows what to log for a SQLException: the vendor code, the SQLState and the message. The output is a sample run against PostgreSQL.",
    anim: [
      "Where JDBC questions come from",
      [
        ["drv", "drivers", "4 types, URLs"],
        ["stmt", "statements", "Prepared, Callable"],
        ["rs", "result sets", "types, updatable"],
        ["tx", "transactions", "commit, isolation"],
        ["perf", "performance", "pool, batch, fetch"],
      ],
      [
        ["drv", "stmt", "then", "After connecting, interviews focus on choosing the right statement and preventing injection."],
        ["stmt", "rs", "then", "Then on reading results: cursor types, updatability, NULLs and LOBs."],
        ["rs", "tx", "then", "Then on correctness: auto-commit, rollback, savepoints and isolation."],
        ["tx", "perf", "then", "Finally on scale: pooling, batching, fetch size and pagination."],
      ],
    ],
    mistakes: [
      "Answering with outdated facts (Class.forName required, JDBC-ODBC bridge available).",
      "Not mentioning resource closing and SQL injection when discussing JDBC code.",
    ],
    qa: [
      ["What is the difference between execute, executeQuery and executeUpdate?", "executeQuery returns a ResultSet for SELECT; executeUpdate returns an update count for DML/DDL; execute handles any SQL and returns true if the first result is a ResultSet."],
      ["What are dirty reads, non-repeatable reads and phantom reads?", "Dirty: reading uncommitted changes of another transaction. Non-repeatable: re-reading a row gives different values. Phantom: re-running a query returns new rows. Higher isolation levels prevent them."],
      ["Why use PreparedStatement over Statement?", "It prevents SQL injection, handles types and quoting, and is faster when reused because the SQL is precompiled."],
      ["What is the purpose of setFetchSize?", "To control how many rows are fetched per round trip, balancing memory use and network calls."],
      ["What is a DataSource?", "A factory for connections, usually backed by a connection pool, configured once and preferred over DriverManager."],
      ["How do you call a stored procedure with an OUT parameter?", "prepareCall(\"{call p(?, ?)}\"), set IN parameters, registerOutParameter for OUT ones, execute and read them with getX."],
      ["What is the difference between commit and rollback?", "commit makes the transaction's changes permanent; rollback discards them."],
    ],
    ex: [
      "An interviewer asks: \"What happens if you forget to close a Connection obtained from a pool?\" Answer precisely.",
      "It is never returned to the pool, so the pool eventually runs out of connections and requests time out waiting (a connection leak); on the database side, its session and cursors stay open.",
    ],
  }),
]);
