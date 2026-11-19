import { lesson } from "../../schema.js";

export default [
  lesson("Core Java Q104-Q116: Serialization Questions and the Object Class Methods", {
    intro:
      "The last core questions, 104 to 116, cover serialization:\n\n- what it is, and Externalizable vs Serializable\n- keeping members out of the stream, and serialVersionUID with what happens when it is missing\n- compatible and incompatible class changes\n- members that are not Serializable, and collection members\n- which constructors run during deserialization, including superclass constructors\n- protecting a singleton\n- stopping a subclass from being serialized\n- how primitives are written\n\nThe round finishes with the methods of `java.lang.Object`. The program serializes to an in-memory byte array, so it runs anywhere.",
    topics: [
      [
        "Q104. What is serialization?",
        "Serialization converts an object graph into a byte stream, so that it can be saved to a file, sent over a network or cached. Deserialization rebuilds the objects from those bytes. A class opts in by implementing the marker interface `java.io.Serializable`. `ObjectOutputStream.writeObject(obj)` writes the object, its class description and every reachable non-transient, non-static field, recursively and handling cycles, and `ObjectInputStream.readObject()` reads it back.\n\nJava serialization is also a well-known **security risk**: deserializing untrusted data can run gadget chains. So use `ObjectInputFilter` (Java 9) and prefer JSON or Protobuf for data exchange.",
      ],
      [
        "Q105. What is the difference between Externalizable and Serializable?",
        "With **Serializable**, the JVM writes all non-transient fields automatically, using reflection. You can customise it with private `writeObject` and `readObject` methods. With **Externalizable**, a subinterface, you take full control by implementing `writeExternal(ObjectOutput)` and `readExternal(ObjectInput)` and writing exactly the fields you choose, in your own format.\n\nExternalizable requires a **public no-argument constructor**, because deserialization calls it first and then calls `readExternal`. A Serializable class, by contrast, does not run its own constructor. Externalizable can be faster and more compact, but you must maintain the field order and versioning yourself.",
      ],
      [
        "Q106. How do you stop members from being serialized?",
        "- Mark the field **transient**. It is skipped, and after deserialization it holds its default value (null, 0, false). Use this for passwords, caches and derived data.\n- **static** fields are never serialized, because they belong to the class, not to the object.\n- Declare `private static final ObjectStreamField[] serialPersistentFields` to list exactly the fields to write.\n- Write custom `writeObject` and `readObject` methods, or use Externalizable and simply do not write the field.\n\nTo recompute a transient field after reading, do it in `readObject` or `readResolve`.",
      ],
      [
        "Q107. What is serialVersionUID, and what is the impact of not defining it?",
        "`private static final long serialVersionUID = 1L;` is the version stamp of a Serializable class. It is written into the stream, and on deserialization it is compared with the UID of the local class. If they differ, `InvalidClassException` is thrown.\n\nIf you do not declare it, the JVM **computes** one from the class structure (name, interfaces, fields, methods and other details), and the value can change after any small edit or with a different compiler. Old serialized data then fails to load even when the change was harmless. Always declare it explicitly, and change it only when you deliberately make old data incompatible.",
      ],
      [
        "Q108. What are compatible and incompatible changes in serialization?",
        "With the same serialVersionUID, **compatible** changes keep old streams readable:\n\n- adding fields (they get default values)\n- adding or removing `writeObject` and `readObject`\n- adding Serializable to a superclass\n- changing a field's access modifier\n- making a field non-transient or non-static (the field gets defaults)\n- adding classes to the hierarchy\n\n**Incompatible** changes break deserialization or corrupt data:\n\n- deleting a field (the old data is ignored, but semantics may break)\n- changing a field's type\n- making a field static or transient\n- moving a class up or down the hierarchy\n- changing Serializable to Externalizable or the reverse\n- turning a class into an enum, or the reverse\n- changing `writeObject` so it writes different data\n\nThe program writes a stream from version 1 of a class and reads it into version 2, which has an extra field.",
      ],
      [
        "Q109. What happens if a member of a Serializable class is not Serializable?",
        "Serialization fails at runtime with **NotSerializableException**, naming the offending class, when `writeObject` reaches that field. The compiler does not check this. The fixes:\n\n- make the member's class Serializable\n- mark the field `transient` (and rebuild it after reading)\n- write custom `writeObject` and `readObject` that save the member's state in another form\n\nA null value in such a field serializes fine. Only a real non-serializable object fails.",
      ],
      [
        "Q110. Can a class with List, Set or Map members be serialized?",
        "Yes, if the **collection implementation** and **all its elements** are Serializable. ArrayList, HashMap, HashSet, LinkedList, TreeMap and the `List.of` family are all Serializable. HashMap and HashSet write their elements and rebuild the table on read, instead of copying the bucket array. If one element is not Serializable, NotSerializableException is thrown. `Collections.unmodifiableList` wrappers are Serializable as long as the wrapped list is. Declaring the field as the interface type (`List<String>`) is fine, because the runtime object decides.",
      ],
      [
        "Q111. Is a constructor called during deserialization?",
        "For a **Serializable** class, **no**: its constructor and its field initializers are not run. The JVM allocates the object and fills its fields directly from the stream. That is why transient fields come back as default values rather than their declared initial values. For **Externalizable**, yes: the public no-argument constructor runs first, then `readExternal`. Records are the exception among Serializable classes, because they are rebuilt through their canonical constructor, so its validation runs.",
      ],
      [
        "Q112. Is the superclass constructor called during deserialization?",
        "It depends on whether the superclass is Serializable. If the parent **is Serializable**, its constructor is not called either: its fields come from the stream. If the parent is **not Serializable**, the JVM calls its **no-argument constructor** (which must exist and be accessible, or deserialization fails with InvalidClassException), and the parent's fields get whatever that constructor sets, because they were never written. The rule: constructors run for the first non-serializable superclass and every class above it.",
      ],
      [
        "Q113. How do you stop deserialization from creating a second singleton instance?",
        "Plain deserialization always creates a new object, which breaks the singleton. Add `private Object readResolve() { return INSTANCE; }`. After the object is read, the JVM calls readResolve and returns its result instead, and the freshly read copy is discarded. Fields that are not needed should be transient. The best solution is an **enum singleton**: enum constants are serialized by name, and deserialization returns the existing constant automatically.",
      ],
      [
        "Q114. How do you stop a subclass from being serialized when its parent is Serializable?",
        "A subclass inherits Serializable and you cannot un-implement an interface. Instead, override the hook methods in the subclass and throw:\n\n- `private void writeObject(ObjectOutputStream out) throws IOException { throw new NotSerializableException(\"...\"); }`\n- `private void readObject(ObjectInputStream in) throws IOException { throw new NotSerializableException(\"...\"); }`\n\nNow any attempt to serialize the subclass fails clearly. The program demonstrates this.",
      ],
      [
        "Q115. Are primitive types serialized?",
        "Yes. Primitive fields are written directly as their binary values (`writeInt`, `writeLong`, and so on) as part of the object's field data, without boxing. Arrays of primitives are serialized too, including their length. Primitives themselves are not objects, so they do not implement Serializable; they are simply always serializable as fields. A transient or static primitive field is not written, and after deserialization it reads as its default value (0, false) or the current class value.",
      ],
      [
        "Q116. What are the methods of the Object class?",
        "Every class inherits these from `java.lang.Object`:\n\n- `equals(Object)`: identity by default; override it for value equality.\n- `hashCode()`: must be consistent with equals.\n- `toString()`: `ClassName@hexHash` by default.\n- `getClass()`: final; returns the runtime Class.\n- `clone()`: protected; needs Cloneable.\n- `wait()`, `wait(long)`, `wait(long, int)`, `notify()` and `notifyAll()`: final; monitor methods.\n- `finalize()`: protected; deprecated for removal.\n\nKnowing which methods are final (getClass, wait and notify) and which are protected (clone and finalize) is a common follow-up question.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.*;

public class Main {

    // Helpers that serialize to and from a byte array.
    static byte[] write(Object o) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) { out.writeObject(o); }
        return bytes.toByteArray();
    }
    @SuppressWarnings("unchecked")
    static <T> T read(byte[] data) throws IOException, ClassNotFoundException {
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(data))) { return (T) in.readObject(); }
    }

    // Q104 + Q106 + Q110 + Q115
    static class User implements Serializable {
        private static final long serialVersionUID = 1L;          // Q107: fixed version
        static String region = "IN";                              // static: never written
        String name;
        int age;                                                  // primitive: written as raw int
        transient String password = "secret";                     // skipped
        List<String> roles = new ArrayList<>(List.of("admin"));   // collection member
        User(String name, int age) { this.name = name; this.age = age; System.out.println("Q111   User constructor ran"); }
    }

    // Q105: Externalizable chooses its own format and needs a public no-arg constructor.
    public static class Point implements Externalizable {
        int x, y;
        public Point() { System.out.println("Q105   Point no-arg constructor ran during read"); }
        Point(int x, int y) { this.x = x; this.y = y; }
        public void writeExternal(ObjectOutput out) throws IOException { out.writeInt(x); out.writeInt(y); }
        public void readExternal(ObjectInput in) throws IOException { x = in.readInt(); y = in.readInt(); }
    }

    // Q109: a Serializable class with a non-serializable member.
    static class Engine { }
    static class Car implements Serializable { Engine engine = new Engine(); }

    // Q112: non-serializable parent with a no-arg constructor.
    static class Animal {
        String kind = "unset";
        Animal() { kind = "set by Animal()"; System.out.println("Q112   Animal() constructor ran"); }
    }
    static class Dog extends Animal implements Serializable { String name = "Bruno"; }

    // Q113: readResolve keeps the singleton unique.
    static class Settings implements Serializable {
        static final Settings INSTANCE = new Settings();
        private Settings() { }
        private Object readResolve() { return INSTANCE; }
    }

    // Q114: a subclass that refuses serialization.
    static class Base implements Serializable { }
    static class Secret extends Base {
        private void writeObject(ObjectOutputStream out) throws IOException {
            throw new NotSerializableException("Secret must not be serialized");
        }
    }

    public static void main(String[] args) throws Exception {
        // Q104 + Q106 + Q111: constructor does not run on read; transient is reset.
        User user = new User("Anil", 30);
        byte[] data = write(user);
        User.region = "US";                                       // change the class value after writing
        User copy = read(data);
        System.out.println("Q104 read back " + copy.name + ", age " + copy.age + ", roles " + copy.roles
                + " (" + data.length + " bytes)");
        System.out.println("Q106 transient password -> " + copy.password + ", static region -> " + User.region);

        // Q105
        Point p = read(write(new Point(3, 4)));
        System.out.println("Q105 Externalizable point (" + p.x + ", " + p.y + ")");

        // Q109
        try {
            write(new Car());
        } catch (NotSerializableException e) {
            System.out.println("Q109 NotSerializableException: " + e.getMessage());
        }

        // Q112
        Dog dog = new Dog();
        dog.kind = "changed before writing";
        Dog dogCopy = read(write(dog));
        System.out.println("Q112 parent field after read: " + dogCopy.kind + ", own field: " + dogCopy.name);

        // Q113
        Settings again = read(write(Settings.INSTANCE));
        System.out.println("Q113 same singleton after deserialization: " + (again == Settings.INSTANCE));

        // Q114
        try {
            write(new Secret());
        } catch (NotSerializableException e) {
            System.out.println("Q114 " + e.getMessage());
        }

        // Q107 + Q108: the UID stored in the stream.
        System.out.println("Q107 serialVersionUID of User = "
                + ObjectStreamClass.lookup(User.class).getSerialVersionUID()
                + ", computed UID of Dog = " + (ObjectStreamClass.lookup(Dog.class).getSerialVersionUID() != 0));

        // Q116: Object's methods on a plain object.
        Object o = new Object();
        System.out.println("Q116 getClass " + o.getClass().getName() + ", equals itself " + o.equals(o)
                + ", toString starts with " + o.toString().substring(0, o.toString().indexOf('@') + 1)
                + ", hashCode stable " + (o.hashCode() == o.hashCode()));
    }
}`,
    walk:
      "The User constructor prints once, when the object is created, and not again when it is read back: Serializable classes skip their own constructors (Q111). The copy has the name, the primitive age and the roles list (Q104, Q110, Q115). The transient password is null and the static region shows the class's current value \"US\", not the value written (Q106).\n\nReading the Externalizable Point runs its public no-arg constructor first and then `readExternal` (Q105). Writing a Car fails because Engine is not Serializable (Q109). For the Dog, the non-serializable parent Animal has its no-arg constructor run twice: once for `new Dog()` and again during reading. Its field is reset to \"set by Animal()\" (Q112). `readResolve` returns the existing Settings instance (Q113). The Secret subclass throws from `writeObject` (Q114). The program also prints the declared UID and confirms that Dog got a computed one (Q107).",
    anim: [
      "Deserializing a Dog with a non-serializable parent",
      [
        ["bytes", "byte stream", "Dog fields"],
        ["ois", "ObjectInput", "readObject()"],
        ["alloc", "new object", "no Dog() call"],
        ["parent", "Animal()", "no-arg runs"],
        ["fill", "fill fields", "name = Bruno"],
      ],
      [
        ["bytes", "ois", "read class", "The stream starts with Dog's class descriptor and serialVersionUID."],
        ["ois", "alloc", "allocate", "The JVM allocates a Dog without running Dog's constructor or initializers."],
        ["alloc", "parent", "first non-ser.", "Animal is not Serializable, so its no-arg constructor runs and sets kind."],
        ["ois", "fill", "set fields", "Dog's own serializable fields are filled straight from the stream."],
        ["fill", "bytes", "readResolve?", "If the class defines readResolve, its return value replaces the object."],
      ],
    ],
    mistakes: [
      "Not declaring serialVersionUID. A harmless recompile can then make old data unreadable.",
      "Expecting a transient field to get its declared initial value back. It gets the type's default.",
      "Deserializing data from untrusted sources without an ObjectInputFilter.",
      "Forgetting the public no-arg constructor in an Externalizable class. Reading it then fails with InvalidClassException.",
    ],
    qa: [
      [
        "Why is `readObject` private yet still called?",
        "Serialization finds it reflectively by its exact private signature. Making it private keeps subclasses and other code from calling it directly.",
      ],
      [
        "Are records serialized differently?",
        "Yes. A record is written as its component values and read back through its canonical constructor. Custom `writeObject` and `readObject` methods are ignored, so its invariants are re-checked.",
      ],
      [
        "Why are getClass, wait and notify final?",
        "Their behaviour is tied to the JVM (the runtime type and monitor internals). Overriding them would break type safety and locking.",
      ],
    ],
    ex: [
      "A Serializable `Session` class has a `transient Connection connection`. How do you make sure `connection` is usable again after deserialization?",
      "Add `private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException { in.defaultReadObject(); connection = ConnectionFactory.open(url); }`. The non-transient `url` is read normally, and the transient connection is recreated from it.",
    ],
  }),
];
