import { lesson, section } from "../schema.js";

export default section("file-io", "File IO and File Handling", [
  lesson("Byte Streams vs Character Streams and Buffering", {
    intro:
      "Java I/O has two families: byte streams (`InputStream`/`OutputStream`) for raw binary data, and character streams (`Reader`/`Writer`) for text with a character encoding. Both can be wrapped in buffered versions for speed. This lesson explains the families, buffering, the decorator design that wraps one stream in another, and three classic comparisons: stream vs reader, FileInputStream vs BufferedInputStream, and FileReader vs BufferedReader.",
    topics: [
      [
        "Byte streams",
        "`InputStream` and `OutputStream` read and write bytes (0 to 255). Implementations: `FileInputStream`, `FileOutputStream`, `ByteArrayInputStream`, `ObjectInputStream`, `DataInputStream`, socket streams. Use them for images, archives, serialized objects and any binary format.",
      ],
      [
        "Character streams",
        "`Reader` and `Writer` read and write `char`s, converting to and from bytes with a charset. Implementations: `FileReader`, `FileWriter`, `InputStreamReader`/`OutputStreamWriter` (bridges from byte streams with an explicit charset), `StringReader`, `PrintWriter`. Use them for text.",
      ],
      [
        "Buffering and decorators",
        "Each `read()` on an unbuffered file stream can be a system call. `BufferedInputStream`, `BufferedOutputStream`, `BufferedReader` and `BufferedWriter` wrap another stream and keep an 8 KB buffer, turning many tiny reads or writes into a few large ones. Streams are combined by wrapping (the decorator pattern): `new BufferedReader(new InputStreamReader(new FileInputStream(f), UTF_8))`.",
      ],
      [
        "Stream vs reader",
        "Streams handle bytes and know nothing about text; readers handle characters and apply an encoding. Reading UTF-8 text byte by byte would split multi-byte characters such as \"é\" or \"₹\"; a reader decodes them correctly. Use streams for binary, readers for text.",
      ],
      [
        "FileInputStream vs BufferedInputStream, FileReader vs BufferedReader",
        "FileInputStream reads directly from the file, one system call per read; BufferedInputStream adds a buffer (and mark/reset support) for much faster small reads. FileReader reads characters directly; BufferedReader adds a buffer and the convenient `readLine()`. Always buffer unless you already read in large chunks.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("streams", ".txt");
        Files.writeString(file, "Price: \u20B9500, caf\u00E9\n".repeat(20_000), StandardCharsets.UTF_8);
        System.out.println("file size " + Files.size(file) + " bytes");

        try (InputStream in = new FileInputStream(file.toFile())) {
            byte[] first = in.readNBytes(12);
            System.out.println("byte stream sees bytes: " + first.length + " bytes, rupee sign takes 3 bytes in UTF-8");
        }
        try (Reader reader = new InputStreamReader(new FileInputStream(file.toFile()), StandardCharsets.UTF_8)) {
            char[] chars = new char[10];
            reader.read(chars);
            System.out.println("character stream decodes text: \"" + new String(chars) + "\"");
        }

        long start = System.nanoTime();
        int count = 0;
        try (InputStream in = new FileInputStream(file.toFile())) {
            while (in.read() != -1) count++;                       // one system call per byte
        }
        long unbuffered = System.nanoTime() - start;
        start = System.nanoTime();
        int count2 = 0;
        try (InputStream in = new BufferedInputStream(new FileInputStream(file.toFile()))) {
            while (in.read() != -1) count2++;                      // served from an 8 KB buffer
        }
        long buffered = System.nanoTime() - start;
        System.out.println("FileInputStream vs BufferedInputStream: same bytes " + (count == count2) + ", buffered faster " + (buffered < unbuffered));

        int lines = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(file.toFile(), StandardCharsets.UTF_8))) {
            while (reader.readLine() != null) lines++;             // readLine only in BufferedReader
        }
        System.out.println("BufferedReader.readLine counted " + lines + " lines");
        Files.delete(file);
    }
}`,
    varies: true,
    walk:
      "The program writes 20,000 lines containing the rupee sign and an accented letter in UTF-8. A byte stream returns raw bytes, while an `InputStreamReader` with the UTF-8 charset decodes the same bytes into characters correctly.\n\nReading the file one byte at a time with a plain `FileInputStream` makes a system call per byte; wrapping it in a `BufferedInputStream` returns the same bytes much faster from its buffer. `BufferedReader` adds `readLine()`, which counts the lines. Exact timings vary by machine.",
    anim: [
      "Decorating streams",
      [
        ["file", "file on disk", "bytes"],
        ["fis", "FileInputStream", "raw bytes"],
        ["isr", "InputStreamRdr", "bytes -> chars"],
        ["br", "BufferedReader", "buffer + lines"],
        ["code", "your code", "readLine()"],
      ],
      [
        ["file", "fis", "open", "FileInputStream reads raw bytes from the file."],
        ["fis", "isr", "decode", "InputStreamReader converts bytes to characters with a charset such as UTF-8."],
        ["isr", "br", "buffer", "BufferedReader reads big chunks into a buffer and offers readLine()."],
        ["br", "code", "lines", "Your code gets whole lines while the OS sees only a few large reads."],
      ],
    ],
    mistakes: [
      "Reading text with byte streams and building strings from individual bytes (breaks multi-byte characters).",
      "Using FileReader/FileWriter without specifying a charset on older Java versions (platform default encoding).",
      "Reading byte by byte without buffering.",
    ],
    qa: [
      ["What is the difference between byte streams and character streams?", "Byte streams (InputStream/OutputStream) handle raw bytes; character streams (Reader/Writer) handle characters and apply a charset encoding."],
      ["What is the difference between FileInputStream and BufferedInputStream?", "FileInputStream reads directly from the file; BufferedInputStream wraps it with an in-memory buffer, reducing system calls and supporting mark/reset."],
      ["What is the difference between FileReader and BufferedReader?", "FileReader reads characters from a file; BufferedReader buffers any Reader and adds readLine()."],
    ],
    ex: [
      "Which classes would you chain to read a UTF-8 text file line by line efficiently?",
      "`new BufferedReader(new InputStreamReader(new FileInputStream(path), StandardCharsets.UTF_8))`, or simply `Files.newBufferedReader(path, UTF_8)`.",
    ],
  }),

  lesson("Creating Files, Paths, Parent Directories and File System Roots", {
    intro:
      "Before reading or writing, you need to create files and work with paths correctly on every operating system. This lesson covers `File.createNewFile()`, the current working directory, building paths with `File.separator` (and the modern `Path` API), finding a file's parent directory, and listing the available file system roots or drives.",
    topics: [
      [
        "createNewFile()",
        "`new File(path).createNewFile()` atomically creates an empty file and returns true, or returns false if it already exists. It throws `IOException` if the parent directory is missing. The NIO equivalent `Files.createFile(path)` throws `FileAlreadyExistsException` instead of returning false.",
      ],
      [
        "Current working directory",
        "Relative paths are resolved against the working directory, the folder the JVM was started from: `System.getProperty(\"user.dir\")` or `Path.of(\"\").toAbsolutePath()`. It is not necessarily where the class files or JAR are.",
      ],
      [
        "Building paths with File.separator",
        "`File.separator` is `\\` on Windows and `/` elsewhere; `File.pathSeparator` (`;` or `:`) separates entries in lists like PATH. Instead of concatenating strings, prefer `new File(parent, child)` or `Path.of(\"data\", \"reports\", \"q3.txt\")`, which insert the right separator.",
      ],
      [
        "Parent directory",
        "`file.getParent()` returns the parent path as a String and `getParentFile()` as a File (null if the path has no parent component); `path.getParent()` does the same for `Path`. Use `getAbsoluteFile().getParentFile()` for relative paths, and `mkdirs()` or `Files.createDirectories` to create missing parents.",
      ],
      [
        "Available file system roots (drives)",
        "`File.listRoots()` returns the roots: drive letters such as `C:\\` and `D:\\` on Windows, a single `/` on Unix. `FileSystems.getDefault().getRootDirectories()` is the NIO version, and `FileStore` reports total and usable space.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.io.IOException;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path base = Files.createTempDirectory("create-demo");

        File report = new File(base.toFile(), "report.txt");
        System.out.println("createNewFile first time: " + report.createNewFile());
        System.out.println("createNewFile again: " + report.createNewFile() + " (already exists)");
        try {
            Files.createFile(report.toPath());
        } catch (FileAlreadyExistsException e) {
            System.out.println("Files.createFile on existing file -> FileAlreadyExistsException");
        }

        File missingParent = new File(base.toFile(), "no-such-dir" + File.separator + "x.txt");
        try {
            missingParent.createNewFile();
        } catch (IOException e) {
            System.out.println("createNewFile without parent directory -> IOException");
        }
        System.out.println("mkdirs creates parents: " + missingParent.getParentFile().mkdirs() + ", now createNewFile: " + missingParent.createNewFile());

        String cwd = System.getProperty("user.dir");
        System.out.println("working directory is absolute: " + new File(cwd).isAbsolute()
                + ", same as Path.of(\"\"): " + Path.of("").toAbsolutePath().toString().equals(cwd));

        String manual = "data" + File.separator + "reports" + File.separator + "q3.txt";
        Path built = Path.of("data", "reports", "q3.txt");
        System.out.println("separator '" + File.separator + "', manual path equals Path.of: " + manual.equals(built.toString()));

        System.out.println("parent of report: " + report.getParentFile().getName().startsWith("create-demo")
                + ", parent of a bare name: " + new File("bare.txt").getParent()
                + ", absolute parent exists: " + new File("bare.txt").getAbsoluteFile().getParentFile().exists());

        File[] roots = File.listRoots();
        System.out.println("file system roots found: " + (roots.length >= 1) + ", first root is a directory: " + roots[0].isDirectory());
        FileStore store = Files.getFileStore(base);
        System.out.println("temp drive has usable space: " + (store.getUsableSpace() > 0));
    }
}`,
    varies: true,
    walk:
      "`createNewFile` returns true the first time and false when the file already exists, while `Files.createFile` throws `FileAlreadyExistsException`. Creating a file in a directory that does not exist throws `IOException` until `mkdirs()` creates the missing parents.\n\nThe working directory comes from `user.dir` and matches `Path.of(\"\").toAbsolutePath()`. A path built by concatenating `File.separator` equals the one `Path.of` builds. `getParent()` on a bare file name is null, so convert to an absolute file first. `File.listRoots()` lists the drives or `/`, and `FileStore` reports free space.",
    anim: [
      "Resolving a relative path",
      [
        ["rel", "\"bare.txt\"", "relative"],
        ["cwd", "user.dir", "working dir"],
        ["abs", "absolute path", "cwd + name"],
        ["parent", "parent folder", "getParentFile()"],
        ["root", "root / drive", "listRoots()"],
      ],
      [
        ["rel", "cwd", "resolve", "A relative name is resolved against the JVM's working directory."],
        ["cwd", "abs", "join", "The result is an absolute path, joined with the right separator."],
        ["abs", "parent", "up", "getParentFile() on the absolute path returns the containing folder."],
        ["parent", "root", "up again", "Walking up parents eventually reaches a root such as C:\\ or /."],
      ],
    ],
    mistakes: [
      "Hard-coding `\\` or `/` in paths.",
      "Assuming the working directory is the project or JAR folder.",
      "Calling `getParent()` on a relative single-name path and getting null.",
    ],
    qa: [
      ["How do you create a new file in Java?", "`new File(path).createNewFile()` (returns false if it exists) or `Files.createFile(path)` (throws if it exists)."],
      ["How do you get the current working directory?", "`System.getProperty(\"user.dir\")` or `Path.of(\"\").toAbsolutePath()`."],
      ["How do you list the drives on a Windows machine?", "`File.listRoots()` or `FileSystems.getDefault().getRootDirectories()`."],
    ],
    ex: [
      "Create `logs/2026/11/app.log` under the temp directory with a single call that also creates missing folders.",
      "`Path p = tempDir.resolve(Path.of(\"logs\", \"2026\", \"11\", \"app.log\")); Files.createDirectories(p.getParent()); Files.createFile(p);`.",
    ],
  }),

  lesson("Reading Console Input: DataInputStream, BufferedReader and Scanner", {
    intro:
      "Command-line programs read input from the keyboard through `System.in`. Java offers several ways: the old `DataInputStream.readLine()`, `BufferedReader.readLine()`, `Scanner` with typed methods, and `Console`. This lesson compares them and shows how to read until a special character or a sentinel value.",
    topics: [
      [
        "DataInputStream",
        "`new DataInputStream(System.in).readLine()` was the earliest approach. That method is deprecated because it does not convert bytes to characters properly (it ignores the encoding). It is still fine for reading binary primitives with `readInt` etc., but not for text input.",
      ],
      [
        "BufferedReader.readLine()",
        "`new BufferedReader(new InputStreamReader(System.in))` reads a whole line as a String (null at end of input). It is fast and simple; you parse numbers yourself with `Integer.parseInt`. Good for competitive programming and large input.",
      ],
      [
        "Scanner",
        "`new Scanner(System.in)` splits input into tokens and parses them: `nextInt()`, `nextDouble()`, `next()`, `nextLine()`, `hasNextInt()`. Convenient but slower than BufferedReader. Mixing `nextInt()` and `nextLine()` leaves a newline behind, so the next `nextLine()` returns an empty string; consume it explicitly.",
      ],
      [
        "Reading until a special character or sentinel",
        "Read characters with `reader.read()` until a given character such as `.` appears, or read lines until a sentinel like `quit` or until `readLine()` returns null (end of input, Ctrl+D or Ctrl+Z). `Scanner.useDelimiter` changes how tokens are split.",
      ],
      [
        "Console",
        "`System.console()` offers `readLine` and `readPassword` (which hides typed characters). It returns null when input is redirected or in many IDEs, so check for null.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));

        String name = reader.readLine();                               // line 1
        System.out.println("BufferedReader.readLine: hello " + name);

        int[] numbers = java.util.Arrays.stream(reader.readLine().trim().split("\\s+")).mapToInt(Integer::parseInt).toArray();
        System.out.println("parsed numbers from one line, sum = " + java.util.Arrays.stream(numbers).sum());

        StringBuilder sentence = new StringBuilder();
        int ch;
        while ((ch = reader.read()) != -1 && ch != '.') sentence.append((char) ch);   // until '.'
        System.out.println("read until '.': \"" + sentence.toString().trim() + "\"");
        reader.readLine();                                             // rest of that line

        Scanner scanner = new Scanner(reader);                          // Scanner over the same input
        int age = scanner.nextInt();
        String afterInt = scanner.nextLine();                           // leftover newline
        String city = scanner.nextLine();
        System.out.println("Scanner: age " + age + ", leftover after nextInt = \"" + afterInt + "\", city " + city);

        int total = 0, count = 0;
        while (scanner.hasNext()) {
            String token = scanner.next();
            if (token.equals("quit")) break;                           // sentinel
            if (scanner.hasNextInt() || token.matches("-?\\d+")) { total += Integer.parseInt(token); count++; }
        }
        System.out.println("scores until quit: " + count + " values, total " + total);

        System.out.println("System.console() available when input is piped: " + (System.console() != null));
        System.out.println("DataInputStream.readLine is deprecated: "
                + DataInputStream.class.getMethod("readLine").isAnnotationPresent(Deprecated.class));
    }
}`,
    stdin: "Asha\n3 5 7\nJava is fun. extra text\n25\nPune\n90 80 70 quit 60\n",
    walk:
      "The input is piped in so the program runs without a keyboard. `BufferedReader.readLine()` reads the name and then a line of numbers, which are split and parsed manually. A loop with `read()` collects characters until a full stop.\n\n`Scanner` then reads an int with `nextInt()`; the following `nextLine()` returns only the leftover empty remainder of that line, so a second `nextLine()` is needed to get the city, the classic Scanner trap. Tokens are summed until the sentinel `quit`. `System.console()` is null because input is redirected, and `DataInputStream.readLine` carries the `@Deprecated` annotation.",
    anim: [
      "The nextInt / nextLine trap",
      [
        ["input", "\"25\\nPune\\n\"", "System.in"],
        ["nextInt", "nextInt()", "reads 25"],
        ["left", "\"\\n\" left", "in buffer"],
        ["nl1", "nextLine()", "returns \"\""],
        ["nl2", "nextLine()", "returns Pune"],
      ],
      [
        ["input", "nextInt", "token", "nextInt() reads the token 25 but stops before the line break."],
        ["nextInt", "left", "remains", "The newline after 25 is still waiting in the buffer."],
        ["left", "nl1", "consume", "The first nextLine() returns the rest of that line: an empty string."],
        ["nl1", "nl2", "next line", "Only the second nextLine() returns the next real line, Pune."],
      ],
    ],
    mistakes: [
      "Using `nextLine()` right after `nextInt()` and getting an empty string.",
      "Using deprecated `DataInputStream.readLine()` for text.",
      "Assuming `System.console()` is always available.",
    ],
    qa: [
      ["What are the ways to read console input in Java?", "BufferedReader over InputStreamReader(System.in), Scanner, Console, and (deprecated for text) DataInputStream.readLine()."],
      ["What is the difference between Scanner and BufferedReader?", "Scanner parses typed tokens with regular expressions and is convenient but slower; BufferedReader reads raw lines quickly and leaves parsing to you."],
      ["How do you read a password without echoing it?", "Use System.console().readPassword(), which returns a char[] you can clear afterwards."],
    ],
    ex: [
      "Read integers from input until the user enters 0, then print their average.",
      "With Scanner: `while (true) { int n = sc.nextInt(); if (n == 0) break; sum += n; count++; }` then print `(double) sum / count` (guarding against count == 0).",
    ],
  }),

  lesson("Reading Files: FileInputStream, BufferedInputStream and Reading into a String", {
    intro:
      "Reading a file's contents is the most common I/O task. This lesson reads a file with `FileInputStream`, speeds it up with `BufferedInputStream` and a byte buffer, and shows the ways to read a whole file or `InputStream` into a String: the modern `readAllBytes` and `Files.readString`, and the Apache Commons `IOUtils.toString` approach implemented by hand.",
    topics: [
      [
        "Reading with FileInputStream",
        "`read()` returns the next byte as 0 to 255, or -1 at end of file. `read(byte[] buffer)` fills as much of the buffer as possible and returns how many bytes were read (or -1). Always use the returned count, not the buffer length, because the last read is usually partial.",
      ],
      [
        "Reading with BufferedInputStream",
        "Wrapping in `BufferedInputStream` makes single-byte `read()` calls cheap and adds `mark`/`reset`. When you already read with a large byte array, buffering adds little.",
      ],
      [
        "Reading a file into a String",
        "Java 11: `Files.readString(path, UTF_8)`. Java 9: `new String(in.readAllBytes(), UTF_8)`. For line-based processing, `Files.readAllLines` or `Files.lines` (a stream, closed with try-with-resources). Very large files should be processed incrementally rather than loaded at once.",
      ],
      [
        "Converting any InputStream to a String (IOUtils style)",
        "Apache Commons IO offers `IOUtils.toString(inputStream, UTF_8)`. Without libraries: copy the stream into a `ByteArrayOutputStream` with a byte buffer loop (or `in.transferTo(out)`, Java 9) and call `out.toString(UTF_8)`.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.stream.Stream;

public class Main {
    static String toStringLikeIOUtils(InputStream in) throws IOException {   // manual IOUtils.toString
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int n;
        while ((n = in.read(buffer)) != -1) out.write(buffer, 0, n);         // use n, not buffer.length
        return out.toString(StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("read-demo", ".txt");
        Files.writeString(file, "line one\nline two\nline three\n", StandardCharsets.UTF_8);

        StringBuilder byByte = new StringBuilder();
        try (FileInputStream in = new FileInputStream(file.toFile())) {
            int b;
            while ((b = in.read()) != -1) byByte.append((char) b);           // ASCII-only content here
        }
        System.out.println("FileInputStream byte by byte read " + byByte.length() + " bytes");

        int reads = 0, total = 0;
        try (InputStream in = new BufferedInputStream(new FileInputStream(file.toFile()))) {
            byte[] chunk = new byte[10];
            int n;
            while ((n = in.read(chunk)) != -1) { reads++; total += n; }
        }
        System.out.println("BufferedInputStream with a 10-byte array: " + reads + " reads, " + total + " bytes, last read was partial");

        try (InputStream in = Files.newInputStream(file)) {
            System.out.println("IOUtils-style copy: " + toStringLikeIOUtils(in).lines().count() + " lines");
        }
        try (InputStream in = Files.newInputStream(file)) {
            System.out.println("readAllBytes: " + new String(in.readAllBytes(), StandardCharsets.UTF_8).length() + " chars");
        }
        System.out.println("Files.readString: " + Files.readString(file).strip().replace("\n", " | "));

        List<String> lines = Files.readAllLines(file);
        System.out.println("Files.readAllLines: " + lines);
        try (Stream<String> stream = Files.lines(file)) {
            System.out.println("Files.lines with 'two': " + stream.filter(l -> l.contains("two")).findFirst().orElse("none"));
        }

        try (InputStream resource = new ByteArrayInputStream("from any InputStream".getBytes(StandardCharsets.UTF_8))) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            resource.transferTo(out);
            System.out.println("transferTo: " + out.toString(StandardCharsets.UTF_8));
        }
        Files.delete(file);
    }
}`,
    walk:
      "The file has three lines totalling 29 bytes. Reading byte by byte with `FileInputStream` returns 29 bytes. Reading through `BufferedInputStream` with a 10-byte array takes three reads, and the last one returns only 9 bytes, which is why the loop uses the returned count.\n\n`toStringLikeIOUtils` reproduces Apache Commons' `IOUtils.toString` with a buffer loop into a `ByteArrayOutputStream`. The modern one-liners give the same content: `readAllBytes`, `Files.readString`, `Files.readAllLines` and the lazy `Files.lines` stream. `transferTo` copies any InputStream in one call.",
    anim: [
      "Reading with a byte buffer",
      [
        ["file", "file", "29 bytes"],
        ["r1", "read #1", "10 bytes"],
        ["r2", "read #2", "10 bytes"],
        ["r3", "read #3", "9 bytes"],
        ["eof", "read #4", "-1 = EOF"],
      ],
      [
        ["file", "r1", "fill", "The first read fills the 10-byte buffer completely."],
        ["r1", "r2", "next", "The second read fills it again."],
        ["r2", "r3", "partial", "The third read returns only 9 bytes: always use the returned count."],
        ["r3", "eof", "end", "The next read returns -1, signalling end of file."],
      ],
    ],
    mistakes: [
      "Writing `out.write(buffer)` instead of `out.write(buffer, 0, n)`, which writes stale bytes from earlier reads.",
      "Loading huge files completely with readAllBytes or readString.",
      "Casting bytes to char for non-ASCII text instead of decoding with a charset.",
    ],
    qa: [
      ["How do you read a file into a String in Java?", "`Files.readString(path)` (Java 11), or `new String(Files.readAllBytes(path), UTF_8)`."],
      ["How do you convert an InputStream to a String?", "`new String(in.readAllBytes(), UTF_8)`, `in.transferTo(byteArrayOut)` then toString, or Apache Commons `IOUtils.toString(in, UTF_8)`."],
      ["What does read() return at end of file?", "-1."],
    ],
    ex: [
      "Count how many times the byte for 'e' appears in the file using a buffered read loop.",
      "Read chunks with `n = in.read(buf)` and loop `for (int i = 0; i < n; i++) if (buf[i] == 'e') count++;`. For \"line one\\nline two\\nline three\\n\" the count is 6.",
    ],
  }),

  lesson("Writing Files: FileOutputStream, BufferedOutputStream, FileWriter, BufferedWriter and PrintWriter", {
    intro:
      "Java has several classes for writing files, from raw bytes to formatted text. This lesson writes with `FileOutputStream` and `BufferedOutputStream` for bytes, `FileWriter` and `BufferedWriter` for text, and `PrintWriter` for formatted output, and covers appending, flushing and choosing an encoding.",
    topics: [
      [
        "FileOutputStream and BufferedOutputStream",
        "`FileOutputStream` writes bytes: `write(int)`, `write(byte[])`, `write(byte[], off, len)`. `new FileOutputStream(file, true)` appends instead of truncating. Wrap it in `BufferedOutputStream` so many small writes become few large ones; data sits in the buffer until it is full, flushed or closed.",
      ],
      [
        "FileWriter and BufferedWriter",
        "`FileWriter` writes characters; since Java 11 pass a charset: `new FileWriter(file, UTF_8, append)`. `BufferedWriter` adds buffering and `newLine()`, which writes the platform line separator.",
      ],
      [
        "PrintWriter",
        "Wraps a Writer, OutputStream or file and adds `print`, `println`, `printf` and `format`. It never throws IOException; instead check `checkError()`. Construct it with autoflush when writing to interactive outputs.",
      ],
      [
        "Flushing and closing",
        "`flush()` pushes buffered data to the underlying stream; `close()` flushes and releases the file handle. Forgetting both loses data. Try-with-resources closes automatically, and closing the outermost wrapper closes the whole chain.",
      ],
      [
        "Modern shortcuts",
        "`Files.write(path, bytes)`, `Files.writeString(path, text, UTF_8, StandardOpenOption.APPEND)` and `Files.newBufferedWriter(path, UTF_8)` cover most cases in one line.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("write-demo");

        File bin = dir.resolve("data.bin").toFile();
        try (FileOutputStream out = new FileOutputStream(bin)) {
            out.write(65);                                         // single byte 'A'
            out.write(new byte[] {66, 67, 68});                    // B C D
        }
        try (OutputStream out = new BufferedOutputStream(new FileOutputStream(bin, true))) {   // append
            for (int i = 0; i < 1000; i++) out.write('x');         // buffered small writes
        }
        System.out.println("FileOutputStream + BufferedOutputStream append: " + bin.length() + " bytes, starts with "
                + new String(Files.readAllBytes(bin.toPath()), 0, 4, StandardCharsets.US_ASCII));

        File text = dir.resolve("notes.txt").toFile();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(text, StandardCharsets.UTF_8))) {
            writer.write("first line");
            writer.newLine();
            writer.write("second line with \u20B9");
            writer.newLine();
        }
        try (FileWriter appender = new FileWriter(text, StandardCharsets.UTF_8, true)) {
            appender.write("appended line" + System.lineSeparator());
        }
        System.out.println("BufferedWriter + FileWriter append: " + Files.readAllLines(text.toPath()));

        File csv = dir.resolve("report.csv").toFile();
        try (PrintWriter pw = new PrintWriter(new FileWriter(csv, StandardCharsets.UTF_8))) {
            pw.println("item,qty,price");
            pw.printf("%s,%d,%.2f%n", "pen", 3, 10.5);
            pw.printf("%s,%d,%.2f%n", "ink", 1, 45.0);
            System.out.println("PrintWriter checkError: " + pw.checkError());
        }
        System.out.println("PrintWriter output: " + Files.readAllLines(csv.toPath()));

        File unflushed = dir.resolve("lost.txt").toFile();
        BufferedWriter forgotten = new BufferedWriter(new FileWriter(unflushed));
        forgotten.write("this stays in the buffer");
        System.out.println("before flush/close, file length = " + unflushed.length());
        forgotten.close();
        System.out.println("after close, file length = " + unflushed.length());

        Files.writeString(dir.resolve("quick.txt"), "one-liner\n", StandardCharsets.UTF_8);
        Files.writeString(dir.resolve("quick.txt"), "appended\n", StandardOpenOption.APPEND);
        System.out.println("Files.writeString: " + Files.readAllLines(dir.resolve("quick.txt")));
    }
}`,
    walk:
      "The byte file gets one byte, then three, through `FileOutputStream`; a `BufferedOutputStream` opened in append mode adds 1,000 more bytes efficiently, for 1,004 in total starting with \"ABCD\". The text file is written with a `BufferedWriter` (using `newLine()`) and then extended by a `FileWriter` in append mode.\n\n`PrintWriter` writes CSV rows with `printf` and reports problems through `checkError()` instead of exceptions. The \"lost\" file shows buffering: until the writer is closed (or flushed), its length is 0 because the text is still in memory. The `Files.writeString` one-liner writes and then appends.",
    anim: [
      "Why close or flush matters",
      [
        ["code", "writer.write()", "your text"],
        ["buf", "8 KB buffer", "in memory"],
        ["flush", "flush()/close()", "push"],
        ["os", "OS file", "on disk"],
        ["lost", "no close", "data lost"],
      ],
      [
        ["code", "buf", "write", "write() only copies characters into the writer's buffer."],
        ["buf", "flush", "full or flush", "Data moves on when the buffer fills or you call flush() or close()."],
        ["flush", "os", "write", "Flushing hands the bytes to the operating system's file."],
        ["buf", "lost", "exit", "If the program ends without flush or close, buffered data never reaches the file."],
      ],
    ],
    mistakes: [
      "Forgetting to close or flush buffered writers, losing the tail of the output.",
      "Opening FileOutputStream without append=true and accidentally truncating a file.",
      "Ignoring PrintWriter errors because it never throws; check `checkError()`.",
    ],
    qa: [
      ["How do you append to a file?", "Pass true as the append flag (new FileOutputStream(f, true), new FileWriter(f, true)) or use Files.write with StandardOpenOption.APPEND."],
      ["What is the difference between FileWriter and PrintWriter?", "FileWriter writes characters to a file; PrintWriter wraps a writer or stream and adds print/println/printf formatting without throwing IOException."],
      ["What is the difference between flush and close?", "flush pushes buffered data to the underlying stream; close flushes and then releases the resource."],
    ],
    ex: [
      "Write a multiplication table of 7 (7 x 1 to 7 x 10) to a file with PrintWriter, one line per row.",
      "`try (PrintWriter pw = new PrintWriter(Files.newBufferedWriter(path))) { for (int i = 1; i <= 10; i++) pw.printf(\"7 x %d = %d%n\", i, 7 * i); }`.",
    ],
  }),

  lesson("FileReader, FileWriter and BufferedReader read() vs readLine()", {
    intro:
      "Character streams have two ways to read: `read()` returns one character at a time, and `BufferedReader.readLine()` returns a whole line. This lesson copies text with `FileReader` and `FileWriter`, compares `read()` and `readLine()`, and answers a common question: when you wrap streams, should you close both the inner stream and the wrapper?",
    topics: [
      [
        "FileReader and FileWriter",
        "Convenience classes for reading and writing text files with a charset (Java 11 constructors accept a `Charset`). They are unbuffered, so wrap them in `BufferedReader` and `BufferedWriter` for efficiency.",
      ],
      [
        "read()",
        "`read()` returns the next character as an int (0 to 65535) or -1 at end of stream. `read(char[] buf)` fills a buffer and returns the count. Line terminators are returned as ordinary characters (`\\n`, `\\r`).",
      ],
      [
        "readLine()",
        "`BufferedReader.readLine()` returns the next line without its terminator (`\\n`, `\\r` or `\\r\\n`), or null at end of stream. Because terminators are stripped, you add them back when writing (`newLine()`). `lines()` returns a Stream of lines.",
      ],
      [
        "Should you close both the stream and the buffered wrapper?",
        "No. Closing the outermost wrapper (BufferedReader) closes the stream it wraps, so closing only the wrapper is enough, and closing an already closed stream is harmless. The safest style declares both in try-with-resources (`try (FileReader fr = ...; BufferedReader br = new BufferedReader(fr))`), which also closes the inner stream if constructing the wrapper fails.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    static class TrackingReader extends FileReader {
        boolean closed = false;
        TrackingReader(File f) throws IOException { super(f, StandardCharsets.UTF_8); }
        @Override public void close() throws IOException { closed = true; super.close(); }
    }

    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("reader-demo");
        File source = dir.resolve("source.txt").toFile();
        File copy = dir.resolve("copy.txt").toFile();
        Files.writeString(source.toPath(), "alpha\nbeta\r\ngamma");

        try (FileReader in = new FileReader(source, StandardCharsets.UTF_8);
             FileWriter out = new FileWriter(copy, StandardCharsets.UTF_8)) {
            int c, chars = 0, newlines = 0;
            while ((c = in.read()) != -1) {                       // one char at a time
                if (c == '\n') newlines++;
                out.write(c);
                chars++;
            }
            System.out.println("read(): copied " + chars + " chars including " + newlines + " '\\n' characters");
        }
        System.out.println("copy identical: " + Files.mismatch(source.toPath(), copy.toPath()));

        try (BufferedReader br = new BufferedReader(new FileReader(source, StandardCharsets.UTF_8))) {
            String line;
            int n = 0;
            while ((line = br.readLine()) != null) {
                System.out.println("readLine() " + (++n) + ": \"" + line + "\" (terminator removed, length " + line.length() + ")");
            }
        }

        TrackingReader inner = new TrackingReader(source);
        BufferedReader wrapper = new BufferedReader(inner);
        wrapper.readLine();
        wrapper.close();                                           // close only the wrapper
        System.out.println("closing the BufferedReader also closed the FileReader: " + inner.closed);
        inner.close();                                             // closing again is harmless
        System.out.println("closing the inner reader again caused no error");

        try (BufferedReader br = Files.newBufferedReader(source.toPath())) {
            System.out.println("lines() stream count: " + br.lines().count());
        }
    }
}`,
    walk:
      "The copy loop uses `FileReader.read()` one character at a time and writes each to a `FileWriter`. Line terminators come through as ordinary characters (two `\\n`s, plus a `\\r` for the Windows-style break), and `Files.mismatch` returns -1, meaning the copy is identical.\n\n`readLine()` returns the three lines without their terminators, regardless of whether a line ended in `\\n`, `\\r\\n` or end of file. The tracking reader proves that closing only the `BufferedReader` also closes the wrapped `FileReader`, and closing it again is harmless.",
    anim: [
      "read() vs readLine()",
      [
        ["text", "\"beta\\r\\n\"", "in the file"],
        ["read", "read()", "one char"],
        ["chars", "b,e,t,a,\\r,\\n", "6 calls"],
        ["readLine", "readLine()", "one call"],
        ["line", "\"beta\"", "no terminator"],
      ],
      [
        ["text", "read", "char", "read() returns the next single character as an int."],
        ["read", "chars", "repeat", "It takes six calls for this line, terminators included."],
        ["text", "readLine", "line", "readLine() scans to the next line break in one call."],
        ["readLine", "line", "strip", "It returns \"beta\" with the \\r\\n terminator removed."],
      ],
    ],
    mistakes: [
      "Expecting `readLine()` output to contain the newline.",
      "Using unbuffered `FileReader.read()` for big files.",
      "Opening the inner stream outside try-with-resources, leaking it if the wrapper constructor throws.",
    ],
    qa: [
      ["What is the difference between read() and readLine()?", "read() returns a single character (or -1); readLine() returns an entire line without its terminator (or null) and is only on BufferedReader."],
      ["Do you need to close both the FileReader and the BufferedReader?", "Closing the BufferedReader closes the FileReader too; declaring both in try-with-resources is the safest pattern."],
      ["Which line terminators does readLine() recognise?", "\\n, \\r and \\r\\n."],
    ],
    ex: [
      "Convert a file with Windows line endings (\\r\\n) to Unix line endings (\\n).",
      "Read with `readLine()` (which strips either terminator) and write each line followed by `\"\\n\"`, or use `Files.writeString(out, Files.readString(in).replace(\"\\r\\n\", \"\\n\"))`.",
    ],
  }),

  lesson("Try-with-Resources for Files and Byte Arrays", {
    intro:
      "Every opened file must be closed, even when an exception occurs halfway through. Try-with-resources (Java 7) makes that automatic. This lesson reads and writes files with try-with-resources, writes a byte array to a file and reads a file back into a byte array, and compares the code with the pre-Java 7 style.",
    topics: [
      [
        "Reading a file with try-with-resources",
        "`try (BufferedReader br = Files.newBufferedReader(path)) { ... }` closes the reader when the block ends, normally or with an exception. Several resources can be declared, separated by semicolons, and they close in reverse order.",
      ],
      [
        "The pre-Java 7 way",
        "Declare the stream before try, close it in finally inside its own try-catch, and check for null. It is verbose and easy to get wrong; an exception from close could hide the original one.",
      ],
      [
        "Writing a byte array to a file",
        "`try (FileOutputStream out = new FileOutputStream(file)) { out.write(bytes); }`, or simply `Files.write(path, bytes)`.",
      ],
      [
        "Reading a file into a byte array",
        "`Files.readAllBytes(path)` or `in.readAllBytes()`. Before Java 7 you would allocate `new byte[(int) file.length()]` and loop until it was full, because a single `read` may return fewer bytes than requested.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.Arrays;

public class Main {
    static byte[] readOldStyle(File file) throws IOException {     // pre-Java 7, still correct
        FileInputStream in = null;
        try {
            in = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            int offset = 0;
            while (offset < data.length) {
                int n = in.read(data, offset, data.length - offset);
                if (n == -1) throw new EOFException("file shrank while reading");
                offset += n;
            }
            return data;
        } finally {
            if (in != null) {
                try { in.close(); } catch (IOException ignored) { }
            }
        }
    }

    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("twr-demo");
        File file = dir.resolve("image.bin").toFile();
        byte[] original = new byte[5000];
        for (int i = 0; i < original.length; i++) original[i] = (byte) (i % 251);

        try (FileOutputStream out = new FileOutputStream(file)) {   // byte array -> file
            out.write(original);
        }
        System.out.println("wrote " + file.length() + " bytes");

        byte[] modern;
        try (FileInputStream in = new FileInputStream(file)) {     // file -> byte array
            modern = in.readAllBytes();
        }
        System.out.println("readAllBytes matches: " + Arrays.equals(original, modern));
        System.out.println("old-style loop matches: " + Arrays.equals(original, readOldStyle(file)));
        System.out.println("Files.readAllBytes matches: " + Arrays.equals(original, Files.readAllBytes(file.toPath())));

        Path text = dir.resolve("lines.txt");
        Files.write(text, "a\nb\nc\n".getBytes());
        try (BufferedReader reader = Files.newBufferedReader(text);
             BufferedWriter writer = Files.newBufferedWriter(dir.resolve("upper.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) { writer.write(line.toUpperCase()); writer.newLine(); }
        }
        System.out.println("two resources in one try: " + Files.readAllLines(dir.resolve("upper.txt")));

        try (BufferedReader reader = Files.newBufferedReader(dir.resolve("missing.txt"))) {
            reader.readLine();
        } catch (NoSuchFileException e) {
            System.out.println("missing file handled, nothing left open: " + e.getClass().getSimpleName());
        }
    }
}`,
    walk:
      "A 5,000-byte array is written to a file with `FileOutputStream` inside try-with-resources, then read back with `readAllBytes`, with the pre-Java 7 loop and with `Files.readAllBytes`; all three copies match the original. The old-style method shows the boilerplate try-with-resources replaces: a nullable variable, a read loop that handles partial reads, and a nested try in finally.\n\nTwo resources declared in one try header convert a file to upper case and are closed automatically in reverse order. Opening a missing file throws `NoSuchFileException`, and there is nothing to leak.",
    anim: [
      "Old finally vs try-with-resources",
      [
        ["old", "Java 6 style", "try/finally"],
        ["null", "null checks", "boilerplate"],
        ["nested", "nested try", "around close"],
        ["twr", "try (res)", "Java 7+"],
        ["auto", "auto close()", "always"],
      ],
      [
        ["old", "null", "declare", "The old style declares the stream outside try and must check for null."],
        ["null", "nested", "close", "close() can throw too, so it needs its own try-catch in finally."],
        ["twr", "auto", "declare", "With try-with-resources the stream is declared in the try header."],
        ["auto", "twr", "safe", "It is closed automatically, and close failures are attached as suppressed."],
      ],
    ],
    mistakes: [
      "Assuming one `read(buffer)` call fills the buffer completely.",
      "Returning a stream from inside try-with-resources (it is already closed).",
      "Reading huge files into one byte array.",
    ],
    qa: [
      ["How do you write a byte array to a file?", "`Files.write(path, bytes)` or a FileOutputStream in try-with-resources calling write(bytes)."],
      ["How do you read a file into a byte array?", "`Files.readAllBytes(path)` or `inputStream.readAllBytes()`."],
      ["Why is try-with-resources better than finally for files?", "It closes resources automatically in the right order, even on exceptions, with less code, and keeps the original exception while attaching close failures as suppressed."],
    ],
    ex: [
      "Copy a binary file with try-with-resources using an 8 KB buffer (no Files.copy).",
      "`try (InputStream in = new FileInputStream(src); OutputStream out = new FileOutputStream(dst)) { byte[] b = new byte[8192]; int n; while ((n = in.read(b)) != -1) out.write(b, 0, n); }`.",
    ],
  }),

  lesson("mark() and reset() with BufferedInputStream and BufferedReader", {
    intro:
      "Sometimes you need to look ahead in a stream and then go back: peek at a file header to detect its format, or try a parse and retry from the same position. `mark()` remembers the current position and `reset()` returns to it. This lesson explains mark and reset, the read-ahead limit, and which streams support them.",
    topics: [
      [
        "How mark and reset work",
        "`mark(readAheadLimit)` remembers the current position; after reading up to `readAheadLimit` bytes or characters, `reset()` jumps back to that position so the same data is read again. The buffered stream keeps the marked data in its buffer.",
      ],
      [
        "markSupported()",
        "Not every stream supports it. `BufferedInputStream`, `BufferedReader`, `ByteArrayInputStream`, `CharArrayReader` and `StringReader` do; `FileInputStream` and `FileReader` do not (their `reset()` throws IOException). Check `markSupported()` first, and wrap in a buffered stream if needed.",
      ],
      [
        "The read-ahead limit",
        "If you read more than the limit after marking, the mark may become invalid and `reset()` throws `IOException(\"Resetting to invalid mark\")` (for BufferedInputStream, once the buffer had to be refilled). Choose a limit large enough for the look-ahead you need.",
      ],
      [
        "Typical uses",
        "Detecting file types by magic numbers (\"%PDF\", PNG signature) before handing the stream to the right parser, sniffing a byte-order mark, peeking at the first line of a CSV to decide the delimiter, or lexers that need one character of look-ahead.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    static String detect(InputStream raw) throws IOException {
        BufferedInputStream in = new BufferedInputStream(raw);
        in.mark(8);                                      // remember position 0
        byte[] magic = in.readNBytes(4);
        in.reset();                                      // back to position 0 for the real parser
        String type = magic[0] == '%' && magic[1] == 'P' ? "PDF" : (magic[0] & 0xFF) == 0x89 && magic[1] == 'P' ? "PNG" : "text";
        int firstByteAgain = in.read();
        return type + " (first byte after reset: " + String.format("0x%02X", firstByteAgain) + ")";
    }

    public static void main(String[] args) throws IOException {
        System.out.println("detected: " + detect(new ByteArrayInputStream("%PDF-1.7 ...".getBytes(StandardCharsets.US_ASCII))));
        System.out.println("detected: " + detect(new ByteArrayInputStream(new byte[] {(byte) 0x89, 'P', 'N', 'G', 13, 10})));
        System.out.println("detected: " + detect(new ByteArrayInputStream("hello world".getBytes())));

        try (BufferedReader reader = new BufferedReader(new StringReader("name;age\nAsha;31\n"))) {
            reader.mark(1000);
            String header = reader.readLine();
            char delimiter = header.contains(";") ? ';' : ',';
            reader.reset();                              // re-read the header with the right delimiter
            System.out.println("BufferedReader peeked header, delimiter '" + delimiter + "', re-read: " + reader.readLine());
        }

        Path file = Files.createTempFile("mark", ".txt");
        Files.writeString(file, "abc");
        try (FileInputStream plain = new FileInputStream(file.toFile())) {
            System.out.println("FileInputStream.markSupported(): " + plain.markSupported());
            plain.mark(10);
            plain.read();
            try { plain.reset(); } catch (IOException e) { System.out.println("FileInputStream.reset() -> IOException: " + e.getMessage()); }
        }

        byte[] big = new byte[100_000];
        BufferedInputStream small = new BufferedInputStream(new ByteArrayInputStream(big), 16);
        small.mark(4);
        small.readNBytes(1000);                           // far beyond the read-ahead limit
        try { small.reset(); } catch (IOException e) { System.out.println("read past the limit -> " + e.getMessage()); }
        Files.delete(file);
    }
}`,
    walk:
      "`detect` wraps any stream in a `BufferedInputStream`, marks position 0, reads four bytes to check the magic number, then resets so the next reader starts from the beginning again; the first byte read after `reset()` proves it. It recognises a PDF, a PNG and plain text.\n\n`BufferedReader` peeks at a CSV header to choose the delimiter and resets to read the header again. `FileInputStream` does not support marks, so its `reset()` throws. Reading far beyond the read-ahead limit through a tiny 16-byte buffer invalidates the mark, and `reset()` throws \"Resetting to invalid mark\".",
    anim: [
      "Peek, then rewind",
      [
        ["mark", "mark(8)", "position 0"],
        ["peek", "read 4 bytes", "%PDF"],
        ["decide", "detect type", "PDF"],
        ["reset", "reset()", "back to 0"],
        ["parse", "real parser", "reads from 0"],
      ],
      [
        ["mark", "peek", "read", "After mark(8), reading the first 4 bytes is still within the limit."],
        ["peek", "decide", "inspect", "The magic number %PDF identifies the file type."],
        ["decide", "reset", "rewind", "reset() moves back to the marked position, using the buffered bytes."],
        ["reset", "parse", "hand over", "The parser receives the stream as if nothing had been read."],
      ],
    ],
    mistakes: [
      "Calling `reset()` on streams that do not support marks.",
      "Using a read-ahead limit smaller than the amount you actually read before resetting.",
    ],
    qa: [
      ["What do mark() and reset() do?", "mark remembers the current stream position; reset returns to it so the data can be read again, within the read-ahead limit."],
      ["Which streams support mark and reset?", "BufferedInputStream, BufferedReader, ByteArrayInputStream, StringReader and CharArrayReader (check markSupported())."],
      ["What happens if you read past the read-ahead limit?", "The mark may be invalidated and reset() throws IOException."],
    ],
    ex: [
      "Write `boolean startsWithBom(InputStream in)` that checks for the UTF-8 BOM (EF BB BF) without consuming bytes when there is none.",
      "Wrap in BufferedInputStream, `mark(3)`, read 3 bytes, compare with 0xEF, 0xBB, 0xBF, and `reset()` if they do not match (skip them if they do).",
    ],
  }),

  lesson("Encrypting and Decrypting Text with a Password", {
    intro:
      "Sensitive text such as notes or configuration secrets should not be stored in plain form. Java's cryptography API can derive a key from a password and encrypt data with AES. This lesson encrypts a message with a password, writes it to a file, reads it back and decrypts it, using PBKDF2 key derivation and AES-GCM authenticated encryption.",
    topics: [
      [
        "Deriving a key from a password",
        "Passwords are not keys. Use a key-derivation function: `PBKDF2WithHmacSHA256` with a random salt (16 bytes) and many iterations (for example 210,000) produces a 256-bit AES key. The salt is not secret and is stored with the ciphertext so the same key can be derived again.",
      ],
      [
        "Encrypting with AES-GCM",
        "`Cipher.getInstance(\"AES/GCM/NoPadding\")` with a fresh random 12-byte IV (nonce) for every message. GCM both encrypts and authenticates: any change to the ciphertext, or the wrong password, makes decryption fail with `AEADBadTagException` instead of returning garbage.",
      ],
      [
        "Storing the result",
        "Write salt, IV and ciphertext together, for example as `salt || iv || ciphertext` in a binary file or Base64 text. Reading reverses the process: split the parts, re-derive the key from the password and salt, and decrypt.",
      ],
      [
        "What not to do",
        "Do not use ECB mode, a fixed IV, a password directly as a key, MD5/SHA-1 for passwords, or homemade XOR \"encryption\". Do not log keys or passwords. For storing user passwords (not encrypting data), use a password hash such as bcrypt or Argon2 instead.",
      ],
    ],
    code: String.raw`import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.SecureRandom;
import java.util.Base64;

public class Main {
    static final SecureRandom RANDOM = new SecureRandom();

    static SecretKeySpec deriveKey(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, 210_000, 256);
        byte[] key = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        spec.clearPassword();
        return new SecretKeySpec(key, "AES");
    }

    static byte[] encrypt(String text, char[] password) throws Exception {
        byte[] salt = new byte[16], iv = new byte[12];
        RANDOM.nextBytes(salt);
        RANDOM.nextBytes(iv);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, deriveKey(password, salt), new GCMParameterSpec(128, iv));
        byte[] ciphertext = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
        return ByteBuffer.allocate(16 + 12 + ciphertext.length).put(salt).put(iv).put(ciphertext).array();
    }

    static String decrypt(byte[] data, char[] password) throws Exception {
        ByteBuffer buf = ByteBuffer.wrap(data);
        byte[] salt = new byte[16], iv = new byte[12], ciphertext = new byte[data.length - 28];
        buf.get(salt).get(iv).get(ciphertext);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, deriveKey(password, salt), new GCMParameterSpec(128, iv));
        return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws Exception {
        char[] password = "correct horse battery staple".toCharArray();
        String secret = "Bank PIN reminder: ask the bank, never write it down.";

        byte[] encrypted = encrypt(secret, password);
        Path file = Files.createTempFile("secret", ".enc");
        Files.writeString(file, Base64.getEncoder().encodeToString(encrypted));    // store as Base64 text
        System.out.println("file contains readable text: " + Files.readString(file).contains("Bank"));

        byte[] fromFile = Base64.getDecoder().decode(Files.readString(file));
        System.out.println("decrypted: " + decrypt(fromFile, password));

        byte[] again = encrypt(secret, password);
        System.out.println("same text encrypted twice gives different bytes (random salt and IV): "
                + !java.util.Arrays.equals(encrypted, again));

        try {
            decrypt(fromFile, "wrong password".toCharArray());
        } catch (AEADBadTagException e) {
            System.out.println("wrong password -> AEADBadTagException (authentication failed)");
        }
        fromFile[fromFile.length - 1] ^= 1;                          // tamper with one bit
        try {
            decrypt(fromFile, password);
        } catch (AEADBadTagException e) {
            System.out.println("tampered file -> AEADBadTagException");
        }
        java.util.Arrays.fill(password, '\0');                       // wipe the password from memory
        Files.delete(file);
    }
}`,
    walk:
      "`encrypt` generates a random salt and IV, derives an AES key from the password with PBKDF2 (210,000 iterations), encrypts with AES-GCM, and packs salt, IV and ciphertext into one array. The program stores it in a file as Base64, which contains no readable trace of the message.\n\nReading the file and calling `decrypt` re-derives the same key from the password and the stored salt and recovers the text. Encrypting the same text again yields different bytes because the salt and IV are random. A wrong password and a single flipped bit both make GCM's authentication fail with `AEADBadTagException`. Finally the password array is wiped.",
    anim: [
      "Password to ciphertext",
      [
        ["pw", "password", "char[]"],
        ["kdf", "PBKDF2", "salt + 210k iters"],
        ["key", "AES-256 key", "derived"],
        ["gcm", "AES-GCM", "random IV"],
        ["file", "salt|iv|data", "stored"],
      ],
      [
        ["pw", "kdf", "stretch", "The password and a random salt go through PBKDF2 many times."],
        ["kdf", "key", "derive", "The result is a 256-bit key; the same password and salt always give the same key."],
        ["key", "gcm", "encrypt", "AES-GCM encrypts the text with a fresh IV and adds an authentication tag."],
        ["gcm", "file", "store", "Salt, IV and ciphertext are stored together; only the password stays secret."],
      ],
    ],
    mistakes: [
      "Using ECB mode or a constant IV, which leaks patterns.",
      "Using the password bytes directly as the AES key.",
      "Storing the password in a String that lingers in memory instead of a char[] that can be wiped.",
    ],
    qa: [
      ["How do you encrypt text with a password in Java?", "Derive a key with PBKDF2 (SecretKeyFactory) and a random salt, then encrypt with Cipher using AES/GCM/NoPadding and a random IV; store salt and IV with the ciphertext."],
      ["Why use GCM mode?", "It provides confidentiality and integrity: tampering or a wrong key is detected (AEADBadTagException)."],
      ["Why is the salt stored with the ciphertext?", "The salt is not secret; it is needed to derive the same key again, and it makes precomputed attacks useless."],
    ],
    ex: [
      "Why does encrypting the same message twice with the same password produce different output, and why is that desirable?",
      "Because each encryption uses a new random salt and IV, giving a different key and keystream. It prevents attackers from telling whether two ciphertexts contain the same message.",
    ],
  }),

  lesson("File Operations: Create, Copy, Move, Rename, Delete, Exists and Append", {
    intro:
      "Everyday file management (creating, copying, moving, renaming, deleting, checking existence and appending) is done with the `java.io.File` class or, better, the `java.nio.file.Files` utility class (Java 7). This lesson performs each operation with both APIs and explains their error-handling differences.",
    topics: [
      [
        "Create and check existence",
        "`file.createNewFile()` / `Files.createFile(path)`. `file.exists()` / `Files.exists(path)` and `Files.notExists(path)` (both can be false when existence cannot be determined, for example without permission). Checking existence before acting is racy; prefer to act and handle the exception.",
      ],
      [
        "Copy",
        "`Files.copy(source, target)` copies a file and throws `FileAlreadyExistsException` if the target exists unless you pass `StandardCopyOption.REPLACE_EXISTING`; `COPY_ATTRIBUTES` copies timestamps. The old File API had no copy method; you copied with streams.",
      ],
      [
        "Move and rename",
        "Renaming is moving within the same directory. `file.renameTo(dest)` returns false on failure without saying why and may not work across file systems. `Files.move(source, target, REPLACE_EXISTING, ATOMIC_MOVE)` throws descriptive exceptions and can move atomically.",
      ],
      [
        "Delete",
        "`file.delete()` returns false if it fails. `Files.delete(path)` throws `NoSuchFileException` or `DirectoryNotEmptyException`; `Files.deleteIfExists(path)` returns a boolean. Directories must be empty before deletion.",
      ],
      [
        "Append",
        "`new FileWriter(file, true)` or `Files.writeString(path, text, StandardOpenOption.CREATE, StandardOpenOption.APPEND)` (CREATE makes the file if it does not exist).",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;

import static java.nio.file.StandardCopyOption.*;
import static java.nio.file.StandardOpenOption.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("fileops");
        Path original = dir.resolve("notes.txt");

        Files.writeString(original, "line 1\n", CREATE, APPEND);         // create via append
        Files.writeString(original, "line 2\n", APPEND);                 // append
        System.out.println("exists: " + Files.exists(original) + ", notExists(other): " + Files.notExists(dir.resolve("nope.txt")));
        System.out.println("appended content: " + Files.readAllLines(original));

        Path copy = dir.resolve("notes-copy.txt");
        Files.copy(original, copy);
        try {
            Files.copy(original, copy);
        } catch (FileAlreadyExistsException e) {
            System.out.println("copy onto existing target -> FileAlreadyExistsException");
        }
        Files.copy(original, copy, REPLACE_EXISTING, COPY_ATTRIBUTES);
        System.out.println("copy with REPLACE_EXISTING ok, identical: " + (Files.mismatch(original, copy) == -1));

        Path renamed = dir.resolve("notes-renamed.txt");
        Files.move(copy, renamed);                                          // rename = move in same dir
        System.out.println("renamed: old exists " + Files.exists(copy) + ", new exists " + Files.exists(renamed));

        Path archive = Files.createDirectory(dir.resolve("archive"));
        Files.move(renamed, archive.resolve(renamed.getFileName()), REPLACE_EXISTING);
        System.out.println("moved into archive: " + Files.exists(archive.resolve("notes-renamed.txt")));

        File legacy = dir.resolve("legacy.txt").toFile();
        System.out.println("File.createNewFile: " + legacy.createNewFile()
                + ", renameTo: " + legacy.renameTo(dir.resolve("legacy2.txt").toFile())
                + ", delete missing returns: " + new File(dir.toFile(), "ghost.txt").delete());

        try {
            Files.delete(archive);
        } catch (DirectoryNotEmptyException e) {
            System.out.println("delete non-empty directory -> DirectoryNotEmptyException");
        }
        Files.delete(archive.resolve("notes-renamed.txt"));
        System.out.println("deleteIfExists on missing file: " + Files.deleteIfExists(dir.resolve("ghost.txt")));
        try {
            Files.delete(dir.resolve("ghost.txt"));
        } catch (NoSuchFileException e) {
            System.out.println("Files.delete on missing file -> NoSuchFileException");
        }
    }
}`,
    walk:
      "Writing with `CREATE, APPEND` creates the file the first time and appends afterwards. `Files.copy` refuses to overwrite until `REPLACE_EXISTING` is given, and `Files.mismatch` confirms the copy is identical. `Files.move` within the same directory renames the file, and moving it into another directory relocates it.\n\nThe legacy `File` methods report failure only with booleans: deleting a missing file simply returns false. The NIO methods throw descriptive exceptions instead: `DirectoryNotEmptyException` for a non-empty directory and `NoSuchFileException` for a missing file, while `deleteIfExists` returns false without throwing.",
    anim: [
      "File lifecycle with Files",
      [
        ["create", "createFile", "notes.txt"],
        ["append", "write APPEND", "more lines"],
        ["copy", "copy", "notes-copy.txt"],
        ["move", "move", "rename / relocate"],
        ["delete", "delete", "gone"],
      ],
      [
        ["create", "append", "write", "The file is created and lines are appended to it."],
        ["append", "copy", "copy", "Files.copy duplicates it, refusing to overwrite unless told to."],
        ["copy", "move", "rename", "Files.move renames it or moves it into another directory."],
        ["move", "delete", "remove", "Files.delete removes it and throws a clear exception if it cannot."],
      ],
    ],
    mistakes: [
      "Ignoring the boolean returned by `File.delete()` or `renameTo()`.",
      "Checking `exists()` and then acting (time-of-check to time-of-use race); act and handle exceptions.",
      "Copying without REPLACE_EXISTING and being surprised by FileAlreadyExistsException.",
    ],
    qa: [
      ["How do you copy a file in Java?", "`Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING)`."],
      ["How do you rename a file?", "`Files.move(source, source.resolveSibling(newName))` or `file.renameTo(newFile)`."],
      ["What is the difference between File.delete and Files.delete?", "File.delete returns false on failure; Files.delete throws an exception explaining why (NoSuchFileException, DirectoryNotEmptyException, AccessDeniedException)."],
    ],
    ex: [
      "Make a timestamped backup copy of `notes.txt`, like `notes-2026-11-19.txt`, in the same directory.",
      "`Files.copy(p, p.resolveSibling(\"notes-\" + LocalDate.now() + \".txt\"), StandardCopyOption.REPLACE_EXISTING);`.",
    ],
  }),

  lesson("File Attributes: Hidden, Dates, Size, Read-Only, Writable and Comparing Files", {
    intro:
      "Files carry metadata: size, timestamps, permissions and flags such as hidden or read-only. This lesson reads and changes those attributes: hiding and unhiding files, reading creation, last-modified and last-access dates, getting file size, making files read-only or writable, and comparing two files' contents.",
    topics: [
      [
        "Hidden files",
        "On Unix-like systems a file is hidden if its name starts with a dot. On Windows it is a DOS attribute: `Files.setAttribute(path, \"dos:hidden\", true)` hides it and false unhides it. `Files.isHidden(path)` and `file.isHidden()` check either way.",
      ],
      [
        "Creation, last-modified and last-accessed dates",
        "`Files.readAttributes(path, BasicFileAttributes.class)` returns `creationTime()`, `lastModifiedTime()` and `lastAccessTime()` (accuracy depends on the file system; some do not track creation or access time). `Files.setLastModifiedTime` changes the modification time, and `file.lastModified()` returns milliseconds.",
      ],
      [
        "Size",
        "`Files.size(path)` or `file.length()` in bytes (`length()` returns 0 for missing files rather than throwing). For directories, sum the sizes of all files with `Files.walk`.",
      ],
      [
        "Read-only and writable",
        "`file.setReadOnly()`, `file.setWritable(true)`, `file.canWrite()`, `Files.isWritable(path)`, `Files.isReadable(path)`; on POSIX systems `Files.setPosixFilePermissions` gives fine-grained control. A read-only file cannot be opened for writing (AccessDeniedException).",
      ],
      [
        "Comparing files",
        "`Files.mismatch(a, b)` (Java 12) returns -1 if the contents are identical, otherwise the position of the first differing byte. Before Java 12: compare sizes, then compare bytes with buffered streams. `Files.isSameFile` checks whether two paths point to the same file.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.nio.file.attribute.FileTime;
import java.time.Instant;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("attrs");
        Path report = dir.resolve("report.txt");
        Files.writeString(report, "quarterly numbers\n");

        boolean windows = System.getProperty("os.name").startsWith("Windows");
        Path hidden;
        if (windows) {
            hidden = report;
            Files.setAttribute(hidden, "dos:hidden", true);        // hide on Windows
        } else {
            hidden = Files.move(report, dir.resolve(".report.txt")); // dot prefix on Unix
        }
        System.out.println("hidden now: " + Files.isHidden(hidden));
        if (windows) Files.setAttribute(hidden, "dos:hidden", false);
        else hidden = Files.move(hidden, report);
        System.out.println("unhidden: " + !Files.isHidden(report));

        BasicFileAttributes attrs = Files.readAttributes(report, BasicFileAttributes.class);
        System.out.println("has creation time: " + (attrs.creationTime() != null)
                + ", last modified within a minute: " + (Instant.now().getEpochSecond() - attrs.lastModifiedTime().toInstant().getEpochSecond() < 60)
                + ", has last access time: " + (attrs.lastAccessTime() != null));
        Files.setLastModifiedTime(report, FileTime.from(Instant.parse("2025-01-01T00:00:00Z")));
        System.out.println("last modified changed to: " + Files.getLastModifiedTime(report));

        System.out.println("size: Files.size " + Files.size(report) + " bytes, File.length " + report.toFile().length()
                + ", missing file length " + new File(dir.toFile(), "missing").length());

        File f = report.toFile();
        System.out.println("setReadOnly: " + f.setReadOnly() + ", canWrite: " + f.canWrite());
        try {
            Files.writeString(report, "overwrite attempt");
        } catch (AccessDeniedException e) {
            System.out.println("writing a read-only file -> AccessDeniedException");
        }
        System.out.println("setWritable(true): " + f.setWritable(true) + ", isWritable: " + Files.isWritable(report));

        Path same = dir.resolve("same.txt"), different = dir.resolve("different.txt");
        Files.writeString(same, "quarterly numbers\n");
        Files.writeString(different, "quarterly NUMBERS\n");
        System.out.println("mismatch identical: " + Files.mismatch(report, same) + ", mismatch different at byte: " + Files.mismatch(report, different));
        System.out.println("isSameFile via another path: " + Files.isSameFile(report, dir.resolve("./report.txt")));
    }
}`,
    varies: true,
    walk:
      "Hiding depends on the platform: on Windows the program sets the `dos:hidden` attribute, on Linux and macOS it renames the file with a leading dot; `Files.isHidden` confirms both, and the change is then undone. `BasicFileAttributes` provides the creation, last-modified and last-access times, and `setLastModifiedTime` changes the modification date.\n\n`Files.size` and `File.length` agree, while `length()` silently returns 0 for a missing file. After `setReadOnly()` writing fails with `AccessDeniedException` until the file is made writable again. `Files.mismatch` returns -1 for identical contents and 10 for the file whose bytes first differ at position 10. `isSameFile` recognises two spellings of the same path.",
    anim: [
      "Reading file metadata",
      [
        ["path", "report.txt", "path"],
        ["basic", "BasicFileAttr..", "times, size"],
        ["dos", "dos:hidden", "Windows flag"],
        ["perm", "permissions", "read-only?"],
        ["cmp", "Files.mismatch", "compare"],
      ],
      [
        ["path", "basic", "read", "readAttributes returns size and creation, modified and access times in one call."],
        ["path", "dos", "flag", "On Windows, hidden is a DOS attribute; on Unix it is a leading dot in the name."],
        ["path", "perm", "check", "canWrite and isWritable reveal whether the file can be modified."],
        ["path", "cmp", "compare", "mismatch reports -1 for identical files or the first differing byte."],
      ],
    ],
    mistakes: [
      "Assuming creation and access times are always accurate; many file systems do not track them reliably.",
      "Using `file.length()` without checking the file exists.",
      "Writing platform-specific hide logic without checking the operating system.",
    ],
    qa: [
      ["How do you get a file's last modified date?", "`Files.getLastModifiedTime(path)` or `file.lastModified()` (milliseconds since the epoch)."],
      ["How do you make a file read-only?", "`file.setReadOnly()` or `file.setWritable(false)`; on POSIX, `Files.setPosixFilePermissions`."],
      ["How do you compare two files' contents?", "`Files.mismatch(a, b) == -1` (Java 12+), or compare sizes and then bytes."],
    ],
    ex: [
      "List all files in a directory modified within the last 24 hours.",
      "`try (Stream<Path> s = Files.list(dir)) { s.filter(Files::isRegularFile).filter(p -> Files.getLastModifiedTime(p).toInstant().isAfter(Instant.now().minus(Duration.ofDays(1)))) ... }` (wrap the IOException from getLastModifiedTime).",
    ],
  }),

  lesson("Directory Operations: Create, Identify, Delete, Copy and Traverse", {
    intro:
      "Directories need their own operations: creating single and nested folders, telling files from directories, deleting a directory tree, copying a whole tree, and traversing everything inside. This lesson performs each with `File` and with NIO's `Files.walk`, `Files.walkFileTree` and `DirectoryStream`.",
    topics: [
      [
        "Creating directories",
        "`file.mkdir()` creates one directory (parent must exist); `file.mkdirs()` creates all missing parents. NIO: `Files.createDirectory(path)` throws if it exists or the parent is missing; `Files.createDirectories(path)` creates the whole chain and does nothing if it already exists.",
      ],
      [
        "Identifying files and directories",
        "`file.isDirectory()` / `isFile()`, `Files.isDirectory(path)` / `Files.isRegularFile(path)` / `Files.isSymbolicLink(path)`. Listing: `file.listFiles()` (null if not a directory or on I/O error), `Files.list(dir)` (one level, a Stream to close) or `Files.newDirectoryStream(dir, \"*.txt\")` with glob filtering.",
      ],
      [
        "Traversing a directory tree",
        "`Files.walk(root)` returns a Stream of every path, depth-first, and accepts a max depth. `Files.walkFileTree(root, visitor)` calls `preVisitDirectory`, `visitFile`, `visitFileFailed` and `postVisitDirectory`, and can skip subtrees. `Files.find` adds a filter on attributes.",
      ],
      [
        "Deleting a directory tree",
        "A directory must be empty to delete, so delete children first: walk the tree, sort paths in reverse order (deepest first) and delete each, or use `walkFileTree` deleting files in `visitFile` and directories in `postVisitDirectory`.",
      ],
      [
        "Copying a directory tree",
        "Walk the source; for each path compute `target.resolve(source.relativize(path))`; create directories with `createDirectories` and copy files with `Files.copy`. There is no single built-in call.",
      ],
    ],
    code: String.raw`import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

public class Main {
    static List<String> tree(Path root) throws IOException {
        try (Stream<Path> s = Files.walk(root)) {
            return s.map(p -> root.relativize(p).toString().replace('\\', '/') + (Files.isDirectory(p) ? "/" : ""))
                    .filter(name -> !name.equals("/")).sorted().toList();
        }
    }

    public static void main(String[] args) throws IOException {
        Path base = Files.createTempDirectory("dirs");

        File single = new File(base.toFile(), "single");
        System.out.println("mkdir single: " + single.mkdir() + ", mkdir nested without parents: " + new File(base.toFile(), "a/b/c").mkdir());
        System.out.println("mkdirs nested: " + new File(base.toFile(), "a/b/c").mkdirs());
        Path project = Files.createDirectories(base.resolve("project/src/main/java"));
        Files.createDirectories(project);                                  // already exists: no error
        Files.writeString(project.resolve("App.java"), "class App {}");
        Files.writeString(base.resolve("project/README.md"), "# readme");
        Files.writeString(base.resolve("project/src/notes.txt"), "todo");

        Path readme = base.resolve("project/README.md");
        System.out.println("isDirectory(project): " + Files.isDirectory(base.resolve("project")) + ", isRegularFile(README): " + Files.isRegularFile(readme)
                + ", File.listFiles on a file: " + readme.toFile().listFiles());

        System.out.println("tree: " + tree(base.resolve("project")));
        try (DirectoryStream<Path> md = Files.newDirectoryStream(base.resolve("project"), "*.md")) {
            for (Path p : md) System.out.println("glob *.md one level: " + p.getFileName());
        }

        Path backup = base.resolve("backup");
        Path source = base.resolve("project");
        try (Stream<Path> s = Files.walk(source)) {
            for (Path p : (Iterable<Path>) s::iterator) {
                Path target = backup.resolve(source.relativize(p));
                if (Files.isDirectory(p)) Files.createDirectories(target);
                else Files.copy(p, target, StandardCopyOption.REPLACE_EXISTING);
            }
        }
        System.out.println("copied tree equal: " + tree(backup).equals(tree(source)));

        int[] counts = {0, 0};
        Files.walkFileTree(backup, new SimpleFileVisitor<>() {
            @Override public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Files.delete(file); counts[0]++; return FileVisitResult.CONTINUE;
            }
            @Override public FileVisitResult postVisitDirectory(Path dir, IOException e) throws IOException {
                Files.delete(dir); counts[1]++; return FileVisitResult.CONTINUE;      // empty now
            }
        });
        System.out.println("walkFileTree deleted " + counts[0] + " files and " + counts[1] + " directories; backup exists: " + Files.exists(backup));

        try (Stream<Path> s = Files.walk(base)) {
            s.sorted(Comparator.reverseOrder()).forEach(p -> p.toFile().delete());   // deepest first
        }
        System.out.println("reverse-order delete removed everything: " + !Files.exists(base));
    }
}`,
    walk:
      "`mkdir` creates a single directory but fails for `a/b/c` because the parents are missing, while `mkdirs` creates the whole chain; `Files.createDirectories` does the same and is harmless when the directory already exists. `isDirectory` and `isRegularFile` identify entries, and `listFiles` returns null when called on a file.\n\n`Files.walk` lists the whole tree, and a `DirectoryStream` with the glob `*.md` lists matching entries of one level. Copying the tree resolves each path relative to the source into the target. `walkFileTree` deletes the backup bottom-up (files first, then each directory once it is empty), and the final cleanup sorts all paths in reverse so the deepest are deleted first.",
    anim: [
      "Deleting a tree bottom-up",
      [
        ["root", "project/", "root"],
        ["src", "src/", "directory"],
        ["file", "App.java", "file"],
        ["post", "postVisitDir", "dir now empty"],
        ["gone", "deleted", "root last"],
      ],
      [
        ["root", "src", "pre-visit", "walkFileTree descends from the root into each subdirectory."],
        ["src", "file", "visitFile", "Files are deleted as they are visited."],
        ["file", "post", "after", "Once a directory's contents are gone, postVisitDirectory deletes it."],
        ["post", "gone", "unwind", "Directories are removed on the way back up, the root last."],
      ],
    ],
    mistakes: [
      "Trying to delete a non-empty directory directly.",
      "Not closing streams from `Files.walk` and `Files.list` (they hold open directory handles).",
      "Ignoring a null result from `File.listFiles()`.",
    ],
    qa: [
      ["What is the difference between mkdir and mkdirs?", "mkdir creates one directory and needs the parent to exist; mkdirs also creates any missing parent directories."],
      ["How do you delete a non-empty directory?", "Walk the tree and delete children before parents, e.g. Files.walk sorted in reverse order, or walkFileTree deleting directories in postVisitDirectory."],
      ["How do you traverse a directory tree?", "Files.walk (a Stream), Files.walkFileTree (a visitor) or recursion over File.listFiles."],
    ],
    ex: [
      "Find every `.java` file under a project and print the total number of lines.",
      "`try (Stream<Path> s = Files.walk(root)) { long total = s.filter(p -> p.toString().endsWith(\".java\")).mapToLong(p -> { try (Stream<String> l = Files.lines(p)) { return l.count(); } catch (IOException e) { return 0; } }).sum(); }`.",
    ],
  }),

  lesson("Find and Replace, Sorting File Contents, Counting Lines and Inserting Content", {
    intro:
      "A set of practical text-file tasks shows up constantly: find and replace a word, sort a file's contents by line or by word, count lines, and insert content at a specific position. Files cannot be edited in the middle in place, so most of these read, transform and write back. This lesson implements each task.",
    topics: [
      [
        "Find and replace a word",
        "For files that fit in memory: `Files.writeString(path, Files.readString(path).replace(\"old\", \"new\"))`. Use `replaceAll` with `\\b` word boundaries to avoid replacing parts of other words. The same can be done on a byte array for binary-safe replacements of ASCII sequences. For very large files, stream line by line into a temporary file and then move it over the original.",
      ],
      [
        "Sorting file contents by line or by word",
        "By line: `Files.readAllLines`, sort the list, write it back. By word: split on whitespace (`\\\\s+`), sort, and join. Use a comparator such as `String.CASE_INSENSITIVE_ORDER` for natural-looking results, and `distinct()` to remove duplicates.",
      ],
      [
        "Counting lines",
        "`Files.lines(path).count()` (stream, closed with try-with-resources) or a `BufferedReader.readLine()` loop. Counting with `LineNumberReader` also works. Note whether the last line ends with a newline.",
      ],
      [
        "Inserting content at a position",
        "Files support appending and overwriting, not inserting. To insert, read everything after the position, write the new content, then write the saved remainder (or rebuild the file as before + insert + after). `RandomAccessFile` can do it with seek, read and write.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Main {
    static void insertAt(Path file, int position, String content) throws IOException {
        String text = Files.readString(file);
        Files.writeString(file, text.substring(0, position) + content + text.substring(position));
    }

    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("text-tasks", ".txt");
        Files.writeString(file, "banana apple\ncherry Apple\napple pie\nzebra\napplesauce\n");

        String replaced = Files.readString(file).replaceAll("(?i)\\bapple\\b", "MANGO");     // whole words only
        Files.writeString(file, replaced);
        System.out.println("find & replace whole word 'apple': " + Files.readAllLines(file));

        byte[] bytes = Files.readAllBytes(file);
        String asText = new String(bytes, StandardCharsets.US_ASCII).replace("zebra", "ZEBRA");
        Files.write(file, asText.getBytes(StandardCharsets.US_ASCII));
        System.out.println("replace via byte array: " + Files.readAllLines(file).get(3));

        List<String> lines = new ArrayList<>(Files.readAllLines(file));
        lines.sort(String.CASE_INSENSITIVE_ORDER);
        System.out.println("sorted by line: " + lines);

        List<String> words = Arrays.stream(Files.readString(file).split("\\s+"))
                .filter(w -> !w.isBlank()).map(String::toLowerCase).distinct().sorted().toList();
        System.out.println("sorted unique words: " + words);

        try (Stream<String> s = Files.lines(file)) {
            System.out.println("line count with Files.lines: " + s.count());
        }
        try (LineNumberReader reader = new LineNumberReader(Files.newBufferedReader(file))) {
            while (reader.readLine() != null) { }
            System.out.println("line count with LineNumberReader: " + reader.getLineNumber());
        }

        Files.writeString(file, "Hello World");
        insertAt(file, 6, "Beautiful ");
        System.out.println("inserted at position 6: " + Files.readString(file));

        Map<String, Long> frequency = Arrays.stream("to be or not to be".split(" "))
                .collect(Collectors.groupingBy(w -> w, TreeMap::new, Collectors.counting()));
        System.out.println("word frequency: " + frequency);
        Files.delete(file);
    }
}`,
    walk:
      "The regex `(?i)\\bapple\\b` replaces \"apple\" and \"Apple\" as whole words but leaves \"applesauce\" untouched. The second replacement works on the file's raw bytes, which is safe for ASCII text. Sorting by line uses a case-insensitive comparator; sorting by word splits on whitespace, lower-cases, removes duplicates and sorts.\n\nBoth line-counting methods report 5 lines. `insertAt` shows the only way to insert into a file: rebuild it from the text before the position, the new content and the rest. The final bonus counts word frequencies into a sorted map.",
    anim: [
      "Inserting into a file",
      [
        ["file", "Hello World", "original"],
        ["before", "\"Hello \"", "0..6"],
        ["insert", "\"Beautiful \"", "new text"],
        ["after", "\"World\"", "6..end"],
        ["result", "Hello Beautiful", "World: rewritten"],
      ],
      [
        ["file", "before", "split", "Files cannot grow in the middle, so the content is split at the position."],
        ["file", "after", "keep", "The part after the position is saved."],
        ["before", "insert", "join", "The new text is placed after the first part..."],
        ["after", "result", "write", "...followed by the saved remainder, and the whole file is rewritten."],
      ],
    ],
    mistakes: [
      "Using `replace` when only whole words should change (\"apple\" inside \"applesauce\").",
      "Loading multi-gigabyte files into memory for simple transformations.",
      "Writing the result to the same file you are still reading line by line.",
    ],
    qa: [
      ["How do you replace a word in a file?", "Read the file into a String, use replace or replaceAll (with \\b for whole words), and write it back; for large files stream lines into a temp file and move it over the original."],
      ["How do you count lines in a file?", "`Files.lines(path).count()` in try-with-resources, a BufferedReader loop, or LineNumberReader."],
      ["Can you insert text in the middle of a file?", "Not directly; you must rewrite everything after the insertion point (in memory or via a temp file or RandomAccessFile)."],
    ],
    ex: [
      "Sort the lines of a file numerically when each line is a number (\"10\", \"9\", \"100\").",
      "Read the lines, sort with `Comparator.comparingInt(Integer::parseInt)` and write them back; alphabetic sorting would give 10, 100, 9.",
    ],
  }),

  lesson("Properties Files: Create, Read and Convert to XML", {
    intro:
      "`.properties` files store configuration as `key=value` lines, and `java.util.Properties` reads and writes them. This lesson creates a properties file, reads it with defaults, handles comments and special characters, loads from the classpath, and converts properties to and from XML.",
    topics: [
      [
        "Creating a properties file",
        "Fill a `Properties` object with `setProperty(key, value)` and call `store(writer, comment)`. It writes a comment line, a timestamp line and the entries, escaping special characters (`=`, `:`, spaces in keys, backslashes, non-Latin-1 characters when using a stream).",
      ],
      [
        "Reading a properties file",
        "`props.load(reader)` parses lines: `key=value`, `key:value` or `key value`, comments starting with `#` or `!`, and backslash line continuations. `getProperty(key)` returns null if missing; `getProperty(key, default)` supplies a default. Use a Reader with UTF-8 to support any characters.",
      ],
      [
        "Loading from the classpath",
        "Configuration packaged inside a JAR is loaded with `getClass().getResourceAsStream(\"/app.properties\")` or the class loader's `getResourceAsStream`, not with a file path.",
      ],
      [
        "Converting to XML and back",
        "`props.storeToXML(outputStream, comment)` writes an XML document with `<entry key=\"...\">value</entry>` elements, using the properties DTD; `loadFromXML(inputStream)` reads it back. XML is useful when values contain characters that are awkward in the text format or when other tools expect XML.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.Properties;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("props");
        Path file = dir.resolve("app.properties");

        Properties config = new Properties();
        config.setProperty("db.url", "jdbc:postgresql://localhost:5432/shop");
        config.setProperty("db.pool.size", "10");
        config.setProperty("greeting", "Namaste \u20B9 users");
        config.setProperty("path with spaces", "C:\\data\\files");
        try (Writer w = Files.newBufferedWriter(file, StandardCharsets.UTF_8)) {
            config.store(w, "Shop configuration");
        }
        System.out.println("stored file lines (first is the comment): " + Files.readAllLines(file).get(0));
        System.out.println("escaped key line present: " + Files.readString(file).contains("path\\ with\\ spaces"));

        Files.writeString(file, "\n# extra comment\n! another comment\ntimeout : 30\nretries 3\nlong.value=first \\\n    second\n",
                StandardOpenOption.APPEND);

        Properties loaded = new Properties();
        try (Reader r = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            loaded.load(r);
        }
        System.out.println("db.url = " + loaded.getProperty("db.url"));
        int pool = Integer.parseInt(loaded.getProperty("db.pool.size"));
        System.out.println("pool size as int = " + pool + ", greeting = " + loaded.getProperty("greeting"));
        System.out.println("colon and space separators: timeout=" + loaded.getProperty("timeout") + ", retries=" + loaded.getProperty("retries"));
        System.out.println("line continuation: " + loaded.getProperty("long.value"));
        System.out.println("missing key: " + loaded.getProperty("cache.ttl") + ", with default: " + loaded.getProperty("cache.ttl", "60"));
        System.out.println("keys: " + new TreeSet<>(loaded.stringPropertyNames()));

        Path xml = dir.resolve("app.xml");
        try (OutputStream out = Files.newOutputStream(xml)) {
            loaded.storeToXML(out, "converted from .properties", StandardCharsets.UTF_8);
        }
        String xmlText = Files.readString(xml);
        System.out.println("XML has entry elements: " + xmlText.contains("<entry key=\"db.url\">"));
        Properties fromXml = new Properties();
        try (InputStream in = Files.newInputStream(xml)) {
            fromXml.loadFromXML(in);
        }
        System.out.println("round trip through XML equal: " + fromXml.equals(loaded));
    }
}`,
    walk:
      "The program fills a `Properties` object and stores it with a comment; `store` writes the comment line first and escapes the spaces in the key \"path with spaces\". It then appends lines in the other supported syntaxes: comments with `#` and `!`, `key : value`, `key value`, and a backslash line continuation.\n\nLoading parses all of them: values come back as strings (parse numbers yourself), `getProperty` returns null for a missing key or a supplied default, and the continuation joins \"first second\". `storeToXML` writes `<entry key=...>` elements, and `loadFromXML` reads them back into an equal `Properties` object.",
    anim: [
      "Properties round trip",
      [
        ["obj", "Properties", "key -> value"],
        ["store", "store()", "text format"],
        ["file", "app.properties", "key=value"],
        ["load", "load()", "parse lines"],
        ["xml", "storeToXML()", "<entry> XML"],
      ],
      [
        ["obj", "store", "write", "store() writes a comment, a timestamp and escaped key=value lines."],
        ["store", "file", "save", "The result is a plain text .properties file."],
        ["file", "load", "read", "load() parses =, :, spaces, comments and line continuations."],
        ["obj", "xml", "convert", "storeToXML writes the same entries as XML, and loadFromXML reads them back."],
      ],
    ],
    mistakes: [
      "Loading properties with an InputStream when the file contains non-Latin-1 characters (use a UTF-8 Reader).",
      "Forgetting that every value is a String and must be parsed.",
      "Reading packaged configuration with a file path instead of getResourceAsStream.",
    ],
    qa: [
      ["How do you read a properties file?", "Create Properties and call load(reader) (or load(inputStream)), then getProperty(key) or getProperty(key, default)."],
      ["How do you write a properties file?", "setProperty for each entry, then store(writer, comment)."],
      ["How do you convert properties to XML?", "props.storeToXML(outputStream, comment); read it back with loadFromXML."],
    ],
    ex: [
      "Load `app.properties` from inside a JAR's resources folder. What code do you use?",
      "`try (InputStream in = Main.class.getResourceAsStream(\"/app.properties\")) { props.load(new InputStreamReader(in, StandardCharsets.UTF_8)); }`, checking that `in` is not null.",
    ],
  }),

  lesson("RandomAccessFile and skip()", {
    intro:
      "Streams read files from start to end. `RandomAccessFile` can jump to any position (seek) and read or write there, like an array of bytes on disk; it is the basis of fixed-size record files, indexes and simple databases. Streams also offer `skip()` to jump forward. This lesson covers both.",
    topics: [
      [
        "Opening a RandomAccessFile",
        "`new RandomAccessFile(file, \"r\")` for reading or `\"rw\"` for reading and writing (creates the file). Modes `\"rws\"` and `\"rwd\"` also force writes to disk immediately.",
      ],
      [
        "The file pointer",
        "`seek(position)` moves the pointer, `getFilePointer()` reports it, and every read or write advances it. `length()` returns the size and `setLength(n)` truncates or extends the file. Writing past the end extends the file.",
      ],
      [
        "Reading and writing primitives",
        "Like DataInput/DataOutput: `readInt`, `writeInt`, `readDouble`, `writeLong`, `readFully`, `writeUTF`. With fixed-size records, record n starts at `n * RECORD_SIZE`, so you can read or update any record directly.",
      ],
      [
        "skip() on streams and readers",
        "`inputStream.skip(n)` and `reader.skip(n)` move forward up to n bytes or characters and return how many were actually skipped (possibly fewer). `skipNBytes(n)` (Java 12) skips exactly n or throws EOFException. Unlike seek, skipping only moves forward.",
      ],
      [
        "Modern alternative",
        "`FileChannel` with `position()` and `ByteBuffer`, or memory-mapped files (`channel.map`), offer the same random access with better performance for large data.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    static final int NAME_BYTES = 20;
    static final int RECORD_SIZE = 4 + NAME_BYTES + 8;            // id + fixed-width name + balance

    static void writeRecord(RandomAccessFile raf, int index, int id, String name, double balance) throws IOException {
        raf.seek((long) index * RECORD_SIZE);
        raf.writeInt(id);
        byte[] fixed = new byte[NAME_BYTES];
        byte[] raw = name.getBytes(StandardCharsets.US_ASCII);
        System.arraycopy(raw, 0, fixed, 0, Math.min(raw.length, NAME_BYTES));
        raf.write(fixed);
        raf.writeDouble(balance);
    }

    static String readRecord(RandomAccessFile raf, int index) throws IOException {
        raf.seek((long) index * RECORD_SIZE);
        int id = raf.readInt();
        byte[] fixed = new byte[NAME_BYTES];
        raf.readFully(fixed);
        double balance = raf.readDouble();
        return id + ":" + new String(fixed, StandardCharsets.US_ASCII).trim() + ":" + balance;
    }

    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("accounts", ".dat");
        try (RandomAccessFile raf = new RandomAccessFile(file.toFile(), "rw")) {
            writeRecord(raf, 0, 101, "Asha", 500.0);
            writeRecord(raf, 1, 102, "Ravi", 750.5);
            writeRecord(raf, 2, 103, "Meera", 1200.0);
            System.out.println("file length " + raf.length() + " bytes = 3 records x " + RECORD_SIZE);

            System.out.println("read record 2 directly: " + readRecord(raf, 2));
            raf.seek(1L * RECORD_SIZE + 4 + NAME_BYTES);                   // jump to Ravi's balance
            raf.writeDouble(999.99);                                     // update in place
            System.out.println("after in-place update, record 1: " + readRecord(raf, 1));
            System.out.println("file pointer now at " + raf.getFilePointer());

            writeRecord(raf, 5, 106, "Neel", 10.0);                      // beyond the end: file grows
            System.out.println("writing record 5 extended the file to " + raf.length() + " bytes; record 3 is zeros: " + readRecord(raf, 3));
            raf.setLength(3L * RECORD_SIZE);
            System.out.println("setLength truncated back to " + raf.length());
        }

        Files.writeString(file, "HEADER:payload-starts-here");
        try (InputStream in = Files.newInputStream(file)) {
            long skipped = in.skip(7);                                   // skip "HEADER:"
            System.out.println("skip(7) skipped " + skipped + ", next text: " + new String(in.readAllBytes()));
        }
        try (Reader reader = Files.newBufferedReader(file)) {
            reader.skip(15);
            char[] buf = new char[6];
            reader.read(buf);
            System.out.println("Reader.skip(15) then read: " + new String(buf));
        }
        try (InputStream in = Files.newInputStream(file)) {
            in.skipNBytes(1000);
        } catch (EOFException e) {
            System.out.println("skipNBytes beyond the end -> EOFException");
        }
    }
}`,
    walk:
      "Each account is a fixed-size 32-byte record (an int id, a 20-byte name and a double balance), so record n starts at `n * 32`. The program writes three records, reads record 2 directly with `seek`, and updates only Ravi's balance in place by seeking to that field's offset.\n\nWriting record 5 extends the file and leaves record 3 as zeros; `setLength` truncates it again. With streams, `skip(7)` jumps over a header and returns how many bytes it skipped, `Reader.skip` does the same with characters, and `skipNBytes` throws `EOFException` when asked to skip past the end.",
    anim: [
      "Seeking to a record",
      [
        ["r0", "record 0", "bytes 0-31"],
        ["r1", "record 1", "bytes 32-63"],
        ["r2", "record 2", "bytes 64-95"],
        ["ptr", "file pointer", "seek(64)"],
        ["read", "readInt...", "Meera"],
      ],
      [
        ["ptr", "r0", "start", "The file pointer starts at byte 0."],
        ["ptr", "r2", "seek", "seek(2 * 32) jumps straight to record 2 without reading records 0 and 1."],
        ["r2", "read", "read", "readInt, readFully and readDouble then read that record's fields."],
        ["ptr", "r1", "update", "Seeking to a field inside record 1 lets you overwrite just that value."],
      ],
    ],
    mistakes: [
      "Using variable-length records with seek arithmetic.",
      "Assuming `skip(n)` always skips n bytes; check the return value or use skipNBytes.",
      "Opening with \"r\" and then trying to write (IOException).",
    ],
    qa: [
      ["What is RandomAccessFile?", "A class that reads and writes a file at arbitrary positions using a movable file pointer (seek)."],
      ["What are the modes of RandomAccessFile?", "\"r\" read-only, \"rw\" read-write, \"rws\" and \"rwd\" read-write with synchronous writes of content and metadata, or content only."],
      ["What is the difference between skip and seek?", "skip moves forward in a stream by up to n bytes; seek on RandomAccessFile moves to any absolute position, forwards or backwards."],
    ],
    ex: [
      "How would you find the number of records in the accounts file and print the last one?",
      "`long count = raf.length() / RECORD_SIZE;` then `readRecord(raf, (int) count - 1)`.",
    ],
  }),

  lesson("getPath vs getAbsolutePath vs getCanonicalPath and getResourceAsStream", {
    intro:
      "`java.io.File` has three ways to describe its path, which differ for relative paths, `.` and `..` segments and symbolic links. And loading a file with `FileInputStream` is very different from loading a classpath resource with `getResourceAsStream`. This lesson explains both comparisons.",
    topics: [
      [
        "getPath()",
        "Returns the path exactly as it was given to the constructor, relative or absolute, with `.` and `..` untouched: `new File(\"../data/./a.txt\").getPath()` is `..\\data\\.\\a.txt` on Windows (separators normalised).",
      ],
      [
        "getAbsolutePath()",
        "Makes the path absolute by prefixing the working directory if needed, but does not resolve `.` or `..`: `C:\\work\\app\\..\\data\\.\\a.txt`. It never touches the file system and never throws.",
      ],
      [
        "getCanonicalPath()",
        "Returns the unique, normalised absolute path: resolves `.` and `..`, follows symbolic links, and on case-insensitive file systems may normalise case: `C:\\work\\data\\a.txt`. It may access the file system and throws `IOException`. Use it to compare whether two paths refer to the same file and for security checks against path traversal. The NIO equivalents are `toAbsolutePath()`, `normalize()` and `toRealPath()`.",
      ],
      [
        "FileInputStream vs getResourceAsStream",
        "`new FileInputStream(path)` reads a file from the file system, resolving relative paths against the working directory; it fails once the application is packaged because files inside a JAR are not files on disk. `Class.getResourceAsStream(name)` loads a resource through the class loader from the classpath (folders or JARs): a name starting with `/` is absolute from the classpath root; otherwise it is relative to the class's package. It returns null if not found rather than throwing.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path base = Files.createTempDirectory("paths");
        Path data = Files.createDirectories(base.resolve("data"));
        Files.writeString(data.resolve("a.txt"), "content");
        Files.createDirectories(base.resolve("app"));

        File tricky = new File(base.resolve("app").toFile(), ".." + File.separator + "data" + File.separator + "." + File.separator + "a.txt");
        String sep = File.separator;
        System.out.println("getPath keeps . and ..:          " + (tricky.getPath().contains(".." + sep) && tricky.getPath().contains(sep + "." + sep)));
        System.out.println("getAbsolutePath still has ..:    " + tricky.getAbsolutePath().contains(".."));
        String canonical = tricky.getCanonicalPath();
        System.out.println("getCanonicalPath resolved:       " + (!canonical.contains("..") && canonical.endsWith("data" + sep + "a.txt")));
        System.out.println("canonical equals the real file:  " + canonical.equals(data.resolve("a.txt").toFile().getCanonicalPath()));

        File relative = new File("report.txt");
        System.out.println("relative getPath: " + relative.getPath() + ", absolute starts with user.dir: "
                + relative.getAbsolutePath().startsWith(System.getProperty("user.dir")));

        Path nio = tricky.toPath();
        System.out.println("NIO normalize() removes . and ..: " + !nio.normalize().toString().contains("..")
                + ", toRealPath() exists: " + Files.exists(nio.toRealPath()));

        Path userInput = Path.of("..", "..", "etc", "passwd");
        Path resolved = data.resolve(userInput).normalize();
        System.out.println("path traversal detected: " + !resolved.startsWith(data));

        Files.writeString(Path.of("config.txt"), "loaded from the classpath");
        try (InputStream in = Main.class.getResourceAsStream("/config.txt")) {
            System.out.println("getResourceAsStream(\"/config.txt\"): " + new String(in.readAllBytes(), StandardCharsets.UTF_8));
        }
        System.out.println("missing resource returns null: " + (Main.class.getResourceAsStream("/missing.txt") == null));
        try {
            new FileInputStream("missing.txt");
        } catch (FileNotFoundException e) {
            System.out.println("FileInputStream on a missing file -> FileNotFoundException");
        }
        Files.delete(Path.of("config.txt"));
    }
}`,
    walk:
      "For a path containing `..` and `.`, `getPath()` returns it unchanged, `getAbsolutePath()` only prefixes the parent directory and keeps the dots, and `getCanonicalPath()` resolves everything to the real location of `data/a.txt`, equal to the canonical path of the file itself. A bare relative name becomes absolute by prefixing the working directory.\n\nNIO's `normalize()` and `toRealPath()` do the same jobs. Normalising user input and checking `startsWith(base)` detects path-traversal attempts. Finally a file written into the working directory (which is on the classpath here) is loaded with `getResourceAsStream(\"/config.txt\")`; a missing resource returns null, whereas `FileInputStream` throws `FileNotFoundException`.",
    anim: [
      "Three views of one path",
      [
        ["raw", "app/../data/./a", "as given"],
        ["getpath", "getPath()", "unchanged"],
        ["abs", "getAbsolutePath", "cwd + raw"],
        ["canon", "getCanonical..", "resolved"],
        ["real", "/tmp/data/a.txt", "real file"],
      ],
      [
        ["raw", "getpath", "keep", "getPath returns the path string as you constructed it."],
        ["raw", "abs", "prefix", "getAbsolutePath prefixes the working or parent directory but keeps . and .."],
        ["abs", "canon", "resolve", "getCanonicalPath removes . and .., follows links and normalises."],
        ["canon", "real", "unique", "The canonical path is the one unique name of the real file."],
      ],
    ],
    mistakes: [
      "Comparing files with getAbsolutePath (two different strings can point to the same file).",
      "Loading packaged resources with FileInputStream, which works in the IDE and fails in the JAR.",
      "Forgetting the leading `/` in getResourceAsStream and looking in the class's package instead of the root.",
    ],
    qa: [
      ["What is the difference between getPath, getAbsolutePath and getCanonicalPath?", "getPath returns the path as given; getAbsolutePath makes it absolute without resolving . or ..; getCanonicalPath returns the unique normalised path, resolving . , .. and symbolic links."],
      ["What is the difference between FileInputStream and getResourceAsStream?", "FileInputStream reads from the file system; getResourceAsStream loads from the classpath (folders or JARs) through the class loader and returns null if not found."],
      ["Why does getCanonicalPath throw IOException?", "Because it may need to query the file system to resolve links and normalise the path."],
    ],
    ex: [
      "A web app serves files from `/var/app/files` using a name from the request. How do you block requests like `../../etc/passwd`?",
      "Resolve and normalise: `Path p = base.resolve(name).normalize();` and reject the request unless `p.startsWith(base)` (or compare canonical paths).",
    ],
  }),

  lesson("DataOutputStream and DataInputStream: Writing and Reading Primitives", {
    intro:
      "`DataOutputStream` and `DataInputStream` write and read Java primitive values in a portable binary format: an int is always 4 bytes in big-endian order, whatever the platform. This lesson writes and reads every primitive type (byte, short, char, int, long, float, double, boolean) plus strings with writeUTF, and explains the rules that keep writer and reader in sync.",
    topics: [
      [
        "Writing primitives",
        "`writeByte`, `writeShort`, `writeChar`, `writeInt`, `writeLong`, `writeFloat`, `writeDouble`, `writeBoolean`, `writeUTF` (a 2-byte length followed by modified UTF-8). Sizes: 1, 2, 2, 4, 8, 4, 8 and 1 bytes. `size()` reports how many bytes have been written.",
      ],
      [
        "Reading primitives",
        "The matching `readByte`, `readShort`, `readChar`, `readInt`, `readLong`, `readFloat`, `readDouble`, `readBoolean`, `readUTF`, plus `readUnsignedByte` and `readUnsignedShort` and `readFully(byte[])`. Reading past the end throws `EOFException`.",
      ],
      [
        "Order and types must match",
        "The format has no field names or type markers. Values must be read in exactly the same order and with the same types they were written; reading an int where a double was written silently gives garbage.",
      ],
      [
        "Big-endian and interoperability",
        "Multi-byte values are written most-significant byte first (network byte order), so files written on any platform read back the same anywhere. Other languages can read them if they use big-endian too; `ByteBuffer` lets you choose the byte order explicitly.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;

public class Main {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("primitives", ".bin");

        try (DataOutputStream out = new DataOutputStream(new BufferedOutputStream(Files.newOutputStream(file)))) {
            out.writeByte(-7);
            out.writeShort(32_000);
            out.writeChar('J');
            out.writeInt(2_000_000_000);
            out.writeLong(9_000_000_000_000L);
            out.writeFloat(3.14f);
            out.writeDouble(2.718281828459045);
            out.writeBoolean(true);
            out.writeUTF("namaste");
            System.out.println("bytes written: " + out.size() + " (1+2+2+4+8+4+8+1 + 2+7 for the string)");
        }

        try (DataInputStream in = new DataInputStream(new BufferedInputStream(Files.newInputStream(file)))) {
            System.out.println("byte " + in.readByte() + ", short " + in.readShort() + ", char " + in.readChar()
                    + ", int " + in.readInt() + ", long " + in.readLong());
            System.out.println("float " + in.readFloat() + ", double " + in.readDouble() + ", boolean " + in.readBoolean()
                    + ", utf " + in.readUTF());
            try {
                in.readInt();
            } catch (EOFException e) {
                System.out.println("reading past the end -> EOFException");
            }
        }

        byte[] raw = Files.readAllBytes(file);
        System.out.printf("int 2,000,000,000 stored big-endian as bytes: %02X %02X %02X %02X%n", raw[5], raw[6], raw[7], raw[8]);

        try (DataInputStream wrongOrder = new DataInputStream(Files.newInputStream(file))) {
            wrongOrder.readByte();
            int misread = wrongOrder.readInt();                     // a short and a char were written here
            System.out.println("reading types in the wrong order gives garbage: " + misread);
        }
        Files.delete(file);
    }
}`,
    walk:
      "One value of each primitive type plus a UTF string is written; `size()` reports 39 bytes, matching the fixed sizes plus the string's 2-byte length and 7 characters. Reading them back in the same order and with the same types restores every value exactly, and one more `readInt` throws `EOFException`.\n\nThe hex dump shows the int 2,000,000,000 (0x77359400) stored big-endian, most significant byte first. Reading with the wrong type sequence does not fail; it silently returns a meaningless number, which is why writer and reader must agree on the exact format.",
    anim: [
      "A binary record layout",
      [
        ["b", "byte", "1 byte"],
        ["s", "short + char", "2 + 2 bytes"],
        ["i", "int", "4 bytes, BE"],
        ["l", "long/float/dbl", "8 + 4 + 8"],
        ["u", "UTF string", "2 + n bytes"],
      ],
      [
        ["b", "s", "next", "Values are written back to back with no separators or type tags."],
        ["s", "i", "next", "Each primitive always takes the same number of bytes."],
        ["i", "l", "next", "Multi-byte values are big-endian, so any platform reads them the same."],
        ["l", "u", "next", "writeUTF prefixes the string with its length so the reader knows where it ends."],
      ],
    ],
    mistakes: [
      "Reading values in a different order or type than they were written.",
      "Using DataInputStream.readLine for text (deprecated).",
      "Assuming little-endian layout when exchanging files with C programs on x86.",
    ],
    qa: [
      ["What are DataOutputStream and DataInputStream used for?", "Writing and reading Java primitives and UTF strings in a portable, big-endian binary format."],
      ["How many bytes does writeInt write?", "Four, most significant byte first."],
      ["What happens if you read past the end of a DataInputStream?", "An EOFException is thrown."],
    ],
    ex: [
      "Write 5 student records (int roll number, UTF name, double marks) and read them back. What determines how many to read?",
      "Either write the count first with writeInt(5) and loop that many times, or read until EOFException. Each record is read with readInt, readUTF, readDouble in that order.",
    ],
  }),

  lesson("SequenceInputStream", {
    intro:
      "`SequenceInputStream` concatenates several input streams into one: it reads the first until its end, then the second, and so on. It is handy for joining file parts, prefixing a header to data, or treating many inputs as one stream. This lesson covers both constructors and typical uses.",
    topics: [
      [
        "Two constructors",
        "`new SequenceInputStream(in1, in2)` joins two streams. `new SequenceInputStream(Enumeration<? extends InputStream>)` joins any number, for example `Collections.enumeration(listOfStreams)`.",
      ],
      [
        "Behaviour",
        "Reading returns bytes from the current stream; when it reaches its end, that stream is closed and the next one begins. Only after the last stream ends does `read()` return -1. Closing the SequenceInputStream closes all remaining streams.",
      ],
      [
        "Typical uses",
        "Merging split files back into one (`file.part1`, `file.part2`...), prepending a header or appending a footer to existing data without copying it into memory, and presenting several resources as one stream to an API that accepts a single InputStream.",
      ],
      [
        "Character data",
        "SequenceInputStream works with bytes. To join text, wrap the combined stream in an `InputStreamReader` with the right charset, as long as all parts share that encoding.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) throws IOException {
        Path dir = Files.createTempDirectory("seq");
        Files.writeString(dir.resolve("part1.txt"), "Once upon a time, ");
        Files.writeString(dir.resolve("part2.txt"), "a Java program ");
        Files.writeString(dir.resolve("part3.txt"), "joined its parts.");

        try (SequenceInputStream two = new SequenceInputStream(
                Files.newInputStream(dir.resolve("part1.txt")), Files.newInputStream(dir.resolve("part2.txt")))) {
            System.out.println("two streams: " + new String(two.readAllBytes(), StandardCharsets.UTF_8));
        }

        List<InputStream> parts = new ArrayList<>();
        for (int i = 1; i <= 3; i++) parts.add(Files.newInputStream(dir.resolve("part" + i + ".txt")));
        Path merged = dir.resolve("story.txt");
        try (SequenceInputStream all = new SequenceInputStream(Collections.enumeration(parts));
             OutputStream out = Files.newOutputStream(merged)) {
            all.transferTo(out);                                     // merge split files
        }
        System.out.println("merged file: " + Files.readString(merged));

        InputStream header = new ByteArrayInputStream("id,name\n".getBytes(StandardCharsets.UTF_8));
        InputStream rows = new ByteArrayInputStream("1,Asha\n2,Ravi\n".getBytes(StandardCharsets.UTF_8));
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(new SequenceInputStream(header, rows), StandardCharsets.UTF_8))) {
            System.out.println("header + rows read as one text stream: " + reader.lines().toList());
        }

        try (SequenceInputStream empty = new SequenceInputStream(Collections.emptyEnumeration())) {
            System.out.println("no streams: read() returns " + empty.read());
        }
    }
}`,
    walk:
      "The two-argument constructor joins part 1 and part 2 so `readAllBytes` returns their concatenation. With an `Enumeration` of three streams, `transferTo` merges the split files into `story.txt`, exactly the way you would reassemble a file downloaded in pieces.\n\nPrepending a CSV header to data rows becomes trivial: the sequence is wrapped in an `InputStreamReader` and `BufferedReader`, and the lines read as one text. A sequence built from no streams is immediately at its end and `read()` returns -1.",
    anim: [
      "Reading streams in sequence",
      [
        ["s1", "part1.txt", "stream 1"],
        ["s2", "part2.txt", "stream 2"],
        ["s3", "part3.txt", "stream 3"],
        ["seq", "SequenceInput..", "one stream"],
        ["out", "story.txt", "merged"],
      ],
      [
        ["s1", "seq", "first", "The sequence reads stream 1 until it reaches its end, then closes it."],
        ["s2", "seq", "then", "It continues seamlessly with stream 2."],
        ["s3", "seq", "last", "Then stream 3; only after the last one does read() return -1."],
        ["seq", "out", "copy", "To the reader it looks like a single stream, written out as one file."],
      ],
    ],
    mistakes: [
      "Expecting a separator between parts; bytes are joined exactly as they are.",
      "Mixing parts with different text encodings.",
    ],
    qa: [
      ["What is SequenceInputStream?", "An InputStream that reads from a series of input streams one after another, as if they were one."],
      ["How do you combine more than two streams?", "Pass an Enumeration of streams, e.g. Collections.enumeration(list)."],
      ["Are the inner streams closed?", "Each stream is closed when it is exhausted, and closing the SequenceInputStream closes the rest."],
    ],
    ex: [
      "Reassemble `video.mp4.001` through `video.mp4.010` into `video.mp4`.",
      "Open the ten parts in order into a list, wrap with `new SequenceInputStream(Collections.enumeration(list))` and `transferTo` a FileOutputStream for `video.mp4`.",
    ],
  }),

  lesson("ZIP Files: Zipping and Unzipping Directories, Files and JARs", {
    intro:
      "`java.util.zip` creates and extracts ZIP archives, and since a JAR is just a ZIP file, the same code handles JARs too. This lesson zips a whole directory, zips specific files, unzips safely (avoiding \"zip slip\"), lists a JAR's contents, and explains how password-protected ZIP files are handled.",
    topics: [
      [
        "Zipping",
        "Create a `ZipOutputStream` over a file, and for each file call `putNextEntry(new ZipEntry(relativeName))`, copy its bytes, and `closeEntry()`. Entry names use `/` separators and are relative paths inside the archive; directories are entries ending in `/`. `setLevel` controls compression.",
      ],
      [
        "Zipping a directory or specific files",
        "For a directory, walk the tree and add each file with its path relative to the root. For specific files, add just those entries, optionally flattening names. Empty directories need explicit `dir/` entries.",
      ],
      [
        "Unzipping and zip slip",
        "Read entries with `ZipInputStream.getNextEntry()` (or `ZipFile.entries()` for random access), create parent directories, and copy each entry to disk. Always normalise the target path and verify it stays inside the destination folder: a malicious entry named `../../evil` would otherwise write outside it (\"zip slip\").",
      ],
      [
        "JAR files",
        "A JAR is a ZIP with a `META-INF/MANIFEST.MF`. `JarFile` and `JarInputStream` add manifest access; `ZipFile` alone can list and extract classes and resources. The `jar` tool or `FileSystems.newFileSystem(zipPath)` (the ZIP file system provider) are alternatives.",
      ],
      [
        "Password-protected ZIP files",
        "The JDK's zip package does not support encryption or passwords. Use a library such as zip4j (`new ZipFile(\"secret.zip\", password)` with AES-256 parameters), or encrypt the data yourself before zipping (as in the encryption lesson).",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.jar.JarFile;
import java.util.stream.Stream;
import java.util.zip.*;

public class Main {
    static void zipDirectory(Path source, Path zipFile) throws IOException {
        try (ZipOutputStream zip = new ZipOutputStream(Files.newOutputStream(zipFile));
             Stream<Path> paths = Files.walk(source)) {
            for (Path p : (Iterable<Path>) paths.filter(Files::isRegularFile).sorted()::iterator) {
                zip.putNextEntry(new ZipEntry(source.relativize(p).toString().replace('\\', '/')));
                Files.copy(p, zip);
                zip.closeEntry();
            }
        }
    }

    static List<String> unzip(Path zipFile, Path target) throws IOException {
        List<String> extracted = new ArrayList<>();
        try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(zipFile))) {
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                Path out = target.resolve(entry.getName()).normalize();
                if (!out.startsWith(target)) throw new IOException("blocked zip slip entry: " + entry.getName());
                if (entry.isDirectory()) { Files.createDirectories(out); continue; }
                Files.createDirectories(out.getParent());
                Files.copy(zip, out, StandardCopyOption.REPLACE_EXISTING);
                extracted.add(entry.getName());
            }
        }
        return extracted;
    }

    public static void main(String[] args) throws IOException {
        Path base = Files.createTempDirectory("zip-demo");
        Path project = Files.createDirectories(base.resolve("project/src"));
        Files.writeString(project.resolve("App.java"), "class App {}\n".repeat(200));
        Files.writeString(base.resolve("project/README.md"), "# Demo\n");

        Path zip = base.resolve("project.zip");
        zipDirectory(base.resolve("project"), zip);
        long original = Files.size(project.resolve("App.java")) + Files.size(base.resolve("project/README.md"));
        System.out.println("zipped directory: " + original + " bytes -> " + Files.size(zip) + " bytes");

        Path some = base.resolve("only-readme.zip");
        try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(some))) {
            out.putNextEntry(new ZipEntry("README.md"));            // a specific file only
            Files.copy(base.resolve("project/README.md"), out);
            out.closeEntry();
        }
        try (ZipFile zf = new ZipFile(some.toFile())) {
            System.out.println("specific-file zip entries: " + zf.stream().map(ZipEntry::getName).toList());
        }

        System.out.println("unzipped: " + unzip(zip, Files.createDirectories(base.resolve("restored"))));

        Path evil = base.resolve("evil.zip");
        try (ZipOutputStream out = new ZipOutputStream(Files.newOutputStream(evil))) {
            out.putNextEntry(new ZipEntry("../../outside.txt"));
            out.write("attack".getBytes());
            out.closeEntry();
        }
        try {
            unzip(evil, base.resolve("restored"));
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }

        String jdkJar = Path.of(System.getProperty("java.home"), "lib", "jrt-fs.jar").toString();
        try (JarFile jar = new JarFile(jdkJar)) {
            System.out.println("JAR is a ZIP: " + jar.getName().endsWith(".jar") + ", has manifest: " + (jar.getManifest() != null)
                    + ", contains .class entries: " + jar.stream().anyMatch(e -> e.getName().endsWith(".class")));
        }
    }
}`,
    walk:
      "`zipDirectory` walks the project folder and adds every file as an entry whose name is its path relative to the folder, so the repetitive source file compresses to a small fraction of its size. A second archive contains just one specific file, listed with `ZipFile.stream()`.\n\n`unzip` extracts entries with `ZipInputStream`, creating parent folders, and normalises every target path; a crafted entry named `../../outside.txt` is rejected instead of writing outside the destination. Finally the program opens a JAR from the JDK itself with `JarFile`, showing it is a ZIP with a manifest and class entries.",
    anim: [
      "Zipping a directory",
      [
        ["dir", "project/", "files"],
        ["walk", "Files.walk", "each file"],
        ["entry", "ZipEntry", "relative name"],
        ["zos", "ZipOutputStream", "compress"],
        ["zip", "project.zip", "archive"],
      ],
      [
        ["dir", "walk", "traverse", "The directory tree is walked to find every regular file."],
        ["walk", "entry", "name", "Each file becomes an entry named by its path relative to the root."],
        ["entry", "zos", "write", "putNextEntry starts the entry and the file bytes are compressed into it."],
        ["zos", "zip", "close", "closeEntry and close finish the archive with its central directory."],
      ],
    ],
    mistakes: [
      "Extracting entries without checking for `..` in their names (zip slip).",
      "Using absolute paths or backslashes as entry names.",
      "Expecting java.util.zip to open password-protected archives.",
    ],
    qa: [
      ["How do you create a ZIP file in Java?", "Use ZipOutputStream: putNextEntry(new ZipEntry(name)), write the bytes, closeEntry for each file."],
      ["What is zip slip?", "A vulnerability where an archive entry name containing ../ writes files outside the extraction directory; prevent it by normalising and checking the target path."],
      ["Can java.util.zip handle password-protected ZIPs?", "No. Use a library such as zip4j or encrypt the content before zipping."],
      ["What is the difference between a JAR and a ZIP?", "A JAR is a ZIP file with Java-specific conventions such as META-INF/MANIFEST.MF."],
    ],
    ex: [
      "How do you add an empty folder `logs/` to a ZIP archive?",
      "Add an entry whose name ends with a slash: `zip.putNextEntry(new ZipEntry(\"logs/\")); zip.closeEntry();`.",
    ],
  }),

  lesson("Downloading an Image from a URL", {
    intro:
      "Downloading a file from the web is a common I/O task: open a connection to a URL, read the response as a stream and write it to disk. This lesson downloads an image with `URL.openStream`, with the modern `HttpClient`, and checks the HTTP status and content type. The program starts a tiny local HTTP server serving a generated PNG, so it runs without internet access.",
    topics: [
      [
        "With URL.openStream",
        "`try (InputStream in = URI.create(url).toURL().openStream()) { Files.copy(in, target); }` is the shortest way. It follows the URL's protocol (http, https, file) but gives little control over headers, timeouts or status codes.",
      ],
      [
        "With HttpURLConnection",
        "`HttpURLConnection` lets you set the method, headers (`User-Agent`, `Accept`), connect and read timeouts, and check `getResponseCode()` and `getContentType()` before reading `getInputStream()`.",
      ],
      [
        "With HttpClient (Java 11)",
        "`HttpClient.newHttpClient().send(HttpRequest.newBuilder(uri).build(), HttpResponse.BodyHandlers.ofFile(path))` downloads directly to a file, supports HTTP/2, redirects, timeouts and asynchronous `sendAsync`.",
      ],
      [
        "Good practices",
        "Check the status code (200) and content type (`image/png`), set timeouts, write to a temporary file and move it into place when complete, limit the size of untrusted downloads, and stream large files rather than loading them into memory.",
      ],
    ],
    code: String.raw`import com.sun.net.httpserver.HttpServer;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.*;
import java.net.http.*;
import java.nio.file.*;
import javax.imageio.ImageIO;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedImage image = new BufferedImage(40, 20, BufferedImage.TYPE_INT_RGB);   // generate a small PNG
        for (int x = 0; x < 40; x++) for (int y = 0; y < 20; y++) image.setRGB(x, y, x < 20 ? 0xFF9933 : 0x138808);
        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(image, "png", png);
        byte[] pngBytes = png.toByteArray();

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);   // local server, any free port
        server.createContext("/logo.png", exchange -> {
            exchange.getResponseHeaders().add("Content-Type", "image/png");
            exchange.sendResponseHeaders(200, pngBytes.length);
            try (OutputStream body = exchange.getResponseBody()) { body.write(pngBytes); }
        });
        server.start();
        String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/logo.png";
        Path dir = Files.createTempDirectory("download");

        Path viaOpenStream = dir.resolve("logo1.png");
        try (InputStream in = URI.create(url).toURL().openStream()) {
            Files.copy(in, viaOpenStream);
        }
        System.out.println("URL.openStream downloaded " + Files.size(viaOpenStream) + " bytes");

        HttpURLConnection connection = (HttpURLConnection) URI.create(url).toURL().openConnection();
        connection.setConnectTimeout(5_000);
        connection.setReadTimeout(5_000);
        connection.setRequestProperty("User-Agent", "java-course-demo");
        System.out.println("HttpURLConnection status " + connection.getResponseCode() + ", content type " + connection.getContentType());
        connection.disconnect();

        HttpClient client = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build();
        HttpResponse<Path> response = client.send(HttpRequest.newBuilder(URI.create(url)).GET().build(),
                HttpResponse.BodyHandlers.ofFile(dir.resolve("logo2.png")));
        System.out.println("HttpClient status " + response.statusCode() + ", saved to " + response.body().getFileName());

        BufferedImage downloaded = ImageIO.read(response.body().toFile());
        System.out.println("downloaded image is " + downloaded.getWidth() + "x" + downloaded.getHeight()
                + ", files identical: " + (Files.mismatch(viaOpenStream, response.body()) == -1));

        HttpResponse<String> missing = client.send(HttpRequest.newBuilder(URI.create(url.replace("logo", "nothing"))).build(),
                HttpResponse.BodyHandlers.ofString());
        System.out.println("missing image status " + missing.statusCode() + " (check before saving)");
        server.stop(0);
    }
}`,
    walk:
      "The program draws a 40 x 20 two-colour image, encodes it as PNG and serves it from a JDK `HttpServer` on a free local port, so no internet is needed. `URL.openStream` with `Files.copy` downloads it in two lines.\n\n`HttpURLConnection` adds timeouts and headers and reports status 200 and content type `image/png`. `HttpClient` downloads straight to a file with `BodyHandlers.ofFile`. `ImageIO` confirms the download is a valid 40 x 20 image, identical to the first copy. Requesting a missing path returns status 404, which is why you check the status before saving.",
    anim: [
      "Downloading to a file",
      [
        ["client", "HttpClient", "GET /logo.png"],
        ["server", "web server", "image/png"],
        ["status", "status 200?", "check"],
        ["stream", "body stream", "bytes"],
        ["file", "logo.png", "on disk"],
      ],
      [
        ["client", "server", "request", "The client sends a GET request for the image URL."],
        ["server", "status", "response", "The server answers with a status code and a Content-Type header."],
        ["status", "stream", "200 OK", "Only a successful response's body should be saved."],
        ["stream", "file", "copy", "The body is streamed to a file without loading it all into memory."],
      ],
    ],
    mistakes: [
      "Saving error pages as images because the status code was not checked.",
      "No timeouts, so a slow server hangs the program forever.",
      "Reading the whole response into memory for large files.",
    ],
    qa: [
      ["How do you download a file from a URL in Java?", "Open the URL's InputStream (URL.openStream or HttpURLConnection) and copy it to a file with Files.copy, or use HttpClient with BodyHandlers.ofFile."],
      ["Why use HttpClient over URL.openStream?", "It supports timeouts, headers, status handling, HTTP/2, redirects and asynchronous requests."],
      ["How do you check a download is really an image?", "Check the status code and Content-Type, and optionally decode it with ImageIO.read, which returns null for non-images."],
    ],
    ex: [
      "Download five images concurrently with HttpClient. Which method lets you avoid blocking a thread per download?",
      "`client.sendAsync(request, BodyHandlers.ofFile(path))` returns a CompletableFuture; collect them and wait with `CompletableFuture.allOf(...).join()`.",
    ],
  }),

  lesson("Executing CMD and Shell Commands from Java", {
    intro:
      "Java programs sometimes need to run external commands: a script, `git`, `ffmpeg` or a system utility. `ProcessBuilder` starts processes, sets their working directory and environment, and connects to their input, output and error streams. This lesson runs commands portably, reads their output, checks exit codes, applies timeouts and avoids the classic deadlock.",
    topics: [
      [
        "ProcessBuilder and Runtime.exec",
        "`new ProcessBuilder(\"git\", \"status\").start()` runs a program with arguments passed separately (no shell parsing, so no injection problems). `Runtime.getRuntime().exec(...)` is the older equivalent. Shell built-ins such as `dir` or `echo` need a shell: `cmd /c dir` on Windows, `sh -c \"ls -l\"` on Unix.",
      ],
      [
        "Reading output and the deadlock trap",
        "A process writes to stdout and stderr pipes with small buffers. If you never read them, the process blocks when the buffer fills and `waitFor()` waits forever. Read the output (`process.getInputStream()`), merge stderr with `redirectErrorStream(true)`, or redirect to files with `redirectOutput(file)` or `inheritIO()`.",
      ],
      [
        "Exit codes and timeouts",
        "`waitFor()` returns the exit code (0 usually means success). `waitFor(timeout, unit)` returns false if the process is still running, after which `destroy()` or `destroyForcibly()` stops it.",
      ],
      [
        "Working directory, environment and input",
        "`directory(file)` sets the working directory, `environment()` returns a mutable map of environment variables for the child, and `getOutputStream()` lets you write to the child's standard input. `ProcessHandle` (Java 9) reports pid, parent and children.",
      ],
      [
        "Security",
        "Never build a command string from user input; pass arguments as separate list elements and validate them. Running a shell with user input enables command injection.",
      ],
    ],
    code: String.raw`import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class Main {
    static String run(ProcessBuilder pb) throws Exception {
        pb.redirectErrorStream(true);                         // merge stderr into stdout
        Process p = pb.start();
        String output = new String(p.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();   // always drain
        int exit = p.waitFor();
        return "exit " + exit + ": " + output.lines().findFirst().orElse("");
    }

    public static void main(String[] args) throws Exception {
        boolean windows = System.getProperty("os.name").startsWith("Windows");
        String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();

        System.out.println("java -version -> " + run(new ProcessBuilder(java, "-version")).startsWith("exit 0"));

        List<String> echo = windows ? List.of("cmd", "/c", "echo hello from the shell") : List.of("sh", "-c", "echo hello from the shell");
        System.out.println("shell built-in: " + run(new ProcessBuilder(echo)));

        Path dir = Files.createTempDirectory("proc");
        Files.writeString(dir.resolve("Hi.java"), "public class Hi { public static void main(String[] a) { System.out.println(\"HI=\" + System.getenv(\"GREETING\") + \" in \" + new java.io.File(\".\").getAbsoluteFile().getParentFile().getName()); System.exit(3); } }");
        ProcessBuilder pb = new ProcessBuilder(java, "Hi.java").directory(dir.toFile());
        pb.environment().put("GREETING", "namaste");          // environment for the child only
        System.out.println("custom dir, env and exit code: " + run(pb).replace(dir.getFileName().toString(), "<tempdir>"));

        Files.writeString(dir.resolve("Slow.java"), "public class Slow { public static void main(String[] a) throws Exception { Thread.sleep(30_000); } }");
        Process slow = new ProcessBuilder(java, "Slow.java").directory(dir.toFile()).start();
        boolean finished = slow.waitFor(2, TimeUnit.SECONDS);
        if (!finished) slow.destroyForcibly().waitFor();          // wait until it is really gone
        System.out.println("timeout: finished in time = " + finished + ", killed = " + !slow.isAlive() + " after destroyForcibly");

        Files.writeString(dir.resolve("Upper.java"), "public class Upper { public static void main(String[] a) throws Exception { System.out.print(new String(System.in.readAllBytes()).toUpperCase()); } }");
        Process upper = new ProcessBuilder(java, "Upper.java").directory(dir.toFile()).start();
        try (OutputStream stdin = upper.getOutputStream()) { stdin.write("piped input".getBytes()); }
        System.out.println("wrote to the child's stdin, it answered: " + new String(upper.getInputStream().readAllBytes()));
        upper.waitFor();
        System.out.println("this process id is known: " + (ProcessHandle.current().pid() > 0));
    }
}`,
    varies: true,
    walk:
      "`run` merges stderr into stdout, always reads the whole output (avoiding the full-pipe deadlock) and then waits for the exit code. Running `java -version` exits with 0. An `echo` needs a shell, so the program uses `cmd /c` on Windows and `sh -c` elsewhere.\n\nThe next child runs a single-file Java program in a chosen working directory with an extra environment variable, and exits with code 3, which `waitFor` reports. A child that sleeps 30 seconds is stopped after a 2-second `waitFor` timeout with `destroyForcibly()`. Finally the program writes to a child's standard input and reads its upper-cased reply.",
    anim: [
      "Running an external process",
      [
        ["java", "your program", "ProcessBuilder"],
        ["child", "child process", "git, java ..."],
        ["out", "stdout/stderr", "pipes"],
        ["drain", "read output", "avoid deadlock"],
        ["exit", "waitFor()", "exit code"],
      ],
      [
        ["java", "child", "start()", "start() launches the program with separate, unparsed arguments."],
        ["child", "out", "write", "The child writes to pipes with small buffers."],
        ["out", "drain", "read", "The parent must read those pipes, or the child blocks when they fill."],
        ["drain", "exit", "wait", "waitFor() then returns the exit code; a timeout lets you kill a stuck child."],
      ],
    ],
    mistakes: [
      "Calling `waitFor()` before reading a process's output, causing a deadlock with verbose commands.",
      "Building shell command strings from user input (command injection).",
      "Using `cmd /c` or `sh -c` when the program can be started directly.",
    ],
    qa: [
      ["How do you run a system command from Java?", "With ProcessBuilder (or Runtime.exec): start it, read its output, and waitFor the exit code."],
      ["Why can a process started from Java hang?", "Its output or error pipe fills up because the parent never reads it; read the streams, merge them or redirect them."],
      ["How do you set a timeout on a process?", "process.waitFor(timeout, unit) and destroy()/destroyForcibly() if it returns false."],
    ],
    ex: [
      "Run `git log --oneline -5` in a project folder and print the lines, failing if git exits non-zero.",
      "`Process p = new ProcessBuilder(\"git\", \"log\", \"--oneline\", \"-5\").directory(projectDir).redirectErrorStream(true).start(); String out = new String(p.getInputStream().readAllBytes()); if (p.waitFor() != 0) throw new IllegalStateException(out); System.out.println(out);`.",
    ],
  }),
]);
