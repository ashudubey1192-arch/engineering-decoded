// Shared teaching harness, included in every copyable standalone Java program.
export function javaArraySource(method, invocation, className = "ArrayLesson") {
  return `import java.util.*;

public class ${className} {
  private static final List<String> frames = new ArrayList<>();

${method}

  // Teaching support: snapshots never participate in the algorithm's decisions.
  static void emit(String note, int[] values, int... active) {
    frames.add("{\\"note\\":" + json(note) + ",\\"values\\":" + json(values)
        + ",\\"active\\":" + json(active) + "}");
  }

  static String json(Object value) {
    if (value == null) return "null";
    if (value instanceof Number || value instanceof Boolean) return value.toString();
    if (value.getClass().isArray()) {
      List<String> parts = new ArrayList<>();
      for (int i = 0; i < java.lang.reflect.Array.getLength(value); i++)
        parts.add(json(java.lang.reflect.Array.get(value, i)));
      return "[" + String.join(",", parts) + "]";
    }
    if (value instanceof Collection<?> items) {
      List<String> parts = new ArrayList<>();
      for (Object item : items) parts.add(json(item));
      return "[" + String.join(",", parts) + "]";
    }
    return "\\"" + value.toString().replace("\\\\", "\\\\\\\\")
        .replace("\\"", "\\\\\\"").replace("\\n", "\\\\n") + "\\"";
  }

  public static void main(String[] args) {
    Object result = ${invocation};
    if (args.length > 0 && args[0].equals("--trace"))
      for (String frame : frames) System.out.println("TRACE\\t" + frame);
    System.out.println(json(result));
  }
}
`;
}
