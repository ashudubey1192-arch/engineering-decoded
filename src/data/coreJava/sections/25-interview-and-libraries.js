import { lesson, section } from "../schema.js";

export default section("interview-and-libraries", "Core Java Interview Prep and Popular Libraries", [
  lesson("Core Java Top Interview Questions", {
    intro:
      "This lesson gathers the core Java questions asked most often in interviews, from language basics and OOP to strings, memory, exceptions, collections, concurrency and Java 8. Each answer is short enough to say aloud and points to the lesson that explains it in depth. The program checks several classic \"what is the output?\" questions.",
    topics: [
      [
        "Language and platform",
        "JDK vs JRE vs JVM; why Java is platform independent; why main is public static void; can main be overloaded; what a classpath is; primitive types and their sizes; widening and narrowing; pass by value; the eight wrapper classes and autoboxing; the Integer cache.",
      ],
      [
        "OOP and keywords",
        "The four OOP pillars; overloading vs overriding; abstract class vs interface; can constructors be private, final or static; this vs super; static and final in every position; static and instance initialization order; inner class types; why multiple inheritance is not supported for classes; covariant return types.",
      ],
      [
        "Strings, objects and memory",
        "Why String is immutable; string pool and intern; String vs StringBuilder vs StringBuffer; equals vs ==; the equals/hashCode contract; shallow vs deep copy; immutable classes; garbage collection, generations and collectors; stack vs heap; memory leaks in Java.",
      ],
      [
        "Exceptions, collections, threads and Java 8",
        "Checked vs unchecked; final/finally/finalize; try-with-resources; HashMap internals; ArrayList vs LinkedList; fail-fast iterators; Comparable vs Comparator; thread life cycle; synchronized vs volatile; deadlock; executors; ConcurrentHashMap; lambdas, streams, Optional and functional interfaces.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static int counter = 0;
    static class Parent { String who() { return "Parent"; } static String kind() { return "Parent.kind"; } }
    static class Child extends Parent { @Override String who() { return "Child"; } static String kind() { return "Child.kind"; } }

    @SuppressWarnings("finally")
    static int tricky() { try { return 1; } finally { return 2; } }

    public static void main(String[] args) {
        System.out.println("1) \"a\" + 1 + 2 = " + ("a" + 1 + 2) + ", 1 + 2 + \"a\" = " + (1 + 2 + "a"));
        System.out.println("2) Integer 127 == 127: " + (Integer.valueOf(127) == Integer.valueOf(127)) + ", 128 == 128: " + (Integer.valueOf(128) == Integer.valueOf(128)));
        String s1 = "java", s2 = new String("java");
        System.out.println("3) s1 == s2: " + (s1 == s2) + ", s1 == s2.intern(): " + (s1 == s2.intern()));
        Parent p = new Child();
        System.out.println("4) overridden method: " + p.who() + ", hidden static method: " + Parent.kind());
        System.out.println("5) finally overrides return: " + tricky());
        int i = 5;
        i = i++ + ++i;
        System.out.println("6) i = i++ + ++i with i = 5 gives " + i);
        System.out.println("7) 0.1 + 0.2 == 0.3: " + (0.1 + 0.2 == 0.3) + ", 10 / 0.0 = " + (10 / 0.0));
        char c = 'A';
        c += 1;
        System.out.println("8) char 'A' += 1 -> " + c + ", 'A' + 1 -> " + ('A' + 1));
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
        list.remove(Integer.valueOf(1));
        list.remove(0);
        System.out.println("9) remove(Integer 1) then remove(index 0): " + list);
        Map<String, Integer> map = new HashMap<>();
        map.put(null, 0);
        System.out.println("10) HashMap allows a null key: " + map.containsKey(null));
        String text = null;
        System.out.println("11) \"x\".equals(null-ref) is safe: " + "x".equals(text) + ", String.valueOf(null-ref): " + String.valueOf(text));
        StringBuilder sb = new StringBuilder("ab");
        change(sb);
        System.out.println("12) Java passes a copy of the reference: " + sb);
        System.out.println("13) Math.round(-2.5) = " + Math.round(-2.5) + ", Math.round(2.5) = " + Math.round(2.5));
        System.out.println("14) static counter shared: " + (++counter + ++counter));
    }

    static void change(StringBuilder b) { b.append("c"); b = new StringBuilder("zzz"); }
}`,
    walk:
      "Each numbered line is a classic interview question. Concatenation evaluates left to right, so `\"a\" + 1 + 2` is \"a12\" while `1 + 2 + \"a\"` is \"3a\". The Integer cache makes 127 identical but not 128. A `new String` is a different object until interned. Overridden instance methods follow the object, while static methods are hidden. A return in finally wins.\n\n`i = i++ + ++i` with 5 gives 5 + 7 = 12. Floating point makes 0.1 + 0.2 differ from 0.3, and dividing by 0.0 gives Infinity. Compound assignment on a char casts back, while `'A' + 1` is an int. `remove(Integer)` removes by value and `remove(int)` by index. HashMap accepts a null key; calling equals on a literal is null-safe. The method appends to the caller's StringBuilder but reassigning its parameter has no effect. `Math.round` rounds half up (-2.5 to -2, 2.5 to 3).",
    anim: [
      "How to answer an output question",
      [
        ["q", "the code", "question"],
        ["rule", "which rule?", "pool, cache..."],
        ["eval", "evaluate", "step by step"],
        ["edge", "edge cases", "null, overflow"],
        ["ans", "answer", "with reason"],
      ],
      [
        ["q", "rule", "identify", "Name the rule being tested: string pool, Integer cache, finally, overriding..."],
        ["rule", "eval", "trace", "Evaluate the expression in Java's exact order (left to right, prefix vs postfix)."],
        ["eval", "edge", "check", "Check edge cases: null, overflow, floating point, static vs instance."],
        ["edge", "ans", "explain", "State the result and the reason; interviewers care most about the why."],
      ],
    ],
    mistakes: [
      "Answering from memory without tracing evaluation order.",
      "Giving outdated answers (PermGen in Java 8+, JDBC-ODBC bridge, CMS as default).",
      "Memorising definitions without being able to give an example.",
    ],
    qa: [
      ["What is the difference between JDK, JRE and JVM?", "The JVM runs bytecode; the JRE is the JVM plus libraries to run programs; the JDK is the JRE plus development tools such as javac."],
      ["Why is Java platform independent?", "Source compiles to bytecode, which any platform's JVM can execute."],
      ["Is Java pass by value or by reference?", "Always pass by value; for objects the value passed is a copy of the reference."],
      ["Why is String immutable?", "For string-pool safety, security, thread safety and cached hash codes."],
      ["What is the difference between == and equals?", "== compares primitive values or reference identity; equals compares logical content."],
      ["What is the contract between equals and hashCode?", "Equal objects must have equal hash codes; equal hash codes do not imply equality."],
      ["What is the difference between an abstract class and an interface?", "An abstract class can hold state, constructors and any members and is extended once; an interface is a contract that classes can implement many times, with default/static/private methods but no instance state."],
      ["What is the difference between overloading and overriding?", "Overloading: same name, different parameters, compile-time. Overriding: same signature in a subclass, runtime dispatch."],
      ["What is the difference between final, finally and finalize?", "final is a modifier that prevents change; finally is a block that always runs after try; finalize is a deprecated GC hook."],
      ["What is the difference between checked and unchecked exceptions?", "Checked exceptions must be caught or declared; unchecked (RuntimeException and Error) need not be."],
      ["How does HashMap work?", "It hashes keys into buckets of an array, resolves collisions with lists or trees, uses equals to find keys and resizes at 75% load."],
      ["What is the difference between ArrayList and LinkedList?", "ArrayList is array-backed with O(1) random access; LinkedList is doubly linked with O(1) end operations but O(n) access."],
      ["What is the difference between synchronized and volatile?", "volatile guarantees visibility of one variable; synchronized guarantees visibility and mutual exclusion for a block."],
      ["What is a deadlock and how do you avoid it?", "Threads waiting forever for each other's locks; avoid with consistent lock ordering, timeouts and fewer nested locks."],
      ["What is the difference between a process and a thread?", "A process has its own memory; threads share their process's heap but have their own stacks."],
      ["What are the new features of Java 8?", "Lambdas, functional interfaces, streams, default methods, Optional, java.time and CompletableFuture."],
      ["What is a functional interface?", "An interface with exactly one abstract method, usable as a lambda target."],
      ["What is the difference between map and flatMap in streams?", "map transforms each element to one result; flatMap transforms each element to a stream and flattens them into one stream."],
      ["What is garbage collection?", "Automatic reclamation of objects unreachable from GC roots, done by collectors such as G1."],
      ["What is the difference between stack and heap memory?", "The stack holds per-thread frames and local variables; the heap holds all objects and is shared and garbage collected."],
      ["Can we override a static or private method?", "No; static methods are hidden and private methods are not inherited."],
      ["What is the difference between Comparable and Comparator?", "Comparable defines a class's natural order with compareTo; Comparator defines external orders with compare."],
      ["What is a singleton and how do you make it thread-safe?", "A class with one instance; use an enum, the holder idiom, or double-checked locking with volatile."],
      ["What is the difference between String, StringBuilder and StringBuffer?", "String is immutable; StringBuilder is mutable and unsynchronized; StringBuffer is mutable and synchronized."],
      ["What is autoboxing?", "Automatic conversion between primitives and their wrapper classes, such as int to Integer."],
      ["What is serialization?", "Converting an object graph to bytes for storage or transfer, and back, via Serializable and object streams."],
    ],
    ex: [
      "Predict the output: `String a = \"hello\"; String b = \"hel\" + \"lo\"; String c = \"hel\"; String d = c + \"lo\"; System.out.println((a == b) + \" \" + (a == d) + \" \" + a.equals(d));`",
      "\"true false true\": b is a compile-time constant folded into the pooled \"hello\", d is built at runtime as a new object, and equals compares content.",
    ],
  }),

  lesson("Creating PDF Files with iText", {
    intro:
      "Generating PDFs (invoices, reports, certificates) is a common requirement in Java applications, and iText is one of the most widely used libraries for it. This lesson shows how to add iText to a project, create a document with text, tables and images, set fonts and metadata, protect a PDF with a password, and read text back. It uses the iText 7/8 API (`com.itextpdf.kernel`, `com.itextpdf.layout`).",
    topics: [
      [
        "Adding iText",
        "Add `com.itextpdf:itext-core` (iText 8) or the `kernel` and `layout` modules with Maven or Gradle. iText is dual licensed (AGPL or commercial); check the license for closed-source use. Apache PDFBox and OpenPDF are alternatives with permissive licenses.",
      ],
      [
        "The core objects",
        "`PdfWriter` writes bytes to a file or stream, `PdfDocument` represents the PDF (pages, metadata), and `Document` is the high-level layout object you add content to. Closing the `Document` finishes and writes the file.",
      ],
      [
        "Content: paragraphs, tables, images and fonts",
        "`new Paragraph(\"text\").setBold().setFontSize(18)`, `new Table(UnitValue.createPercentArray(new float[] {3, 1, 2}))` with `addHeaderCell` and `addCell`, `new Image(ImageDataFactory.create(\"logo.png\"))`, and fonts from `PdfFontFactory.createFont(StandardFonts.HELVETICA)` or embedded TTF files for Unicode text such as the rupee sign.",
      ],
      [
        "Metadata, encryption and reading",
        "`pdf.getDocumentInfo().setTitle(...)` sets metadata. `new WriterProperties().setStandardEncryption(userPassword, ownerPassword, permissions, EncryptionConstants.ENCRYPTION_AES_256)` creates a password-protected PDF (needs the Bouncy Castle dependency). `PdfTextExtractor.getTextFromPage(pdf.getPage(1))` reads text back.",
      ],
    ],
    code: String.raw`import com.itextpdf.kernel.pdf.*;
import com.itextpdf.kernel.pdf.canvas.parser.PdfTextExtractor;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import java.nio.file.*;

public class Main {
    record Line(String item, int qty, double price) { }

    public static void main(String[] args) throws Exception {
        Path pdfPath = Path.of("invoice-1042.pdf");
        Line[] lines = {new Line("Keyboard", 1, 1499), new Line("USB cable", 3, 99), new Line("Mouse pad", 2, 249)};

        try (PdfDocument pdf = new PdfDocument(new PdfWriter(pdfPath.toString()));
             Document doc = new Document(pdf)) {
            pdf.getDocumentInfo().setTitle("Invoice 1042").setAuthor("Engineering Decoded Store");
            doc.add(new Paragraph("INVOICE #1042").setBold().setFontSize(20));
            doc.add(new Paragraph("Customer: Asha K, Pune").setFontSize(11));

            Table table = new Table(UnitValue.createPercentArray(new float[] {4, 1, 2})).useAllAvailableWidth();
            table.addHeaderCell("Item").addHeaderCell("Qty").addHeaderCell("Amount");
            double total = 0;
            for (Line l : lines) {
                double amount = l.qty() * l.price();
                total += amount;
                table.addCell(l.item()).addCell(String.valueOf(l.qty()))
                     .addCell(new Cell().add(new Paragraph(String.format("%.2f", amount)).setTextAlignment(TextAlignment.RIGHT)));
            }
            doc.add(table);
            doc.add(new Paragraph(String.format("Total: %.2f", total)).setBold().setTextAlignment(TextAlignment.RIGHT));
            System.out.println("pages: " + pdf.getNumberOfPages());
        }
        System.out.println("PDF written: " + pdfPath + " (" + (Files.size(pdfPath) > 0 ? "non-empty" : "empty") + ")");

        try (PdfDocument read = new PdfDocument(new PdfReader(pdfPath.toString()))) {
            String text = PdfTextExtractor.getTextFromPage(read.getPage(1));
            System.out.println("title metadata: " + read.getDocumentInfo().getTitle());
            System.out.println("first lines of text: " + text.lines().limit(3).toList());
        }
    }
}`,
    mode: "show",
    sample: String.raw`pages: 1
PDF written: invoice-1042.pdf (non-empty)
title metadata: Invoice 1042
first lines of text: [INVOICE #1042, Customer: Asha K, Pune, Item Qty Amount]`,
    walk:
      "A `PdfWriter` targets the file, a `PdfDocument` holds the PDF and its metadata, and a `Document` lays out content: a bold title, a customer line, a three-column table with header cells and right-aligned amounts, and a bold total. Closing the document in try-with-resources writes the file.\n\nReading it back with `PdfReader`, the program prints the title metadata and extracts the first lines of page 1 with `PdfTextExtractor`. This program needs the iText JARs on the classpath, so the output is a sample run.",
    anim: [
      "Building a PDF with iText",
      [
        ["writer", "PdfWriter", "to file"],
        ["pdf", "PdfDocument", "pages, metadata"],
        ["doc", "Document", "layout"],
        ["content", "Paragraph/Table", "elements"],
        ["file", "invoice.pdf", "result"],
      ],
      [
        ["writer", "pdf", "wrap", "PdfDocument writes through the PdfWriter to the output file."],
        ["pdf", "doc", "layout", "Document adds a layout engine that flows content onto pages."],
        ["content", "doc", "add", "Paragraphs, tables and images are added in order; pages break automatically."],
        ["doc", "file", "close", "Closing the document finalises the PDF structure and writes it."],
      ],
    ],
    mistakes: [
      "Forgetting to close the Document, producing a corrupt PDF.",
      "Using a standard font for non-Latin characters (they disappear); embed a Unicode TTF font.",
      "Ignoring iText's AGPL license in closed-source products.",
    ],
    qa: [
      ["How do you create a PDF in Java?", "With a library such as iText, Apache PDFBox or OpenPDF: create a writer, a PDF document and a layout document, add content and close it."],
      ["What are PdfWriter, PdfDocument and Document in iText?", "PdfWriter writes bytes, PdfDocument models the PDF (pages, metadata), and Document is the high-level layout API for adding elements."],
      ["How do you password-protect a PDF with iText?", "Pass WriterProperties with setStandardEncryption(user, owner, permissions, ENCRYPTION_AES_256) to the PdfWriter (Bouncy Castle required)."],
    ],
    ex: [
      "Add a company logo image above the invoice title.",
      "`doc.add(new Image(ImageDataFactory.create(\"logo.png\")).scaleToFit(120, 60));` before adding the title paragraph.",
    ],
  }),

  lesson("MongoDB with Java", {
    intro:
      "MongoDB is a document database that stores JSON-like documents (BSON) in collections instead of rows in tables. The official MongoDB Java driver lets Java applications insert, query, update and delete documents, build indexes and run aggregations. This lesson connects to MongoDB, performs CRUD with `Document` objects and filters, maps documents to Java records with POJO codecs, and runs an aggregation pipeline.",
    topics: [
      [
        "Setup and connecting",
        "Add `org.mongodb:mongodb-driver-sync`. Run MongoDB locally (for example `docker run -p 27017:27017 mongo`). `MongoClients.create(\"mongodb://localhost:27017\")` returns a thread-safe `MongoClient` to create once and reuse; `client.getDatabase(\"shop\").getCollection(\"products\")` gets a collection (created automatically on first write).",
      ],
      [
        "Create and read",
        "`insertOne(new Document(\"name\", \"Pen\").append(\"price\", 10.5))` and `insertMany(list)`. Each document gets an `_id` (ObjectId) if not provided. `find(Filters.eq(\"category\", \"stationery\"))` returns an iterable cursor; chain `sort(Sorts.descending(\"price\"))`, `limit`, `projection(Projections.include(...))`, and `first()` for a single document.",
      ],
      [
        "Update and delete",
        "`updateOne(filter, Updates.set(\"price\", 12))`, `updateMany(filter, Updates.inc(\"stock\", -1))`, upserts with `UpdateOptions().upsert(true)`, `replaceOne`, and `deleteOne` / `deleteMany`. Results report matched, modified and deleted counts.",
      ],
      [
        "POJOs, indexes and aggregation",
        "Register a `PojoCodecProvider` to read and write Java classes or records directly (`MongoCollection<Product>`). `createIndex(Indexes.ascending(\"name\"))` speeds up queries. `aggregate(List.of(Aggregates.match(...), Aggregates.group(\"$category\", Accumulators.sum(\"total\", \"$price\"))))` performs analytics in the database. Multi-document transactions are available on replica sets.",
      ],
    ],
    code: String.raw`import com.mongodb.client.*;
import com.mongodb.client.model.*;
import com.mongodb.client.result.*;
import org.bson.Document;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        try (MongoClient client = MongoClients.create("mongodb://localhost:27017")) {   // create once, reuse
            MongoCollection<Document> products = client.getDatabase("shop").getCollection("products");
            products.drop();

            products.insertOne(new Document("name", "Pen").append("category", "stationery").append("price", 10.5).append("stock", 120));
            InsertManyResult many = products.insertMany(List.of(
                    new Document("name", "Notebook").append("category", "stationery").append("price", 45.0).append("stock", 60),
                    new Document("name", "Keyboard").append("category", "electronics").append("price", 1499.0).append("stock", 15),
                    new Document("name", "Mouse").append("category", "electronics").append("price", 699.0).append("stock", 0)));
            System.out.println("inserted " + (1 + many.getInsertedIds().size()) + " documents, count " + products.countDocuments());

            System.out.println("stationery sorted by price desc:");
            for (Document d : products.find(Filters.eq("category", "stationery")).sort(Sorts.descending("price"))
                    .projection(Projections.fields(Projections.include("name", "price"), Projections.excludeId()))) {
                System.out.println("  " + d.toJson());
            }
            Document cheapest = products.find(Filters.lt("price", 50)).sort(Sorts.ascending("price")).first();
            System.out.println("cheapest under 50: " + cheapest.getString("name"));

            UpdateResult up = products.updateOne(Filters.eq("name", "Pen"), Updates.combine(Updates.set("price", 12.0), Updates.inc("stock", -20)));
            System.out.println("updateOne matched " + up.getMatchedCount() + ", modified " + up.getModifiedCount());
            UpdateResult upsert = products.updateOne(Filters.eq("name", "Stapler"),
                    Updates.combine(Updates.set("category", "stationery"), Updates.set("price", 150.0)), new UpdateOptions().upsert(true));
            System.out.println("upsert created a new document: " + (upsert.getUpsertedId() != null));

            DeleteResult del = products.deleteMany(Filters.eq("stock", 0));
            System.out.println("deleted out-of-stock documents: " + del.getDeletedCount());

            products.createIndex(Indexes.ascending("name"));
            System.out.println("indexes: " + products.listIndexes().map(i -> i.getString("name")).into(new java.util.ArrayList<>()));

            System.out.println("total inventory value per category:");
            products.aggregate(List.of(
                    Aggregates.group("$category", Accumulators.sum("items", 1), Accumulators.sum("value", new Document("$multiply", List.of("$price", new Document("$ifNull", List.of("$stock", 0)))))),
                    Aggregates.sort(Sorts.ascending("_id"))))
                    .forEach(d -> System.out.println("  " + d.toJson()));
        }
    }
}`,
    mode: "show",
    sample: String.raw`inserted 4 documents, count 4
stationery sorted by price desc:
  {"name": "Notebook", "price": 45.0}
  {"name": "Pen", "price": 10.5}
cheapest under 50: Pen
updateOne matched 1, modified 1
upsert created a new document: true
deleted out-of-stock documents: 1
indexes: [_id_, name_1]
total inventory value per category:
  {"_id": "electronics", "items": 1, "value": 22485.0}
  {"_id": "stationery", "items": 3, "value": 3900.0}`,
    walk:
      "The program creates one `MongoClient`, gets the `products` collection and inserts four documents with `insertOne` and `insertMany`. A query with `Filters.eq`, `Sorts.descending` and a projection returns only the stationery names and prices; `first()` fetches the cheapest item under 50.\n\n`updateOne` sets a new price and decrements stock in one operation, an upsert inserts the missing Stapler, and `deleteMany` removes the out-of-stock mouse. An index on `name` is created, and an aggregation groups documents by category to compute item counts and inventory value. It requires the MongoDB driver JAR and a running MongoDB, so the output is a sample run.",
    anim: [
      "Documents instead of rows",
      [
        ["java", "Java code", "MongoClient"],
        ["coll", "collection", "products"],
        ["docs", "BSON documents", "{name, price}"],
        ["query", "Filters + Sorts", "find()"],
        ["agg", "aggregate", "group by category"],
      ],
      [
        ["java", "coll", "connect", "A single reusable MongoClient gives access to databases and collections."],
        ["coll", "docs", "insert", "Documents are schemaless JSON-like objects with an automatic _id."],
        ["query", "docs", "find", "Filters, sorts and projections are built with fluent helper classes."],
        ["agg", "docs", "pipeline", "Aggregation pipelines group and compute inside the database."],
      ],
    ],
    mistakes: [
      "Creating a new MongoClient per request instead of reusing one (it manages a connection pool).",
      "Building filters by concatenating JSON strings from user input; use the Filters builders.",
      "Querying unindexed fields on large collections.",
    ],
    qa: [
      ["How do you connect to MongoDB from Java?", "Add mongodb-driver-sync and create a MongoClient with MongoClients.create(connectionString); reuse it for the application's lifetime."],
      ["How do you query documents?", "collection.find(Filters...) with optional sort, limit and projection; iterate the result or call first()."],
      ["What is an upsert?", "An update that inserts a new document when no document matches the filter (UpdateOptions().upsert(true))."],
    ],
    ex: [
      "Find all electronics with price between 500 and 2000, sorted by name.",
      "`products.find(Filters.and(Filters.eq(\"category\", \"electronics\"), Filters.gte(\"price\", 500), Filters.lte(\"price\", 2000))).sort(Sorts.ascending(\"name\"))`.",
    ],
  }),
]);
