import { lesson, section } from "../schema.js";

export default section("serialization", "Serialization and Deserialization", [
  lesson("Serialization and Deserialization Basics", {
    intro:
      "Serialization converts an object graph into a stream of bytes so it can be saved to a file, sent over a network or cached; deserialization rebuilds the objects from those bytes. Java's built-in mechanism uses `Serializable`, `ObjectOutputStream` and `ObjectInputStream`. This lesson covers what serialization is, serializing to and from a file, reading several objects safely without an `EOFException`, and when to use it.",
    topics: [
      [
        "What serialization is",
        "Java serialization writes an object's class description and the values of its non-transient, non-static fields, recursively following references, so a whole object graph (including shared references and cycles) can be restored. A class opts in by implementing the marker interface `java.io.Serializable`.",
      ],
      [
        "Serializing and deserializing an object to a file",
        "Wrap a `FileOutputStream` in an `ObjectOutputStream` and call `writeObject(obj)`; to read, wrap a `FileInputStream` in an `ObjectInputStream`, call `readObject()` and cast the result. Both throw `IOException`; `readObject` also throws `ClassNotFoundException` if the class is missing.",
      ],
      [
        "Avoiding EOFException when reading many objects",
        "`readObject()` has no \"end of stream\" return value: reading past the last object throws `EOFException`. Avoid relying on it by writing the number of objects first, writing a single collection containing all of them, or writing a `null` sentinel at the end and stopping when `readObject()` returns null.",
      ],
      [
        "When to use it (and when not)",
        "Built-in serialization powers RMI, some caches and session replication, and deep copies. For data exchange and long-term storage, prefer explicit formats (JSON, Protocol Buffers, Avro): they are language neutral and evolvable. Never deserialize untrusted data: crafted streams can execute code through \"gadget chains\"; use `ObjectInputFilter` if you must.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;
        final String name;
        final double salary;
        final Employee manager;                  // references are serialized too
        Employee(String name, double salary, Employee manager) { this.name = name; this.salary = salary; this.manager = manager; }
        public String toString() { return name + "(" + salary + (manager != null ? ", reports to " + manager.name : "") + ")"; }
    }

    public static void main(String[] args) throws Exception {
        Path file = Files.createTempFile("employees", ".ser");
        Employee boss = new Employee("Meera", 150_000, null);
        Employee dev = new Employee("Ravi", 90_000, boss);

        try (ObjectOutputStream out = new ObjectOutputStream(Files.newOutputStream(file))) {
            out.writeObject(dev);                                  // writes dev and boss
        }
        System.out.println("serialized " + Files.size(file) + " bytes to a file");

        try (ObjectInputStream in = new ObjectInputStream(Files.newInputStream(file))) {
            Employee copy = (Employee) in.readObject();
            System.out.println("deserialized: " + copy + ", new object: " + (copy != dev) + ", manager restored: " + copy.manager);
        }

        List<Employee> team = List.of(boss, dev, new Employee("Asha", 95_000, boss));
        try (ObjectOutputStream out = new ObjectOutputStream(Files.newOutputStream(file))) {
            out.writeInt(team.size());                             // approach 1: count first
            for (Employee e : team) out.writeObject(e);
            out.writeObject(null);                                 // approach 2: null sentinel
        }
        try (ObjectInputStream in = new ObjectInputStream(Files.newInputStream(file))) {
            int count = in.readInt();
            List<Employee> read = new ArrayList<>();
            for (int i = 0; i < count; i++) read.add((Employee) in.readObject());
            System.out.println("read " + read.size() + " objects using the count, last: " + read.get(read.size() - 1));
            System.out.println("sentinel reached: " + (in.readObject() == null));
            Employee sharedA = read.get(1).manager, sharedB = read.get(2).manager;
            System.out.println("shared manager kept as one object: " + (sharedA == sharedB) + " and same as read boss: " + (sharedA == read.get(0)));
            try {
                in.readObject();
            } catch (EOFException e) {
                System.out.println("reading past the end -> EOFException");
            }
        }
        Files.delete(file);
    }
}`,
    walk:
      "`Employee` implements `Serializable`. Writing `dev` also writes the `boss` object it references, and reading it back produces new objects with the same data and the manager link intact.\n\nThe second part writes three employees with a count in front and a null sentinel at the end. Reading uses the count (or would stop at the null), so it never runs into `EOFException`. Because all three objects were written to one stream, the shared manager is restored as a single object, so identity relationships survive. Reading once more past the end shows the `EOFException` you avoid this way.",
    anim: [
      "Object graph to bytes and back",
      [
        ["obj", "Employee Ravi", "in memory"],
        ["oos", "ObjectOutput..", "writeObject"],
        ["bytes", "byte stream", "file / network"],
        ["ois", "ObjectInput..", "readObject"],
        ["copy", "new Employee", "same data"],
      ],
      [
        ["obj", "oos", "serialize", "writeObject walks the object and every object it references, like the manager."],
        ["oos", "bytes", "encode", "Class descriptions and field values are encoded into bytes."],
        ["bytes", "ois", "read", "Later, possibly in another JVM, the bytes are read back."],
        ["ois", "copy", "rebuild", "readObject recreates new objects with the same state and links."],
      ],
    ],
    mistakes: [
      "Looping on `readObject()` until EOFException as the normal way to stop.",
      "Deserializing data from untrusted sources.",
      "Forgetting that every object in the graph must be Serializable.",
    ],
    qa: [
      ["What is serialization in Java?", "Converting an object graph into a byte stream (ObjectOutputStream.writeObject) so it can be stored or transmitted, and restoring it with ObjectInputStream.readObject."],
      ["Why is Serializable a marker interface?", "It has no methods; it only signals to the serialization mechanism that the class may be serialized."],
      ["How do you avoid EOFException when reading multiple objects?", "Write the object count first, write a single collection, or write a null sentinel at the end."],
    ],
    ex: [
      "Write all employees as a single `ArrayList<Employee>` instead of individual objects. How does reading change?",
      "Write `out.writeObject(new ArrayList<>(team))` and read with `List<Employee> read = (List<Employee>) in.readObject();`; one call, no count or sentinel needed.",
    ],
  }),

  lesson("Customizing Serialization with writeObject() and readObject()", {
    intro:
      "Default serialization writes every non-transient field as is. Sometimes you need control: encrypt or mask a field, write a derived value, validate data on reading, or serialize a field whose type is not serializable. Java lets a class define private `writeObject` and `readObject` methods that the serialization mechanism calls. This lesson shows how to use them correctly.",
    topics: [
      [
        "The special method signatures",
        "`private void writeObject(ObjectOutputStream out) throws IOException` and `private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException`. They must be private and exactly match these signatures; the serialization mechanism finds them by reflection. Each class in a hierarchy handles only its own fields.",
      ],
      [
        "defaultWriteObject and defaultReadObject",
        "Call `out.defaultWriteObject()` first to write the normal non-transient fields, then write extra data with `writeInt`, `writeUTF`, `writeObject` and so on. In readObject call `in.defaultReadObject()` and read the extra data in exactly the same order.",
      ],
      [
        "Typical customizations",
        "Writing a transient field in a different form (an encrypted password, a non-serializable resource rebuilt from a file path), validating invariants after reading and throwing `InvalidObjectException`, and restoring transient caches. `readObjectNoData`, `writeReplace` and `readResolve` give further control.",
      ],
      [
        "Security note",
        "Treat `readObject` like a public constructor: validate everything and make defensive copies of mutable fields, because an attacker can craft the byte stream.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.Base64;

public class Main {
    static class Account implements Serializable {
        private static final long serialVersionUID = 1L;
        private final String user;
        private transient String password;          // not written by default
        private transient int loginCount;           // a cache we rebuild
        private int balance;

        Account(String user, String password, int balance) { this.user = user; this.password = password; this.balance = balance; }

        private void writeObject(ObjectOutputStream out) throws IOException {
            out.defaultWriteObject();               // user and balance
            String scrambled = Base64.getEncoder().encodeToString(new StringBuilder(password).reverse().toString().getBytes());
            out.writeUTF(scrambled);                // custom form of the transient field
            System.out.println("  writeObject: wrote scrambled password");
        }

        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
            in.defaultReadObject();
            String scrambled = in.readUTF();        // same order as written
            password = new StringBuilder(new String(Base64.getDecoder().decode(scrambled))).reverse().toString();
            if (balance < 0) throw new InvalidObjectException("negative balance in stream");
            loginCount = 0;                         // rebuild transient state
            System.out.println("  readObject: restored and validated");
        }

        public String toString() { return user + " balance " + balance + " password " + password; }
    }

    static byte[] serialize(Object o) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(o); }
        return bytes.toByteArray();
    }

    static Object deserialize(byte[] data) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        Account original = new Account("asha", "s3cret!", 500);
        byte[] data = serialize(original);
        System.out.println("plain password visible in bytes: " + new String(data, "ISO-8859-1").contains("s3cret!"));
        System.out.println("restored: " + deserialize(data));

        Account bad = new Account("ravi", "pw", 100);
        java.lang.reflect.Field f = Account.class.getDeclaredField("balance");
        f.setAccessible(true);
        f.setInt(bad, -999);                        // simulate a tampered stream
        try {
            deserialize(serialize(bad));
        } catch (InvalidObjectException e) {
            System.out.println("validation rejected the stream: " + e.getMessage());
        }
    }
}`,
    walk:
      "`password` and `loginCount` are transient, so default serialization would skip them. The private `writeObject` first calls `defaultWriteObject()` for `user` and `balance`, then writes a scrambled form of the password; the raw password never appears in the bytes. `readObject` reads in the same order, unscrambles the password, rebuilds the transient counter and validates the balance.\n\nTo simulate a malicious stream, the program forces a negative balance before serializing. The validation in `readObject` throws `InvalidObjectException`, so no invalid `Account` is ever created.",
    anim: [
      "Hooking into serialization",
      [
        ["oos", "writeObject(acc)", "JVM call"],
        ["custom", "writeObject()", "your private hook"],
        ["def", "defaultWrite..", "normal fields"],
        ["extra", "writeUTF(...)", "custom data"],
        ["read", "readObject()", "same order"],
      ],
      [
        ["oos", "custom", "reflect", "The serialization mechanism finds and calls your private writeObject."],
        ["custom", "def", "first", "defaultWriteObject writes the non-transient fields as usual."],
        ["custom", "extra", "then", "You append extra data, such as a scrambled form of a transient field."],
        ["read", "extra", "same order", "readObject must read exactly the same data in exactly the same order."],
      ],
    ],
    mistakes: [
      "Making the methods public or misspelling the signature, so they are silently ignored.",
      "Reading extra data in a different order than it was written.",
      "Forgetting `defaultWriteObject`/`defaultReadObject`, which breaks compatibility with future fields.",
    ],
    qa: [
      ["How do you customize serialization?", "Define private writeObject(ObjectOutputStream) and readObject(ObjectInputStream) methods in the class, usually calling defaultWriteObject/defaultReadObject plus custom reads and writes."],
      ["Why are these methods private?", "They are not part of the class's API; the serialization mechanism calls them reflectively, and making them private prevents subclasses and callers from invoking them."],
      ["How can readObject validate data?", "After reading, check invariants and throw InvalidObjectException if they are violated."],
    ],
    ex: [
      "A class has a transient `Thread worker` field that must be restarted after deserialization. Where do you restart it?",
      "In a private readObject: call `in.defaultReadObject()`, then create and start a new worker thread (threads themselves cannot be serialized).",
    ],
  }),

  lesson("Externalizable: writeExternal and readExternal", {
    intro:
      "`Externalizable` gives a class complete control over its serialized form: only what you write in `writeExternal` is stored, and `readExternal` rebuilds the object. It can produce smaller, faster streams but requires more work and a public no-arg constructor. This lesson covers the interface and compares Serializable with Externalizable.",
    topics: [
      [
        "The interface",
        "`Externalizable extends Serializable` and declares `void writeExternal(ObjectOutput out) throws IOException` and `void readExternal(ObjectInput in) throws IOException, ClassNotFoundException`. Only the class name and whatever you write are stored; superclass state is not handled automatically.",
      ],
      [
        "Public no-arg constructor",
        "During deserialization the JVM creates the object with its public no-argument constructor, then calls `readExternal` to fill it. Without that constructor, reading throws `InvalidClassException: no valid constructor`. Fields therefore cannot be final if they are set in readExternal.",
      ],
      [
        "Serializable vs Externalizable",
        "Control: automatic (optionally customised) vs entirely manual. Methods: none required vs writeExternal/readExternal. Constructor: not called for the serializable class itself vs public no-arg constructor required. Superclass fields: handled vs your responsibility. transient: meaningful vs irrelevant. Size and speed: larger, reflection-based vs potentially compact and fast. Versioning: serialVersionUID and compatible changes vs your own versioning scheme.",
      ],
      [
        "When to use it",
        "When the default form is much larger than necessary or too slow in a hot path, or when you need a stable custom format. In most code, Serializable with `writeObject`/`readObject` is enough.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class PointSer implements Serializable {
        private static final long serialVersionUID = 1L;
        int x, y; String label;
        PointSer(int x, int y, String label) { this.x = x; this.y = y; this.label = label; }
    }

    public static class PointExt implements Externalizable {
        int x, y; String label;
        transient String ignored = "transient means nothing here";
        public PointExt() { System.out.println("  public no-arg constructor called during deserialization"); }
        PointExt(int x, int y, String label) { this.x = x; this.y = y; this.label = label; }

        @Override public void writeExternal(ObjectOutput out) throws IOException {
            out.writeShort(x);                     // our own compact format
            out.writeShort(y);
            out.writeUTF(label);
        }
        @Override public void readExternal(ObjectInput in) throws IOException {
            x = in.readShort();
            y = in.readShort();
            label = in.readUTF();
        }
        public String toString() { return label + "(" + x + "," + y + ")"; }
    }

    public static class NoDefaultCtor implements Externalizable {
        public NoDefaultCtor(int unused) { }
        public void writeExternal(ObjectOutput out) { }
        public void readExternal(ObjectInput in) { }
    }

    static byte[] bytes(Object o) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        return b.toByteArray();
    }

    static Object read(byte[] data) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        byte[] ser = bytes(new PointSer(3, 4, "home"));
        byte[] ext = bytes(new PointExt(3, 4, "home"));
        System.out.println("Serializable size " + ser.length + " bytes, Externalizable size " + ext.length + " bytes, smaller: " + (ext.length < ser.length));

        PointExt restored = (PointExt) read(ext);
        System.out.println("restored via readExternal: " + restored);

        try {
            read(bytes(new NoDefaultCtor(1)));
        } catch (InvalidClassException e) {
            System.out.println("without a public no-arg constructor: InvalidClassException (" + e.getMessage().contains("no valid constructor") + ")");
        }
    }
}`,
    walk:
      "Both point classes hold the same data. The `Serializable` version stores full field descriptors (names and types) in the stream, while the `Externalizable` version writes just two shorts and a string in its own format, so its stream is noticeably smaller.\n\nReading the externalizable point first calls its public no-arg constructor (it prints a message) and then `readExternal` fills in the fields. A class whose only constructor takes an argument cannot be deserialized and fails with `InvalidClassException: no valid constructor`.",
    anim: [
      "Externalizable round trip",
      [
        ["obj", "PointExt", "x, y, label"],
        ["wext", "writeExternal", "you write"],
        ["bytes", "compact bytes", "your format"],
        ["ctor", "no-arg ctor", "new object"],
        ["rext", "readExternal", "you read"],
      ],
      [
        ["obj", "wext", "serialize", "Only what writeExternal writes ends up in the stream."],
        ["wext", "bytes", "encode", "Here: two shorts and a UTF string, with no field descriptors."],
        ["bytes", "ctor", "deserialize", "On reading, the public no-arg constructor creates an empty object."],
        ["ctor", "rext", "fill", "Then readExternal reads the values back in the same order."],
      ],
    ],
    mistakes: [
      "Forgetting the public no-arg constructor.",
      "Not writing superclass state in writeExternal.",
      "Changing the write order without versioning, breaking old data.",
    ],
    qa: [
      ["What is the difference between Serializable and Externalizable?", "Serializable is automatic (with optional hooks); Externalizable requires writeExternal/readExternal, gives full control and needs a public no-arg constructor."],
      ["Does transient matter for Externalizable classes?", "No. Only what writeExternal writes is serialized, so transient has no effect."],
      ["Which constructor is called when deserializing an Externalizable object?", "Its public no-argument constructor, before readExternal."],
    ],
    ex: [
      "Add a `version` byte at the start of `PointExt`'s format so a future version can add a `z` field. How would readExternal handle both?",
      "Write `out.writeByte(2)` first. In readExternal read the version; read x, y and label for all versions, and read z only if version >= 2 (defaulting z to 0 otherwise).",
    ],
  }),

  lesson("serialVersionUID and InvalidClassException", {
    intro:
      "When an object is deserialized, the JVM checks that the class in the stream and the class on the classpath are the same version, using a number called `serialVersionUID`. If they differ, it throws `InvalidClassException`. This lesson explains what serialVersionUID is, how it is computed when you do not declare it, why you should always declare it, and how to avoid InvalidClassException.",
    topics: [
      [
        "What serialVersionUID is",
        "A `private static final long serialVersionUID` field identifying the version of a serializable class. It is written into the stream with the class description. On deserialization, the local class's UID must equal the stream's, or deserialization fails.",
      ],
      [
        "Generated vs declared",
        "If you do not declare it, the JVM computes one from the class's structure (name, interfaces, fields, methods, constructors) using a hash. Almost any change, even adding a method, or compiling with a different compiler, produces a different value. Declaring it explicitly (often `1L`) keeps it stable so compatible changes still deserialize.",
      ],
      [
        "InvalidClassException",
        "Thrown with a message like \"local class incompatible: stream classdesc serialVersionUID = 1, local class serialVersionUID = 2\". It also appears when a class lacks a valid no-arg constructor for its first non-serializable superclass, or contains an unknown type.",
      ],
      [
        "Avoiding InvalidClassException",
        "Declare serialVersionUID in every Serializable class; change it deliberately only when you make an incompatible change and old data must be rejected; and keep changes compatible otherwise (next lesson). Tools such as `serialver ClassName` print the generated value if you need to match an existing class.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.ByteBuffer;
import java.util.Arrays;

public class Main {
    static class Order implements Serializable {
        private static final long serialVersionUID = 1L;          // declared explicitly
        String id = "ORD-7";
        int quantity = 2;
    }

    static class NoUid implements Serializable { int a = 1; }

    static byte[] serialize(Object o) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        return b.toByteArray();
    }

    static Object deserialize(byte[] data) throws Exception {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) { return in.readObject(); }
    }

    static byte[] withUid(byte[] data, long oldUid, long newUid) {   // simulate a stream from another version
        byte[] needle = ByteBuffer.allocate(8).putLong(oldUid).array();
        byte[] copy = data.clone();
        for (int i = 0; i + 8 <= copy.length; i++) {
            if (Arrays.equals(Arrays.copyOfRange(copy, i, i + 8), needle)) {
                System.arraycopy(ByteBuffer.allocate(8).putLong(newUid).array(), 0, copy, i, 8);
                break;
            }
        }
        return copy;
    }

    public static void main(String[] args) throws Exception {
        System.out.println("declared UID: " + ObjectStreamClass.lookup(Order.class).getSerialVersionUID());
        long generated = ObjectStreamClass.lookup(NoUid.class).getSerialVersionUID();
        System.out.println("generated UID for NoUid is a structural hash (not 0 or 1): " + (generated != 0 && generated != 1));

        byte[] stream = serialize(new Order());
        Order same = (Order) deserialize(stream);
        System.out.println("same UID -> deserialized " + same.id + " x" + same.quantity);

        try {
            deserialize(withUid(stream, 1L, 2L));                     // stream says version 2
        } catch (InvalidClassException e) {
            System.out.println("different UID -> InvalidClassException:");
            System.out.println("  " + e.getMessage().replaceAll("Main\\$", ""));
        }
    }
}`,
    walk:
      "`ObjectStreamClass.lookup` reports the serialVersionUID the JVM uses: 1 for `Order`, which declares it, and a large structural hash for `NoUid`, which does not. Serializing and deserializing `Order` with matching UIDs works.\n\nTo simulate data written by a different version of the class without editing source, the program patches the 8 UID bytes in the stream from 1 to 2. Deserializing it now fails with `InvalidClassException`, whose message shows the stream's UID and the local class's UID side by side.",
    anim: [
      "The version check",
      [
        ["stream", "byte stream", "UID = 2"],
        ["ois", "readObject()", "reads classdesc"],
        ["local", "local class", "UID = 1"],
        ["cmp", "UIDs equal?", "check"],
        ["err", "InvalidClass..", "mismatch"],
      ],
      [
        ["stream", "ois", "read", "The stream starts with a class descriptor that includes its serialVersionUID."],
        ["ois", "local", "lookup", "The JVM loads the local class and gets its serialVersionUID."],
        ["local", "cmp", "compare", "The two numbers are compared before any field is read."],
        ["cmp", "err", "differ", "If they differ, deserialization stops with InvalidClassException."],
      ],
    ],
    mistakes: [
      "Not declaring serialVersionUID, so adding a method breaks deserialization of stored data.",
      "Copying the same serialVersionUID while making incompatible changes, causing corrupt or confusing results.",
    ],
    qa: [
      ["What is serialVersionUID?", "A version identifier for a Serializable class, compared on deserialization to ensure the stream and the local class are compatible."],
      ["What happens if you do not declare serialVersionUID?", "The JVM computes one from the class structure, so most changes alter it and old streams fail with InvalidClassException."],
      ["How do you avoid InvalidClassException?", "Declare a fixed serialVersionUID and make only compatible changes, or bump it intentionally when old data must be rejected."],
    ],
    ex: [
      "You add a new field `String notes` to `Order` and keep serialVersionUID = 1. What happens when an old stream is read?",
      "It deserializes successfully: adding a field is a compatible change, and `notes` gets its default value null.",
    ],
  }),

  lesson("Compatible and Incompatible Class Changes", {
    intro:
      "Serialized data often outlives the code that wrote it. The Java serialization specification defines which class changes are compatible, meaning old streams can still be read when serialVersionUID is unchanged, and which are incompatible and break or corrupt deserialization. This lesson lists both and demonstrates reading an old stream into a changed class.",
    topics: [
      [
        "Compatible changes",
        "Adding fields (they get default values when reading old streams). Adding or removing methods. Adding classes to the hierarchy or `writeObject`/`readObject` methods. Changing a field from static to non-static or transient to non-transient (treated like adding a field). Changing access modifiers. Removing a field (its value in the stream is ignored).",
      ],
      [
        "Incompatible changes",
        "Deleting a field in a way that breaks invariants of old data (semantically). Changing a field's type (for example int to long or String to Integer): `InvalidClassException` or `ClassCastException`. Changing a non-static field to static or non-transient to transient (the value is effectively lost). Moving a class in the hierarchy or changing its superclass. Changing Serializable to Externalizable or vice versa. Changing `writeObject` to write different data without handling old formats.",
      ],
      [
        "serialVersionUID and changes",
        "Compatibility rules apply only if the serialVersionUID stays the same. With a generated UID, even compatible changes alter the number and fail. Declare the UID, keep it for compatible changes, and change it when you intend to reject old data.",
      ],
      [
        "Handling evolution",
        "Use `readObject` with `GetField` (`in.readFields()`) to read old field names and map them to new ones, provide defaults for added fields, or use `readResolve`. For long-lived data, a schema-based format (JSON with versioning, Avro, Protobuf) is easier to evolve.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.HashMap;
import java.util.Map;

public class Main {
    // Version 1 of the class, as it existed when old data was written.
    static class Customer1 implements Serializable {
        private static final long serialVersionUID = 42L;
        String name;
        int age;
        Customer1(String name, int age) { this.name = name; this.age = age; }
    }

    // Version 2 of the same class (same serialVersionUID), after compatible changes.
    static class Customer2 implements Serializable {
        private static final long serialVersionUID = 42L;
        String name;
        int age;
        String email;                 // added in v2: compatible
        transient String cache;       // transient field
        void greet() { }              // added method: compatible
        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
            ObjectInputStream.GetField fields = in.readFields();          // tolerant reading
            name = (String) fields.get("name", "unknown");
            age = fields.get("age", 0);
            email = (String) fields.get("email", name.toLowerCase() + "@example.com");   // default for old data
        }
    }

    // Writes a v1 object, then renames the class in the stream so it reads as v2 (same-length names).
    static byte[] streamFromV1() throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(new Customer1("Asha", 31)); }
        byte[] data = b.toByteArray();
        byte[] from = "Main$Customer1".getBytes(), to = "Main$Customer2".getBytes();
        for (int i = 0; i + from.length <= data.length; i++) {
            if (java.util.Arrays.equals(java.util.Arrays.copyOfRange(data, i, i + from.length), from)) {
                System.arraycopy(to, 0, data, i, to.length);
            }
        }
        return data;
    }

    public static void main(String[] args) throws Exception {
        byte[] stream = streamFromV1();
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(stream))) {
            Customer2 c = (Customer2) in.readObject();
            System.out.println("v1 data read into v2 class: " + c.name + ", " + c.age + ", email default = " + c.email);
        }

        Map<String, String> rules = new HashMap<>();
        rules.put("add a field", "compatible (default value)");
        rules.put("add or remove a method", "compatible");
        rules.put("remove a field", "compatible (stream value ignored)");
        rules.put("change field type int -> long", "INCOMPATIBLE");
        rules.put("make a field static or transient", "INCOMPATIBLE (value lost)");
        rules.put("change the superclass", "INCOMPATIBLE");
        rules.put("Serializable <-> Externalizable", "INCOMPATIBLE");
        rules.entrySet().stream().sorted(Map.Entry.comparingByKey())
                .forEach(e -> System.out.printf("  %-34s %s%n", e.getKey(), e.getValue()));

        ObjectStreamClass desc = ObjectStreamClass.lookup(Customer2.class);
        System.out.println("serializable fields: " + java.util.Arrays.stream(desc.getFields()).map(ObjectStreamField::getName).sorted().toList()
                + " (transient cache excluded)");
    }
}`,
    walk:
      "`Customer1` is the old version of the class and `Customer2` the new one; both declare serialVersionUID 42. The program writes a v1 object and renames the class inside the stream (the names have equal length), which reproduces exactly what happens when old saved data meets an upgraded class. `Customer2` added a field, a transient field and a method, all compatible changes.\n\nIts `readObject` uses `readFields()` and `GetField.get(name, default)`, which reads whatever fields the stream contains and supplies a default for missing ones, so a computed email fills the gap for the old data.\n\nThe table summarises which changes are compatible. `ObjectStreamClass` lists the fields that actually take part in serialization; the transient `cache` is excluded.",
    anim: [
      "Reading old data into a new class",
      [
        ["v1", "v1 stream", "name, age"],
        ["v2", "v2 class", "+ email"],
        ["uid", "same UID", "42 = 42"],
        ["get", "readFields()", "GetField"],
        ["obj", "Customer", "email default"],
      ],
      [
        ["v1", "uid", "check", "The stream and the new class share serialVersionUID 42, so reading proceeds."],
        ["v1", "get", "fields", "readFields() exposes exactly the fields that the old stream contains."],
        ["v2", "get", "missing", "The new email field is not in the stream, so a default is supplied."],
        ["get", "obj", "build", "The object is complete and valid even though it came from old data."],
      ],
    ],
    mistakes: [
      "Changing a field's type and keeping the same serialVersionUID.",
      "Relying on generated UIDs for classes whose data is stored.",
    ],
    qa: [
      ["What are compatible changes in serialization?", "Adding fields or methods, removing fields, adding writeObject/readObject, changing access modifiers, and changing static/transient fields to non-static/non-transient."],
      ["What are incompatible changes?", "Changing field types, making fields static or transient, changing the class hierarchy, switching between Serializable and Externalizable, and incompatible changes to writeObject output."],
      ["What value does a newly added field get when reading an old stream?", "Its default value (null, 0, false), unless readObject assigns something else."],
    ],
    ex: [
      "You rename field `age` to `years`. Is that compatible? How could readObject keep old data working?",
      "Renaming is effectively removing one field and adding another, so `years` would be 0. In readObject use `GetField` and set `years = fields.get(\"years\", fields.get(\"age\", 0))` if the old name exists.",
    ],
  }),

  lesson("Constructors During Deserialization", {
    intro:
      "Deserialization creates objects without calling the constructors of serializable classes, which surprises many developers. Constructors are called only for the first non-serializable superclass and its parents. This lesson explains exactly which constructors run, why, and what that means for initialisation logic.",
    topics: [
      [
        "Serializable class constructors are not called",
        "The JVM allocates the object and sets the serialized field values directly from the stream; no constructor of a Serializable class runs, and field initializers and instance blocks in those classes do not run either. That is why transient fields come back as default values even if they have initializers.",
      ],
      [
        "The first non-serializable superclass",
        "Walking up the hierarchy, the JVM finds the first superclass that does not implement Serializable (often `Object`) and calls its no-argument constructor, which also runs the constructors above it. Its fields are initialised by that constructor, not from the stream.",
      ],
      [
        "No-arg constructor requirement",
        "If that first non-serializable superclass has no accessible no-arg constructor, deserialization fails with `InvalidClassException: no valid constructor`. Serialization itself succeeds, so the problem appears only when reading.",
      ],
      [
        "Consequences",
        "Validation and setup in constructors are skipped for deserialized objects; put such logic in `readObject` or `readResolve`. Externalizable classes are the exception: their public no-arg constructor is always called.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class Base {                                   // NOT serializable
        protected String region;
        Base() { region = "default-region"; System.out.println("  Base() no-arg constructor ran"); }
        Base(String region) { this.region = region; System.out.println("  Base(region) ran"); }
    }

    static class Person extends Base implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        transient String greeting = "hello";             // initializer will not run on deserialization
        { System.out.println("  Person instance block ran"); }
        Person(String name) { super("south-asia"); this.name = name; System.out.println("  Person(name) constructor ran"); }
    }

    static class Employee extends Person {
        private static final long serialVersionUID = 1L;
        int empId;
        Employee(String name, int id) { super(name); empId = id; System.out.println("  Employee constructor ran"); }
    }

    static class NeedsArg { NeedsArg(int x) { } }
    static class Broken extends NeedsArg implements Serializable {
        private static final long serialVersionUID = 1L;
        Broken() { super(1); }
    }

    static Object roundTrip(Object o) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        System.out.println("creating with new:");
        Employee original = new Employee("Asha", 7);
        System.out.println("deserializing:");
        Employee copy = (Employee) roundTrip(original);
        System.out.println("name=" + copy.name + " empId=" + copy.empId + " (from stream)");
        System.out.println("region=" + copy.region + " (set by Base() because Base is not serializable)");
        System.out.println("greeting=" + copy.greeting + " (transient initializer skipped)");

        try {
            roundTrip(new Broken());
        } catch (InvalidClassException e) {
            System.out.println("non-serializable parent without no-arg constructor -> InvalidClassException: no valid constructor = "
                    + e.getMessage().contains("no valid constructor"));
        }
    }
}`,
    walk:
      "Creating the employee with `new` runs `Base(region)`, the `Person` instance block, `Person`'s constructor and `Employee`'s constructor. Deserializing runs only `Base()`, the no-arg constructor of the first non-serializable superclass; nothing in `Person` or `Employee` runs.\n\nTherefore `name` and `empId` come from the stream, `region` is \"default-region\" (set by `Base()`, because Base's fields are not serialized), and the transient `greeting` is null despite its initializer. `Broken` extends a non-serializable class with no no-arg constructor, so reading it fails with \"no valid constructor\".",
    anim: [
      "Which constructor runs?",
      [
        ["obj", "Object", "not serializable"],
        ["base", "Base", "not serializable"],
        ["person", "Person", "Serializable"],
        ["emp", "Employee", "Serializable"],
        ["stream", "stream values", "name, empId"],
      ],
      [
        ["emp", "person", "skip", "Employee and Person are serializable, so their constructors are skipped."],
        ["person", "base", "first", "Base is the first non-serializable superclass."],
        ["base", "obj", "run", "Its no-arg constructor (and Object's) runs, initialising Base's fields."],
        ["stream", "emp", "restore", "Serializable fields such as name and empId are then filled from the stream."],
      ],
    ],
    mistakes: [
      "Putting essential initialisation in constructors of serializable classes and expecting it after deserialization.",
      "Extending a non-serializable class without a no-arg constructor.",
      "Expecting transient fields to keep their initializer values.",
    ],
    qa: [
      ["Is the constructor called during deserialization?", "Not for Serializable classes; only the no-arg constructor of the first non-serializable superclass (and its parents) runs."],
      ["What happens if the non-serializable parent has no no-arg constructor?", "Deserialization fails with InvalidClassException: no valid constructor."],
      ["Are superclass fields serialized if the superclass is not Serializable?", "No. They are initialised by its no-arg constructor during deserialization."],
    ],
    ex: [
      "How would you ensure `greeting` is \"hello\" after deserialization?",
      "Add `private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException { in.defaultReadObject(); greeting = \"hello\"; }`, or compute it lazily in a getter.",
    ],
  }),

  lesson("static, transient and Primitive Fields in Serialization", {
    intro:
      "Not every field is serialized. Static fields belong to the class, not the object, and transient fields are excluded on purpose. Primitive and wrapper fields are serialized, but their default values after deserialization differ when they are excluded. This lesson shows exactly what happens to static, transient, primitive and wrapper fields.",
    topics: [
      [
        "static fields are not serialized",
        "Serialization captures object state; static fields are class state. After deserialization, a static field has whatever value the class currently has in that JVM (possibly changed since serialization), not the value at the time of writing.",
      ],
      [
        "transient fields are not serialized",
        "Mark fields `transient` for data that should not be persisted: passwords, caches, derived values, references to non-serializable resources (threads, sockets, connections). After deserialization they hold default values: null, 0 or false. Initializers do not run (no constructor runs).",
      ],
      [
        "Primitives are serialized",
        "Primitive fields (`int`, `double`, `boolean`) are written as raw values and restored exactly. Wrapper fields (`Integer`) are written as objects.",
      ],
      [
        "int vs Integer default values when not serialized",
        "If a field is transient (or missing from an old stream), a primitive `int` comes back as 0 while an `Integer` comes back as null. Choose wrappers when \"not known\" must be distinguishable from 0, and beware unboxing such nulls.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class Session implements Serializable {
        private static final long serialVersionUID = 1L;
        static String serverName = "server-A";          // class state: not serialized
        String user;                                     // serialized
        int loginCount;                                  // primitive: serialized
        Integer lastRating;                              // wrapper: serialized
        transient String password;                       // excluded
        transient int cachedScore = 99;                  // excluded: comes back 0
        transient Integer cachedRank = 5;                // excluded: comes back null
        transient boolean dirty = true;                  // excluded: comes back false
        Session(String user) { this.user = user; loginCount = 3; lastRating = 4; password = "pw"; }
    }

    public static void main(String[] args) throws Exception {
        Session s = new Session("asha");
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(s); }

        Session.serverName = "server-B";                 // changed after serialization

        Session copy;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            copy = (Session) in.readObject();
        }
        System.out.println("user=" + copy.user + ", loginCount=" + copy.loginCount + ", lastRating=" + copy.lastRating + "  (serialized)");
        System.out.println("password=" + copy.password + "  (transient reference -> null)");
        System.out.println("cachedScore=" + copy.cachedScore + "  (transient int -> 0, initializer skipped)");
        System.out.println("cachedRank=" + copy.cachedRank + "  (transient Integer -> null)");
        System.out.println("dirty=" + copy.dirty + "  (transient boolean -> false)");
        System.out.println("serverName=" + Session.serverName + "  (static: current class value, never serialized)");
        System.out.println("password text in stream: " + new String(bytes.toByteArray(), "ISO-8859-1").contains("pw\u0000"));
        try {
            int rank = copy.cachedRank;                   // unboxing null
        } catch (NullPointerException e) {
            System.out.println("unboxing the null Integer -> NullPointerException");
        }
    }
}`,
    walk:
      "`user`, the primitive `loginCount` and the wrapper `lastRating` are serialized and restored exactly. The transient fields come back with type defaults: `password` and the `Integer` are null, the `int` is 0 and the `boolean` is false, even though they had initializers, because no constructor or initializer runs during deserialization.\n\nThe static `serverName` was changed to \"server-B\" after serialization, and the deserialized object sees \"server-B\": static values are never part of the stream. Unboxing the null `Integer` shows why wrapper defaults need care.",
    anim: [
      "What gets written",
      [
        ["obj", "Session", "object"],
        ["normal", "user, loginCount", "written"],
        ["trans", "transient fields", "skipped"],
        ["stat", "static field", "class state"],
        ["copy", "deserialized", "defaults"],
      ],
      [
        ["obj", "normal", "serialize", "Ordinary instance fields, primitive or object, are written to the stream."],
        ["obj", "trans", "skip", "Transient fields are skipped, so they come back as null, 0 or false."],
        ["stat", "copy", "not stored", "Static fields are not part of any object, so the class's current value is seen."],
        ["normal", "copy", "restore", "Only the written fields are restored from the stream."],
      ],
    ],
    mistakes: [
      "Expecting a transient field's initializer value after deserialization.",
      "Storing per-object data in static fields and expecting it to travel with the object.",
      "Unboxing transient or newly added wrapper fields without a null check.",
    ],
    qa: [
      ["Are static fields serialized?", "No. They belong to the class; after deserialization the object sees the current static value in that JVM."],
      ["What is the transient keyword?", "A field modifier that excludes the field from default serialization; it is restored as its default value."],
      ["What value does a transient int get after deserialization, and a transient Integer?", "0 for int, null for Integer."],
    ],
    ex: [
      "A `transient List<String> recent = new ArrayList<>()` causes NullPointerException after deserialization. Fix it.",
      "Re-create it in `readObject` after `defaultReadObject()` (`recent = new ArrayList<>();`), or initialise it lazily in a getter.",
    ],
  }),

  lesson("Serializing Collections: List, Set and Map", {
    intro:
      "The standard collection classes are serializable, so a whole `ArrayList`, `HashSet` or `HashMap` can be written with one `writeObject` call, as long as every element is serializable too. This lesson serializes lists, sets and maps, shows how custom collection serialization works (HashMap writes entries, not buckets), and covers pitfalls such as views and unmodifiable wrappers.",
    topics: [
      [
        "Collections are Serializable",
        "`ArrayList`, `LinkedList`, `HashSet`, `LinkedHashSet`, `TreeSet`, `HashMap`, `LinkedHashMap`, `TreeMap`, `ArrayDeque` and the immutable `List.of`/`Map.of` collections all implement Serializable. Writing the collection writes its elements recursively; each must be Serializable or you get `NotSerializableException`.",
      ],
      [
        "How collections serialize themselves",
        "They use custom `writeObject`/`readObject`. `ArrayList` writes its size and elements, not its spare capacity. `HashMap` writes the number of entries and each key-value pair, then rebuilds the table on reading, which is necessary because hash codes may differ in another JVM. `TreeMap` also serializes its comparator, which must be serializable.",
      ],
      [
        "Order and type preservation",
        "The concrete class is restored: a `LinkedHashMap` comes back as a `LinkedHashMap` with the same order, and a `TreeSet` with its sorting. Shared elements within one stream stay shared.",
      ],
      [
        "Pitfalls",
        "Views such as `map.keySet()` or `list.subList()` may not be serializable or may drag the whole backing collection along. A `TreeMap` with a lambda comparator fails unless the lambda's target type is also Serializable. Deserializing huge collections from untrusted input can exhaust memory; filters can limit array lengths and depth.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.*;

public class Main {
    record Product(String sku, int price) implements Serializable { }

    static Object roundTrip(Object o) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        Product pen = new Product("pen", 10);
        List<Product> list = new ArrayList<>(List.of(pen, new Product("ink", 45), pen));
        @SuppressWarnings("unchecked")
        List<Product> listCopy = (List<Product>) roundTrip(list);
        System.out.println("ArrayList: " + listCopy + ", shared element kept: " + (listCopy.get(0) == listCopy.get(2)));

        Set<String> tags = new TreeSet<>(Comparator.reverseOrder());
        tags.addAll(List.of("java", "io", "streams"));
        Object setCopy = roundTrip(tags);
        System.out.println("TreeSet with comparator: " + setCopy + " (" + setCopy.getClass().getSimpleName() + ")");

        Map<String, Integer> stock = new LinkedHashMap<>();
        stock.put("zebra pen", 5); stock.put("apple ink", 9); stock.put("mango pad", 2);
        Object mapCopy = roundTrip(stock);
        System.out.println("LinkedHashMap order kept: " + mapCopy + " (" + mapCopy.getClass().getSimpleName() + ")");

        Map<Product, List<String>> nested = new HashMap<>(Map.of(pen, List.of("blue", "black")));
        @SuppressWarnings("unchecked")
        Map<Product, List<String>> nestedCopy = (Map<Product, List<String>>) roundTrip(nested);
        System.out.println("HashMap with record keys and list values: lookup works = " + nestedCopy.get(new Product("pen", 10)));

        System.out.println("immutable List.of survives: " + roundTrip(List.of(1, 2, 3)));

        List<Object> withBadElement = new ArrayList<>(List.of("ok", new Object()));
        try {
            roundTrip(withBadElement);
        } catch (NotSerializableException e) {
            System.out.println("element not serializable -> NotSerializableException: " + e.getMessage());
        }
        Map<String, Integer> lambdaSorted = new TreeMap<>((a, b) -> b.compareTo(a));
        try {
            roundTrip(lambdaSorted);
        } catch (NotSerializableException e) {
            System.out.println("TreeMap with a plain lambda comparator -> NotSerializableException");
        }
    }
}`,
    walk:
      "An `ArrayList` containing the same product twice comes back with the two references still pointing to one object. A `TreeSet` with a reverse-order comparator keeps its sorting (the JDK's reverse comparator is serializable), and a `LinkedHashMap` keeps its insertion order and concrete class.\n\nA `HashMap` with record keys is rebuilt on reading, so lookups with an equal new key work. Immutable `List.of` collections serialize too. A list containing a plain `Object` fails with `NotSerializableException`, and so does a `TreeMap` whose comparator is an ordinary lambda.",
    anim: [
      "How HashMap serializes",
      [
        ["map", "HashMap", "buckets"],
        ["write", "writeObject", "custom"],
        ["entries", "size + entries", "k1, v1, k2, v2"],
        ["read", "readObject", "custom"],
        ["rebuild", "new table", "rehash keys"],
      ],
      [
        ["map", "write", "serialize", "HashMap's private writeObject is called instead of dumping its internal array."],
        ["write", "entries", "write", "It writes the entry count followed by each key and value."],
        ["entries", "read", "deserialize", "readObject reads the pairs back one by one."],
        ["read", "rebuild", "put", "Each key is rehashed into a fresh table, because hash codes may differ per JVM."],
      ],
    ],
    mistakes: [
      "Putting non-serializable elements into collections that get serialized.",
      "Using lambdas as TreeMap or TreeSet comparators in serialized collections.",
      "Serializing a subList or keySet view and getting the backing collection or an exception.",
    ],
    qa: [
      ["Can you serialize an ArrayList?", "Yes. ArrayList is Serializable, and it serializes its size and elements; each element must be Serializable."],
      ["Why does HashMap implement custom serialization?", "Bucket positions depend on hash codes, which may differ between JVMs, so it writes key-value pairs and rebuilds the table when reading."],
      ["What happens if a collection contains a non-serializable element?", "writeObject throws NotSerializableException naming the element's class."],
    ],
    ex: [
      "Make the TreeMap with a lambda comparator serializable without writing a named class.",
      "Cast the lambda to an intersection type: `new TreeMap<String, Integer>((Comparator<String> & Serializable) (a, b) -> b.compareTo(a))`, or use `Comparator.reverseOrder()`.",
    ],
  }),

  lesson("Singleton and Serialization", {
    intro:
      "A singleton guarantees one instance per JVM, but deserialization creates a new object every time, silently breaking the guarantee. This lesson shows how serialization breaks a singleton, how `readResolve` prevents a second instance while preserving state, and why the enum singleton is immune.",
    topics: [
      [
        "How deserialization breaks a singleton",
        "`readObject` allocates a new instance of the class (bypassing the private constructor) and fills its fields from the stream. After serializing and deserializing the singleton, `deserialized == Singleton.getInstance()` is false: there are two instances.",
      ],
      [
        "readResolve",
        "Define `private Object readResolve() { return INSTANCE; }` (it may also be protected for subclassing). After deserialization creates its temporary object, the mechanism calls readResolve and returns its result to the caller instead, so the stream object is discarded and the real singleton is used.",
      ],
      [
        "Preserving state",
        "If the singleton's state should be updated from the stream, copy the relevant fields from `this` (the temporary deserialized object) into INSTANCE inside readResolve before returning INSTANCE. Usually singleton state is runtime state and should simply be marked transient.",
      ],
      [
        "Enum singletons",
        "Enum constants are serialized by name, and deserialization looks up the existing constant with `valueOf`, so an enum singleton can never be duplicated by serialization (or by reflection). Custom `writeObject`/`readObject` are ignored for enums.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class BrokenSingleton implements Serializable {
        private static final long serialVersionUID = 1L;
        static final BrokenSingleton INSTANCE = new BrokenSingleton();
        private BrokenSingleton() { }
    }

    static class SafeSingleton implements Serializable {
        private static final long serialVersionUID = 1L;
        static final SafeSingleton INSTANCE = new SafeSingleton();
        private int configVersion = 1;
        private SafeSingleton() { }
        int configVersion() { return configVersion; }
        void setConfigVersion(int v) { configVersion = v; }

        private Object readResolve() {
            INSTANCE.configVersion = Math.max(INSTANCE.configVersion, this.configVersion);   // preserve state if desired
            return INSTANCE;                                                                 // never a second instance
        }
    }

    enum Registry { INSTANCE; int hits; }

    static Object roundTrip(Object o) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        Object copy = roundTrip(BrokenSingleton.INSTANCE);
        System.out.println("without readResolve, same instance: " + (copy == BrokenSingleton.INSTANCE) + "  <- singleton broken");

        SafeSingleton.INSTANCE.setConfigVersion(3);
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(SafeSingleton.INSTANCE); }
        SafeSingleton.INSTANCE.setConfigVersion(1);                      // state changed after saving
        SafeSingleton restored;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) {
            restored = (SafeSingleton) in.readObject();
        }
        System.out.println("with readResolve, same instance: " + (restored == SafeSingleton.INSTANCE)
                + ", preserved configVersion: " + SafeSingleton.INSTANCE.configVersion());

        Registry.INSTANCE.hits = 10;
        Object enumCopy = roundTrip(Registry.INSTANCE);
        System.out.println("enum singleton, same instance: " + (enumCopy == Registry.INSTANCE) + ", hits: " + ((Registry) enumCopy).hits);
    }
}`,
    walk:
      "Serializing `BrokenSingleton.INSTANCE` and reading it back yields a second, different object, so the singleton guarantee is gone.\n\n`SafeSingleton` defines `readResolve`. Deserialization still creates a temporary object from the stream, but `readResolve` copies the saved `configVersion` (3) into the real instance and returns `INSTANCE`, so the caller receives the one true singleton with the preserved state. The enum singleton is serialized by name and resolves to the existing constant automatically; its `hits` field is not even part of the stream, so it simply shows the live value.",
    anim: [
      "readResolve swaps the result",
      [
        ["stream", "byte stream", "singleton data"],
        ["temp", "temporary obj", "new instance"],
        ["resolve", "readResolve()", "your hook"],
        ["inst", "INSTANCE", "the real one"],
        ["caller", "caller", "receives"],
      ],
      [
        ["stream", "temp", "readObject", "Deserialization always builds a new temporary object from the stream."],
        ["temp", "resolve", "call", "If the class defines readResolve, the mechanism calls it on that object."],
        ["resolve", "inst", "return", "readResolve can copy state into INSTANCE and returns INSTANCE."],
        ["inst", "caller", "result", "The caller gets the singleton; the temporary object becomes garbage."],
      ],
    ],
    mistakes: [
      "Making a singleton Serializable without readResolve.",
      "Declaring readResolve with the wrong signature (it must return Object).",
      "Keeping non-transient mutable state in a singleton that may be serialized.",
    ],
    qa: [
      ["How does serialization break a singleton?", "Deserialization creates a new instance without calling the private constructor, so there are two instances."],
      ["How do you prevent it?", "Implement readResolve() returning the existing instance, or use an enum singleton."],
      ["Why is an enum singleton safe from serialization?", "Enums are serialized by name and deserialized with valueOf, which returns the existing constant."],
    ],
    ex: [
      "Besides serialization, name two other ways a class-based singleton can be broken, and one way to defend against each.",
      "Reflection (call the private constructor; defend by throwing in the constructor if INSTANCE already exists) and cloning (defend by not implementing Cloneable or overriding clone to throw or return INSTANCE).",
    ],
  }),

  lesson("Deep Copy Using Serialization", {
    intro:
      "Serialization can produce a deep copy of an object graph in a few lines: write the object to a byte array and read it back. Every reachable object is duplicated and internal links between them are preserved. This lesson implements the technique generically, verifies the copy is independent, and weighs its costs against copy constructors.",
    topics: [
      [
        "The technique",
        "Write the object with an `ObjectOutputStream` over a `ByteArrayOutputStream`, then read it back with an `ObjectInputStream` over a `ByteArrayInputStream`. The result is a brand-new graph: no object in it is shared with the original.",
      ],
      [
        "What is preserved",
        "All non-transient field values, nested objects and collections, and the structure of the graph: if two fields referred to one object, the copy's fields refer to one copied object; cycles are reproduced correctly.",
      ],
      [
        "Requirements and costs",
        "Every class in the graph must be Serializable. Transient fields become defaults. It is much slower than a hand-written copy (reflection, byte encoding, allocation), so avoid it in hot paths. Singletons need readResolve, and the copy goes through the same security considerations as any deserialization (only use it on your own objects).",
      ],
      [
        "Alternatives",
        "Copy constructors or static factories (fastest and most explicit), deep `clone()` implementations, mapping libraries, or immutable designs that avoid copying altogether.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Address implements Serializable {
        private static final long serialVersionUID = 1L;
        String city;
        Address(String city) { this.city = city; }
    }

    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        Address home, office;
        List<String> skills = new ArrayList<>();
        Employee mentor;
        transient String sessionToken = "abc";
        Employee(String name, Address home) { this.name = name; this.home = home; this.office = home; }
    }

    @SuppressWarnings("unchecked")
    static <T extends Serializable> T deepCopy(T original) {
        try {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(original); }
            try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
                return (T) in.readObject();
            }
        } catch (IOException | ClassNotFoundException e) {
            throw new IllegalStateException("deep copy failed", e);
        }
    }

    public static void main(String[] args) {
        Employee asha = new Employee("Asha", new Address("Pune"));
        asha.skills.add("Java");
        asha.mentor = asha;                                    // a cycle: she mentors herself

        Employee copy = deepCopy(asha);
        copy.name = "Asha (copy)";
        copy.home.city = "Mumbai";
        copy.skills.add("Kafka");

        System.out.println("original: " + asha.name + ", " + asha.home.city + ", " + asha.skills);
        System.out.println("copy:     " + copy.name + ", " + copy.home.city + ", " + copy.skills);
        System.out.println("nested objects are new: home " + (copy.home != asha.home) + ", skills " + (copy.skills != asha.skills));
        System.out.println("shared reference preserved inside the copy: home == office " + (copy.home == copy.office));
        System.out.println("cycle preserved: copy.mentor == copy " + (copy.mentor == copy));
        System.out.println("transient field not copied: " + copy.sessionToken);

        long start = System.nanoTime();
        for (int i = 0; i < 2_000; i++) deepCopy(asha);
        long serMs = (System.nanoTime() - start) / 1_000_000;
        System.out.println("2,000 serialization copies took measurable time: " + (serMs >= 0) + " (much slower than a copy constructor)");
    }
}`,
    walk:
      "`deepCopy` serializes the employee into a byte array and reads it back, giving a completely new object graph. Changing the copy's name, city and skills leaves the original untouched, because the `Address` and the `List` were duplicated too.\n\nStructure is preserved: in the original, `home` and `office` are the same object, and in the copy they are still one (copied) object; the self-referencing `mentor` cycle is reproduced. The transient `sessionToken` is null in the copy. The timing loop is a reminder that this convenience costs much more than a hand-written copy.",
    anim: [
      "Deep copy through bytes",
      [
        ["orig", "original graph", "Employee + Address"],
        ["out", "ObjectOutput..", "to byte[]"],
        ["bytes", "byte[]", "in memory"],
        ["in", "ObjectInput..", "from byte[]"],
        ["copy", "new graph", "all new objects"],
      ],
      [
        ["orig", "out", "write", "The whole reachable graph is serialized into a byte array."],
        ["out", "bytes", "encode", "Shared references and cycles are encoded once, by handle."],
        ["bytes", "in", "read", "Reading the bytes back creates fresh objects for every node."],
        ["in", "copy", "result", "The copy shares nothing with the original but keeps its internal structure."],
      ],
    ],
    mistakes: [
      "Using serialization-based copying in performance-critical loops.",
      "Forgetting that transient fields are not copied.",
      "Applying it to graphs containing non-serializable objects.",
    ],
    qa: [
      ["How do you deep copy an object using serialization?", "Write it to a ByteArrayOutputStream with ObjectOutputStream and read it back from a ByteArrayInputStream with ObjectInputStream."],
      ["What are the drawbacks?", "All classes must be Serializable, it is slow, transient fields are lost, and it bypasses constructors."],
      ["Does it preserve shared references and cycles?", "Yes. Each object is written once and referenced by handle, so the copy has the same structure."],
    ],
    ex: [
      "Would `deepCopy` work on a `List<Thread>`? Why or why not?",
      "No. Thread is not Serializable, so writeObject throws NotSerializableException.",
    ],
  }),

  lesson("NotSerializableException and Preventing Subclass Serialization", {
    intro:
      "`NotSerializableException` is the most common serialization failure: some object in the graph does not implement Serializable. The opposite problem also occurs: a subclass inherits Serializable from its parent but must not be serialized. This lesson covers how to find and fix the first, and how a subclass can block serialization for the second.",
    topics: [
      [
        "NotSerializableException",
        "Thrown by `writeObject` when it reaches an object whose class does not implement Serializable. The message names the class. Common culprits: loggers, threads, streams, sockets, database connections, lambdas, anonymous inner classes (they capture the enclosing object) and third-party types.",
      ],
      [
        "Fixing it",
        "Make the member's class Serializable if it is your own data class; mark the field `transient` and re-create it after deserialization (in readObject or lazily); replace it with a serializable representation (a file path instead of a stream); or make inner classes static so they do not capture the outer object.",
      ],
      [
        "Can a subclass avoid serialization?",
        "Serializable is inherited, so a subclass of a serializable class is serializable. To prevent it, the subclass can define private `writeObject` and `readObject` (and `readObjectNoData`) that throw `NotSerializableException`, so any attempt to serialize or deserialize it fails.",
      ],
      [
        "Debugging large graphs",
        "Run with `-Dsun.io.serialization.extendedDebugInfo=true` to get the path to the offending field in the exception message, which helps when the non-serializable object is buried deep in the graph.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class Logger { void log(String m) { } }            // not serializable

    static class Report implements Serializable {
        private static final long serialVersionUID = 1L;
        String title = "Q3";
        Logger logger = new Logger();                          // will break serialization
    }

    static class FixedReport implements Serializable {
        private static final long serialVersionUID = 1L;
        String title = "Q3";
        transient Logger logger = new Logger();                // excluded
        Logger logger() { if (logger == null) logger = new Logger(); return logger; }   // rebuilt lazily
    }

    static class Document implements Serializable {
        private static final long serialVersionUID = 1L;
        String text = "public data";
    }

    static class SecretDocument extends Document {              // inherits Serializable, must not be serialized
        private static final long serialVersionUID = 1L;
        String classified = "launch codes";
        private void writeObject(ObjectOutputStream out) throws IOException {
            throw new NotSerializableException("SecretDocument must not be serialized");
        }
        private void readObject(ObjectInputStream in) throws IOException {
            throw new NotSerializableException("SecretDocument must not be deserialized");
        }
    }

    static Object roundTrip(Object o) throws Exception {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) { return in.readObject(); }
    }

    public static void main(String[] args) throws Exception {
        try {
            roundTrip(new Report());
        } catch (NotSerializableException e) {
            System.out.println("Report -> NotSerializableException: " + e.getMessage());
        }

        FixedReport fixed = (FixedReport) roundTrip(new FixedReport());
        System.out.println("FixedReport serialized: title " + fixed.title + ", logger after load " + fixed.logger
                + ", rebuilt on demand " + (fixed.logger() != null));

        System.out.println("plain Document serializes: " + ((Document) roundTrip(new Document())).text);
        try {
            roundTrip(new SecretDocument());
        } catch (NotSerializableException e) {
            System.out.println("SecretDocument blocked: " + e.getMessage());
        }

        Runnable lambda = () -> System.out.println("x");
        try {
            roundTrip(lambda);
        } catch (NotSerializableException e) {
            System.out.println("plain lambda -> NotSerializableException");
        }
    }
}`,
    walk:
      "`Report` holds a `Logger`, which is not serializable, so `writeObject` throws `NotSerializableException` naming `Main$Logger`. `FixedReport` marks the logger transient and rebuilds it lazily: serialization succeeds, the field is null right after loading, and the getter recreates it.\n\n`SecretDocument` inherits Serializable from `Document`, but its private `writeObject` throws `NotSerializableException`, so any attempt to serialize it fails while ordinary `Document`s still work. Finally, an ordinary lambda is not serializable either.",
    anim: [
      "Where serialization fails",
      [
        ["report", "Report", "Serializable"],
        ["title", "title", "String: ok"],
        ["logger", "Logger", "not Serializable"],
        ["nse", "NotSerializable", "thrown"],
        ["fix", "transient", "skip field"],
      ],
      [
        ["report", "title", "write", "writeObject serializes the String field without trouble."],
        ["report", "logger", "write", "Then it reaches the Logger field and checks its class."],
        ["logger", "nse", "fail", "Logger does not implement Serializable, so NotSerializableException is thrown."],
        ["fix", "logger", "fix", "Marking the field transient skips it; rebuild it after deserialization."],
      ],
    ],
    mistakes: [
      "Serializing objects that hold infrastructure (loggers, connections, threads) without transient.",
      "Using non-static inner classes or lambdas inside serializable classes.",
      "Assuming a subclass is not serializable just because it does not declare `implements Serializable`.",
    ],
    qa: [
      ["When is NotSerializableException thrown?", "When writeObject encounters an object whose class does not implement Serializable."],
      ["How can you serialize a class with a non-serializable field?", "Mark the field transient (and restore it after deserialization) or replace it with a serializable representation."],
      ["How can a subclass of a Serializable class prevent serialization?", "By defining private writeObject and readObject methods that throw NotSerializableException."],
    ],
    ex: [
      "A serializable `Cart` has a field `Comparator<Item> sorter = (a, b) -> a.price - b.price;`. Why does saving the cart fail, and what are two fixes?",
      "The lambda is not serializable. Mark the field transient and recreate it, or declare it as `(Comparator<Item> & Serializable) (a, b) -> ...` (or use a static nested comparator class implementing Serializable).",
    ],
  }),

  lesson("Serialization Interview Questions", {
    intro:
      "Serialization questions test your understanding of object graphs, versioning and the JVM's special hooks. This lesson gathers the most common questions and answers, and the program demonstrates a few classic follow-ups: what happens to superclass fields, whether a serialized object keeps its identity, and the order of special methods.",
    topics: [
      [
        "Core questions",
        "What serialization is; Serializable as a marker interface; serialVersionUID and InvalidClassException; transient and static; constructors during deserialization; Serializable vs Externalizable; custom writeObject/readObject; readResolve and writeReplace.",
      ],
      [
        "Tricky questions",
        "If the parent is Serializable is the child too (yes); if the child is Serializable but the parent is not, what happens to parent fields (initialised by the parent's no-arg constructor); can you serialize static fields (no); is the deserialized object the same object (no, unless readResolve returns an existing one); does serialization preserve identity of shared references (yes, within one stream); what does `writeReplace` do (substitutes another object to serialize, used by serialization proxies).",
      ],
      [
        "Modern perspective",
        "Java serialization is considered legacy for data exchange because of security problems and brittleness. Mention serialization filters (`ObjectInputFilter`, Java 9), the serialization proxy pattern, records (serialized through their canonical constructor, which makes them safer), and alternatives like JSON or Protobuf.",
      ],
    ],
    code: String.raw`import java.io.*;

public class Main {
    static class Parent { int parentValue = 5; Parent() { parentValue = 1; } }      // not serializable

    static class Child extends Parent implements Serializable {
        private static final long serialVersionUID = 1L;
        int childValue = 7;
        private Object writeReplace() { System.out.println("  1. writeReplace (choose what to write)"); return this; }
        private void writeObject(ObjectOutputStream out) throws IOException { System.out.println("  2. writeObject"); out.defaultWriteObject(); }
        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException { System.out.println("  3. readObject"); in.defaultReadObject(); }
        private Object readResolve() { System.out.println("  4. readResolve (choose what to return)"); return this; }
    }

    record Point(int x, int y) implements Serializable {
        Point {                                                 // records deserialize through this constructor
            if (x < 0) throw new IllegalArgumentException("x must be >= 0");
        }
    }

    public static void main(String[] args) throws Exception {
        Child c = new Child();
        c.parentValue = 99;
        c.childValue = 42;
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(c); out.writeObject(c); }
        Child r1, r2;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) {
            r1 = (Child) in.readObject();
            r2 = (Child) in.readObject();
        }
        System.out.println("childValue " + r1.childValue + " (serialized), parentValue " + r1.parentValue + " (parent not serializable: its constructor ran)");
        System.out.println("same object written twice in one stream -> read back as one object: " + (r1 == r2) + "; but a new object vs original: " + (r1 != c));

        ByteArrayOutputStream pb = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(pb)) { out.writeObject(new Point(3, 4)); }
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(pb.toByteArray()))) {
            System.out.println("record round trip: " + in.readObject() + " (validated by its canonical constructor)");
        }

        ObjectInputFilter filter = ObjectInputFilter.Config.createFilter("Main$Point;!*");
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(b.toByteArray()))) {
            in.setObjectInputFilter(filter);
            in.readObject();
        } catch (InvalidClassException e) {
            System.out.println("ObjectInputFilter rejected an unexpected class: " + e.getMessage().contains("REJECTED"));
        }
    }
}`,
    walk:
      "Serializing `Child` prints the special methods in the order they run: `writeReplace`, then `writeObject` (once, although the object is written twice, because the second write is just a back-reference), then on reading `readObject` and `readResolve`. `childValue` is restored from the stream, while `parentValue` is 1: `Parent` is not serializable, so its constructor ran instead of the saved value 99.\n\nThe same object written twice into one stream comes back as one object, but it is a different object from the original. A record is rebuilt through its canonical constructor, so its validation runs. Finally an `ObjectInputFilter` that allows only `Point` rejects the `Child` stream.",
    anim: [
      "Order of the special methods",
      [
        ["wr", "writeReplace", "1: substitute?"],
        ["wo", "writeObject", "2: write fields"],
        ["bytes", "stream", "bytes"],
        ["ro", "readObject", "3: read fields"],
        ["rr", "readResolve", "4: substitute?"],
      ],
      [
        ["wr", "wo", "then", "writeReplace may return a different object to serialize; then writeObject writes it."],
        ["wo", "bytes", "encode", "The chosen object's fields are encoded into the stream."],
        ["bytes", "ro", "decode", "On reading, readObject rebuilds the fields of a new object."],
        ["ro", "rr", "finally", "readResolve may replace the new object with another, such as a singleton."],
      ],
    ],
    mistakes: [
      "Saying the deserialized object is the same object; it is a new one unless readResolve returns an existing instance.",
      "Forgetting that superclass fields of a non-serializable parent are not restored.",
    ],
    qa: [
      ["If a parent class is Serializable, is the child Serializable?", "Yes. Serializable is inherited."],
      ["If a child is Serializable but its parent is not, what happens to the parent's fields?", "They are not serialized; on deserialization the parent's no-arg constructor initialises them."],
      ["What is writeReplace?", "A hook that lets an object nominate a different object to be serialized in its place, used for the serialization proxy pattern."],
      ["How do you defend against deserialization attacks?", "Avoid deserializing untrusted data, use ObjectInputFilter allow-lists, prefer records or serialization proxies, or use a different format."],
      ["Are records serializable?", "If they implement Serializable; they are serialized by components and deserialized through the canonical constructor, which runs validation."],
    ],
    ex: [
      "Two separate `ObjectOutputStream`s each write the same object, and two separate input streams read them. Are the two results the same object?",
      "No. Shared identity is preserved only within one stream; separate streams produce two independent copies.",
    ],
  }),
]);
