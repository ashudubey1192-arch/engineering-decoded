import { lesson, section } from "../schema.js";

// Interview Q&A: serialization (Q1-Q24).
export default section("interview-serialization", "Interview Q&A: Serialization", [
  lesson("Serialization Q1-Q10: Basics, Externalizable, Custom writeObject, serialVersionUID and Compatibility", {
    intro:
      "Serialization questions 1 to 10 cover:\n\n- what serialization is, and how to serialize an object to a file\n- Externalizable vs Serializable\n- customising the process with writeObject and readObject\n- implementing Externalizable\n- keeping members out of the stream\n- serialVersionUID, and the impact of not declaring it\n- compatible and incompatible changes\n- alternatives for sending objects over a network\n\nThe program writes real files to a temporary directory, and simulates a class evolving between versions.",
    topics: [
      [
        "Q1. What is serialization?",
        "Serialization converts an **object's state into a byte stream**, so that it can be stored (a file or database) or transmitted (a socket, a cache, a message queue). **Deserialization** rebuilds a copy of the object, and the whole graph it references, from that stream. A class opts in by implementing the marker interface `java.io.Serializable`. The stream records:\n\n- the class name and serialVersionUID\n- the field descriptions\n- the values of all non-static, non-transient fields, including those inherited from serializable superclasses\n\nObjects referenced several times are written once (back-references), so cycles work. Java's built-in serialization is considered legacy for data exchange because of its security risks; see Q10.",
      ],
      [
        "Q2. How do you serialize and deserialize an object to a file?",
        "1. Make the class implement Serializable and declare a `serialVersionUID`.\n2. Write it: `try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream(\"emp.ser\"))) { out.writeObject(emp); }`.\n3. Read it back: `try (ObjectInputStream in = new ObjectInputStream(new FileInputStream(\"emp.ser\"))) { Employee e = (Employee) in.readObject(); }`.\n\n`readObject` throws ClassNotFoundException if the class is not on the classpath, InvalidClassException if the UIDs differ, and other IOExceptions. Wrap the file streams in Buffered streams for large graphs.",
      ],
      [
        "Q3. What is the difference between Externalizable and Serializable?",
        "- **Control**: Serializable serialization is automatic and reflective, and can be customised with private hooks. Externalizable gives full control: you write `writeExternal(ObjectOutput)` and `readExternal(ObjectInput)` yourself.\n- **Methods**: Serializable is a marker with no methods. Externalizable has two mandatory methods.\n- **Constructor**: Serializable uses no constructor of the class (only the no-arg constructor of the first non-serializable superclass). Externalizable needs a **public no-arg constructor**, called before `readExternal`.\n- **Superclass state**: Serializable handles it automatically. With Externalizable, you must write it yourself.\n- **Performance and size**: Externalizable can be faster and smaller, because only what you choose is written, without field metadata.\n- **Versioning**: Serializable is supported by the default mechanism. With Externalizable, versioning is your responsibility.",
      ],
      [
        "Q4. How do you customise serialization with writeObject and readObject?",
        "Declare these **exact private** methods in the Serializable class:\n\n- `private void writeObject(ObjectOutputStream out) throws IOException`\n- `private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException`\n\nInside, call `out.defaultWriteObject()` and `in.defaultReadObject()` to handle the normal fields, then write or read extra data in the **same order**: an encrypted password, a derived value, or the state of a non-serializable member. Serialization finds these methods by reflection. Related hooks are `writeReplace` and `readResolve` (substituting objects) and `readObjectNoData`.",
      ],
      [
        "Q5. How do you implement Externalizable?",
        "Implement `java.io.Externalizable`, provide a **public no-argument constructor**, and implement both methods. `writeExternal(ObjectOutput out)` writes each field with `out.writeInt`, `writeUTF`, `writeObject` and so on. `readExternal(ObjectInput in)` reads them back **in exactly the same order and types**. Fields you do not write are simply not persisted, and keep the values set by the no-arg constructor. Externalizable classes do not get the default field handling, so superclass fields must be written explicitly too.",
      ],
      [
        "Q6. How do you stop members from being serialized?",
        "- Mark them **`transient`**. They are skipped and read back as default values.\n- Make them **`static`**. Class-level state is never serialized.\n- Define `private static final ObjectStreamField[] serialPersistentFields` to whitelist the persisted fields.\n- Use **custom writeObject**, or **Externalizable**, and omit them.\n- Use **writeReplace** to substitute a lighter proxy object (the serialization proxy pattern).\n\nTypical candidates are passwords, caches, loggers, threads, sockets and derived values.",
      ],
      [
        "Q7. What is serialVersionUID?",
        "A `private static final long serialVersionUID` field that acts as the **version identifier** of a Serializable class. It is written into the stream with the class descriptor. On deserialization, the JVM compares the stream's UID with the UID of the local class. If they differ, it throws `InvalidClassException: local class incompatible`. If they match, the JVM tries to reconcile the fields (see Q9). Declare it explicitly, and change it only when you deliberately want to reject older streams.",
      ],
      [
        "Q8. What happens if you do not define serialVersionUID?",
        "The JVM **computes one** at runtime: a SHA hash of the class name, its modifiers, interfaces, fields and constructors, and the signatures of its non-private methods. The value is sensitive to tiny changes (adding a method, changing a field's modifier) and can even differ between compilers (synthetic members). As a result, objects serialized by one version of the class often cannot be read after **any** recompile with changes, which fails with InvalidClassException, even for changes that would otherwise be compatible. The compiler warns about this (`-Xlint:serial`).",
      ],
      [
        "Q9. What are compatible and incompatible changes?",
        "With the same UID, **compatible** changes (old streams still load) are:\n\n- adding fields, which get default values\n- adding or removing classes in the hierarchy\n- adding or removing writeObject and readObject (with care)\n- changing access modifiers\n- changing a field from static or transient to non-static and non-transient\n\n**Incompatible** changes break deserialization or the meaning of the data:\n\n- deleting a field that old readers still need (the stream value is just ignored)\n- changing a field's declared type\n- making a field static or transient\n- moving a class up or down the hierarchy\n- switching between Serializable and Externalizable\n- changing a class to an enum or a record\n- writing different data in writeObject\n\nThe program reads a stream written by \"version 1\" into \"version 2\".",
      ],
      [
        "Q10. What are the alternatives to Java serialization for network transfer?",
        "- **JSON** (Jackson, Gson, JSON-B): human-readable and language-neutral, the standard for REST.\n- **Protocol Buffers**, **Avro**, **Thrift** and **FlatBuffers**: compact binary formats with schemas and versioning, used for gRPC and Kafka.\n- **XML** (JAXB).\n- **MessagePack** and **CBOR**: binary JSON.\n- **Kryo** and **FST**: fast Java-specific binary serializers.\n- **Records with a custom codec**.\n\nThey avoid Java serialization's problems: the deserialization gadget-chain vulnerabilities, brittle versioning, Java-only streams, and large output. If you must use Java serialization, install an `ObjectInputFilter` (JEP 290) to allowlist classes.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {

    // Q2 + Q4 + Q6 + Q7
    static class Employee implements Serializable {
        private static final long serialVersionUID = 1L;
        String name;
        int salary;
        transient String password;                        // Q6: not written directly
        transient int cachedTax;                          // Q6: derived, recomputed on read
        Employee(String name, int salary, String password) { this.name = name; this.salary = salary; this.password = password; cachedTax = salary / 10; }

        // Q4: write a masked version of the password after the default fields.
        private void writeObject(ObjectOutputStream out) throws IOException {
            out.defaultWriteObject();                      // name, salary
            out.writeUTF(new StringBuilder(password).reverse().toString()); // toy "encryption"
        }
        private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
            in.defaultReadObject();
            password = new StringBuilder(in.readUTF()).reverse().toString();
            cachedTax = salary / 10;                       // recompute derived state
        }
    }

    // Q8: no serialVersionUID declared - the JVM computes a hash of the class structure.
    static class NoUid implements Serializable { int value; }

    // Q3 + Q5: Externalizable writes exactly what it chooses.
    public static class Point implements Externalizable {
        int x, y; String label = "default label";
        public Point() { }                                 // required, runs on read
        Point(int x, int y, String label) { this.x = x; this.y = y; this.label = label; }
        @Override public void writeExternal(ObjectOutput out) throws IOException { out.writeInt(x); out.writeInt(y); } // label skipped
        @Override public void readExternal(ObjectInput in) throws IOException { x = in.readInt(); y = in.readInt(); }
    }

    public static void main(String[] args) throws Exception {
        Path dir = Files.createTempDirectory("ser");

        // Q1 + Q2: to a file and back.
        Path file = dir.resolve("emp.ser");
        try (ObjectOutputStream out = new ObjectOutputStream(new BufferedOutputStream(Files.newOutputStream(file)))) {
            out.writeObject(new Employee("Kavya", 90000, "s3cret"));
        }
        Employee copy;
        try (ObjectInputStream in = new ObjectInputStream(new BufferedInputStream(Files.newInputStream(file)))) {
            copy = (Employee) in.readObject();
        }
        System.out.println("Q2 file " + file.getFileName() + " (" + Files.size(file) + " bytes) -> " + copy.name + ", " + copy.salary);
        System.out.println("Q4 custom hooks restored password '" + copy.password + "' and recomputed tax " + copy.cachedTax);
        System.out.println("Q4 the raw file contains the plain password? " + new String(Files.readAllBytes(file), "ISO-8859-1").contains("s3cret"));

        // Q3 + Q5
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(new Point(3, 4, "custom label")); }
        Point p;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) { p = (Point) in.readObject(); }
        System.out.println("Q5 Externalizable Point (" + p.x + ", " + p.y + "), label not written -> '" + p.label + "'");

        // Q7 + Q8: declared vs computed UID.
        System.out.println("Q7 Employee UID " + ObjectStreamClass.lookup(Employee.class).getSerialVersionUID()
                + "; Q8 NoUid declares none, so the JVM computed one (non-zero: "
                + (ObjectStreamClass.lookup(NoUid.class).getSerialVersionUID() != 0) + ")");

        // Q9: simulate class evolution by writing a v1 object and reading it as v2.
        // We write a HashMap-based "v1" (two fields) and read it into a "v2" view with an extra default field.
        Map<String, Object> v1 = new HashMap<>(Map.of("name", "Arun", "age", 31));
        byte[] stored;
        try (ByteArrayOutputStream b = new ByteArrayOutputStream(); ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(v1); out.flush(); stored = b.toByteArray(); }
        @SuppressWarnings("unchecked") Map<String, Object> read;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(stored))) { read = (Map<String, Object>) in.readObject(); }
        Object email = read.getOrDefault("email", null);  // a field added in v2 is absent in old data
        System.out.println("Q9 adding a field is compatible: old data loads, new field defaults to " + email);

        // Q10: an ObjectInputFilter allowlist rejects unexpected classes.
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(stored))) {
            in.setObjectInputFilter(ObjectInputFilter.Config.createFilter("java.lang.String;!*"));
            in.readObject();
        } catch (InvalidClassException e) {
            System.out.println("Q10 ObjectInputFilter rejected HashMap: " + e.getMessage());
        }
    }
}`,
    walk:
      "Q2 writes an Employee to a temporary file through buffered object streams and reads it back. The custom `writeObject` writes the default fields, then a reversed copy of the transient password. So the raw file does not contain \"s3cret\", while `readObject` restores the password and recomputes the transient tax field (Q4, Q6).\n\nThe Externalizable Point writes only x and y. On reading, its public no-arg constructor runs first, so the unwritten label keeps its default value (Q3, Q5). Q7 prints the declared UID, 1. Q9 shows the core idea of a compatible change: data written before a field existed still loads, and the missing field defaults to null. Q10 installs an allowlist filter that accepts only String, so deserializing a HashMap is rejected with InvalidClassException, which is the defence against malicious streams.",
    anim: [
      "Custom writeObject and readObject",
      [
        ["obj", "Employee", "name, salary, pwd"],
        ["oos", "ObjectOutput", "writeObject"],
        ["file", "emp.ser", "bytes on disk"],
        ["ois", "ObjectInput", "readObject"],
        ["copy", "new Employee", "restored"],
      ],
      [
        ["obj", "oos", "defaultWrite", "defaultWriteObject writes the non-transient fields name and salary."],
        ["oos", "file", "extra data", "The hook then writes the masked password with writeUTF."],
        ["file", "ois", "defaultRead", "On reading, defaultReadObject restores name and salary first."],
        ["ois", "copy", "readUTF", "The hook reads the masked password in the same order and unmasks it."],
        ["copy", "copy", "recompute", "Transient derived state (cachedTax) is recomputed instead of stored."],
      ],
    ],
    mistakes: [
      "Reading custom data in a different order than it was written. The stream gets corrupted.",
      "Forgetting the public no-arg constructor of an Externalizable class.",
      "Relying on the computed serialVersionUID, so harmless edits break stored data.",
      "Deserializing untrusted bytes without an ObjectInputFilter.",
    ],
    qa: [
      [
        "Is the Serializable interface empty?",
        "Yes. It is a marker interface. The serialization machinery checks `instanceof Serializable` and uses reflection to find fields and optional hook methods.",
      ],
      [
        "What is the serialization proxy pattern?",
        "`writeReplace` returns a small private static nested proxy with the logical state, and the proxy's `readResolve` rebuilds the real object through its public constructor or factory. Invariants are therefore always validated, and the real class's internals never appear in the stream.",
      ],
      [
        "Does serialization preserve object identity within one stream?",
        "Yes. An object reachable twice is written once, and the second reference becomes a back-reference, so the deserialized graph has the same sharing and cycles.",
      ],
    ],
    ex: [
      "Add a `transient LocalDateTime loadedAt` field to Employee that must be set to the time of deserialization. Where do you set it?",
      "In `readObject`, after `in.defaultReadObject()`: `loadedAt = LocalDateTime.now();`. A transient field skips its declared initializer during deserialization, so the hook is the right place.",
    ],
  }),

  lesson("Serialization Q11-Q24: static and transient, Members, Constructors, Singletons and Output Questions", {
    intro:
      "Questions 11 to 24 test the detailed rules:\n\n- why static fields are not serialized, and what transient does\n- what happens when a member is not Serializable\n- List, Set and Map members\n- whether constructors run during deserialization, and how primitives are stored\n- superclass constructors\n- the default values of int vs Integer fields\n- singletons: preventing a second instance, keeping their state, and why serialize them at all\n- stopping a subclass from being serialized\n- two output questions about collection members and non-serializable members\n\nThe program verifies each answer.",
    topics: [
      [
        "Q11. Why are static fields not serialized?",
        "Serialization captures the state of an **object**, while a static field belongs to the **class** and is shared by all instances, so it is not part of any one object's state. When an object is read back, its class (already loaded in the reading JVM) supplies the current static values. Writing statics would also be ambiguous: which object's write would win when several are deserialized? So after deserialization a static field shows whatever value the class has in the current JVM, not the value it had when the object was written.",
      ],
      [
        "Q12. What is the significance of transient?",
        "`transient` marks an instance field as **not part of the persistent state**. Default serialization skips it, and after deserialization it holds the type's default (null, 0, false), **not** its declared initializer, because neither constructors nor initializers of the serializable class run. Use it for sensitive data (passwords), non-serializable resources (threads, streams, sockets), caches and derived data. Restore such fields in `readObject` if they are needed. `transient` has no effect on static fields or on Externalizable classes.",
      ],
      [
        "Q13. What happens if a member of a Serializable class is not Serializable?",
        "`writeObject` throws **java.io.NotSerializableException: com.x.MemberClass** at runtime when it reaches a non-null field whose class does not implement Serializable. Nothing warns at compile time. The fixes:\n\n- make the member class Serializable\n- mark the field `transient` and rebuild it after reading\n- extract its state in custom writeObject and readObject\n- replace it with a serializable representation\n\nA field that is null at the time of writing serializes without a problem.",
      ],
      [
        "Q14. Can a class with List, Set or Map members be serialized?",
        "Yes. The JDK's standard collections (ArrayList, LinkedList, HashMap, TreeMap, HashSet, LinkedHashMap, ArrayDeque, the `List.of` family and others) implement Serializable, and serialize their elements through custom writeObject methods. Two conditions apply: every element (and every key and value) must be Serializable, and a TreeMap or TreeSet comparator must be Serializable too. Hash-based collections are rebuilt on read, so the elements' hashCode must be stable across JVMs. Collection views and wrappers (`map.keySet()`, `Collections.unmodifiableList`) are serializable if their backing collection is.",
      ],
      [
        "Q15. Are constructors called during deserialization?",
        "No **constructor of the Serializable class** (or its serializable superclasses) is called, and instance initializers and field initializers do not run either. The JVM creates the instance with a special mechanism and assigns the fields directly from the stream. The **exceptions**:\n\n- the no-arg constructor of the first **non-serializable** superclass runs (see Q17)\n- Externalizable classes run their public no-arg constructor\n- records are rebuilt through their **canonical constructor**\n\nSo validation in constructors is skipped for normal classes, and must be repeated in readObject.",
      ],
      [
        "Q16. How are primitive types serialized?",
        "Primitive fields are written in binary form as part of the object's field data, using fixed sizes in big-endian order: `int` as 4 bytes, `long` as 8, `boolean` as 1 byte, `char` as 2, `double` as 8 bytes of IEEE-754 bits. There is no boxing. Primitive arrays are written as a length followed by the raw values. Transient or static primitives are not written, and read back as 0 or false, or as the current class value for statics. You can write primitives yourself through `DataOutput` methods (`writeInt` and others) in custom hooks.",
      ],
      [
        "Q17. Is the superclass constructor called during deserialization?",
        "Only for **non-serializable** superclasses. The JVM walks up the hierarchy to the first superclass that does **not** implement Serializable and calls its **accessible no-arg constructor**. That constructor (and every constructor above it, up to Object) initialises the inherited fields, because their values were never written. Serializable superclasses do not have their constructors run: their fields come from the stream. If the first non-serializable superclass has no accessible no-arg constructor, deserialization fails with `InvalidClassException: no valid constructor`.",
      ],
      [
        "Q18. If a field is not serialized, what is its value for int vs Integer?",
        "For a **transient int**, the value after deserialization is **0**, the primitive default. For a **transient Integer**, it is **null**, the reference default. Code that unboxes it (`int x = obj.count;`) then throws NullPointerException. The same applies to fields inherited from a non-serializable superclass that its no-arg constructor does not set. Declared initializers such as `transient int count = 5;` are **not** re-applied.",
      ],
      [
        "Q19. How do you stop deserialization from creating a second singleton instance?",
        "Add `protected Object readResolve() { return INSTANCE; }`, or a private version. After the JVM reads an object, it calls readResolve, and the returned object **replaces** the newly created copy, which is then discarded. All instance fields should be transient, or the stream could be crafted to smuggle in references to the temporary copy. The strongest solution is an **enum singleton**, which is guaranteed by the JVM: enum constants are serialized by name, and deserialization returns the existing constant.",
      ],
      [
        "Q20. How do you make sure a singleton's state is not changed by deserialization?",
        "With `readResolve` returning the existing INSTANCE, the state that was read into the temporary copy is thrown away, so the live singleton's fields are untouched, whatever the stream contained. To be safe against crafted streams, mark the singleton's fields **transient** so that nothing meaningful is read at all, and do not have readObject assign to the static instance. With an enum singleton, no state is serialized except the constant's name, so the in-memory constant keeps its current state.",
      ],
      [
        "Q21. Why would you serialize a singleton at all?",
        "Usually not on purpose. It happens because the singleton is **reachable from an object graph that is serialized**: a session object referencing a configuration service, a cache entry holding a registry, or an object sent over RMI. The singleton then gets serialized along with the rest. Without readResolve, the receiving side ends up with a second \"singleton\", which breaks identity checks and shared state. Sometimes a singleton's configuration genuinely needs to be persisted or sent to another JVM. Either way, it must deserialize back to the one instance of the receiving JVM.",
      ],
      [
        "Q22. How do you stop a subclass from being serialized when its superclass is Serializable?",
        "A subclass inherits `Serializable`, and Java cannot un-implement an interface. Block it by defining hooks in the subclass that throw:\n\n- `private void writeObject(ObjectOutputStream out) throws IOException { throw new NotSerializableException(getClass().getName()); }`\n- the same for `readObject`\n- and `readObjectNoData()` for completeness\n\nAny attempt to serialize an instance of the subclass then fails with a clear exception, while the parent class remains serializable.",
      ],
      [
        "Q23 (output). What is printed after serializing an object with List, Set and Map members?",
        "The deserialized copy is a **different object** (`copy != original`), but it contains **equal collections** with the same elements: `copy.list.equals(original.list)` is true. The collections themselves are new objects too, and printing them shows the same contents, in the same order for lists and LinkedHashMaps, and in iteration order for hash-based ones. Elements shared between collections in the original remain shared in the copy, because identity within one stream is preserved.",
        "Basket b = new Basket();   // List, Set, Map fields\n// serialize + deserialize ->\ncopy.items.equals(b.items)   // true\ncopy.items == b.items        // false",
      ],
      [
        "Q24 (output). What is printed when a member is not Serializable?",
        "Writing fails with `java.io.NotSerializableException: Engine` (the name of the offending member class), and nothing usable is written. If the code catches the exception and prints `e.getMessage()`, the output is just the class name. After the member is marked transient, serialization succeeds, and the member is null in the copy.",
        "class Engine { }   // not Serializable\nclass Car implements Serializable { Engine engine = new Engine(); }\nout.writeObject(new Car());   // NotSerializableException: Engine",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.*;

public class Main {
    static byte[] write(Object o) throws IOException {
        ByteArrayOutputStream b = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(b)) { out.writeObject(o); }
        return b.toByteArray();
    }
    @SuppressWarnings("unchecked") static <T> T read(byte[] data) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) { return (T) in.readObject(); }
    }

    static class Counter implements Serializable {
        private static final long serialVersionUID = 1L;
        static int instances = 0;                             // Q11
        transient int primitiveCount = 5;                     // Q12 + Q18
        transient Integer boxedCount = 5;                     // Q18
        long id = 42; boolean active = true; double ratio = 0.5; // Q16
        Counter() { instances++; System.out.println("Q15   Counter constructor ran"); }
    }

    static class Engine { }                                   // Q13 + Q24: not Serializable
    static class Car implements Serializable { Engine engine = new Engine(); }
    static class SafeCar implements Serializable { transient Engine engine = new Engine(); }

    static class Basket implements Serializable {             // Q14 + Q23
        List<String> items = new ArrayList<>(List.of("milk", "eggs"));
        Set<Integer> codes = new TreeSet<>(Set.of(3, 1, 2));
        Map<String, Integer> qty = new LinkedHashMap<>(Map.of("milk", 2));
    }

    static class Base { String origin = "unset"; Base() { origin = "set by Base()"; } } // not Serializable
    static class Derived extends Base implements Serializable { String own = "own"; } // Q17

    static class Config implements Serializable {             // Q19 + Q20 + Q21
        static final Config INSTANCE = new Config();
        transient String mode = "production";
        private Config() { }
        private Object readResolve() { return INSTANCE; }
    }
    static class Session implements Serializable { String user = "u1"; Config config = Config.INSTANCE; }

    static class Parent implements Serializable { }
    static class NoSerialChild extends Parent {               // Q22
        private void writeObject(ObjectOutputStream out) throws IOException { throw new NotSerializableException("NoSerialChild may not be serialized"); }
        private void readObject(ObjectInputStream in) throws IOException { throw new NotSerializableException("NoSerialChild may not be deserialized"); }
    }

    public static void main(String[] args) throws Exception {
        // Q11, Q12, Q15, Q16, Q18
        Counter c = new Counter();
        byte[] data = write(c);
        Counter.instances = 99;                               // static changed after writing
        Counter copy = read(data);                            // no constructor output here
        System.out.println("Q11 static after read = " + Counter.instances + " (current class value, not the written one)");
        System.out.println("Q12/Q18 transient int -> " + copy.primitiveCount + ", transient Integer -> " + copy.boxedCount);
        System.out.println("Q16 primitives restored: id " + copy.id + ", active " + copy.active + ", ratio " + copy.ratio);

        // Q13 + Q24
        try { write(new Car()); } catch (NotSerializableException e) { System.out.println("Q24 NotSerializableException: " + e.getMessage()); }
        SafeCar safe = read(write(new SafeCar()));
        System.out.println("Q13 with transient engine: written fine, engine after read = " + safe.engine);

        // Q14 + Q23
        Basket basket = new Basket();
        Basket basketCopy = read(write(basket));
        System.out.println("Q23 copy == original " + (basketCopy == basket) + ", items equal " + basketCopy.items.equals(basket.items)
                + ", same list object " + (basketCopy.items == basket.items) + " -> " + basketCopy.items + " " + basketCopy.codes + " " + basketCopy.qty);

        // Q17
        Derived d = new Derived();
        d.origin = "changed";
        Derived dCopy = read(write(d));
        System.out.println("Q17 non-serializable parent field after read: " + dCopy.origin + " (Base() ran), own field: " + dCopy.own);

        // Q19 + Q20 + Q21: a singleton reached through another object's graph.
        Config.INSTANCE.mode = "maintenance";
        Session session = read(write(new Session()));
        System.out.println("Q21 singleton reached via Session is still the one instance: " + (session.config == Config.INSTANCE)
                + ", state unchanged: " + Config.INSTANCE.mode);

        // Q22
        try { write(new NoSerialChild()); } catch (NotSerializableException e) { System.out.println("Q22 " + e.getMessage()); }
    }
}`,
    walk:
      "Creating the Counter prints the constructor line once. Reading the copy back prints nothing, which proves that the constructor was skipped (Q15). The static counter shows the value main set after writing, not the written value (Q11). Both transient fields lose their declared initializer 5: the int becomes 0 and the Integer null (Q12, Q18). The primitives come back exactly (Q16).\n\nWriting a Car with a non-serializable Engine throws NotSerializableException naming the class. The transient version writes fine and reads back a null engine (Q13, Q24). The Basket copy is a new object with equal, but new, collections (Q14, Q23). For Derived, the non-serializable Base's constructor runs during reading, so `origin` is \"set by Base()\" instead of \"changed\" (Q17). A Session that references the Config singleton deserializes to the same instance, thanks to readResolve, and the singleton's state is untouched (Q19 to Q21). The subclass that blocks serialization throws from its hook (Q22).",
    anim: [
      "readResolve keeps the singleton unique",
      [
        ["stream", "byte stream", "Session + Config"],
        ["ois", "ObjectInput", "readObject"],
        ["tmp", "temp Config", "freshly built"],
        ["rr", "readResolve()", "returns INSTANCE"],
        ["live", "Config.INSTANCE", "the one object"],
      ],
      [
        ["stream", "ois", "read graph", "Reading the Session reaches its config field, a serialized Config."],
        ["ois", "tmp", "allocate", "The JVM builds a temporary Config from the stream (no constructor)."],
        ["tmp", "rr", "has hook?", "Config defines readResolve, so the JVM calls it on the temporary copy."],
        ["rr", "live", "replace", "readResolve returns the live INSTANCE; the temporary copy is discarded."],
        ["live", "ois", "assign", "session.config now points to the one singleton, whose state is untouched."],
      ],
    ],
    mistakes: [
      "Expecting a transient field to get its initializer value back after deserialization.",
      "Forgetting that a non-serializable superclass needs an accessible no-arg constructor.",
      "Writing readResolve for a singleton but leaving it with non-transient fields that a crafted stream can exploit.",
    ],
    qa: [
      [
        "What is `readObjectNoData()` for?",
        "It is called when the stream contains a subclass instance but no data for this class, for example after the class was added as a new serializable superclass. It lets the class initialise its fields to a sensible state.",
      ],
      [
        "Can you serialize a lambda?",
        "Only if its target type is Serializable, for example through an intersection cast: `(Runnable & Serializable) () -> ...`. It is fragile and best avoided.",
      ],
      [
        "Why are enums safe for serialization?",
        "Only the constant's name is written. Reading looks the name up with `Enum.valueOf`, so no new instance can ever be created and no fields are restored from the stream.",
      ],
    ],
    ex: [
      "A Serializable `Order` has `transient List<String> auditLog = new ArrayList<>()`. After deserialization, `auditLog.add(...)` throws NullPointerException. Explain why, and fix it in two ways.",
      "Field initializers do not run during deserialization, so the transient list is null. Fix it with `readObject` (`in.defaultReadObject(); auditLog = new ArrayList<>();`), or initialise it lazily in a getter (`if (auditLog == null) auditLog = new ArrayList<>();`).",
    ],
  }),
]);
