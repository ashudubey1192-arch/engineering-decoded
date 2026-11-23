// A small, deterministic console formatter shared by the in-page playground and the
// generator (scripts/namaste-js-console.mjs), so recorded output and live output match.
function formatKey(key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`;
}

function inspect(value, depth, seen) {
  if (value === null) return "null";
  const type = typeof value;
  if (type === "string") return depth === 0 ? value : `'${value}'`;
  if (type === "number" || type === "boolean" || type === "undefined") return String(value);
  if (type === "bigint") return `${value}n`;
  if (type === "symbol") return value.toString();
  if (type === "function") {
    if (/^class\s/.test(Function.prototype.toString.call(value))) return `[class ${value.name}]`;
    return value.name ? `[Function: ${value.name}]` : "[Function (anonymous)]";
  }
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Promise) return "Promise { … }";
  if (seen.has(value)) return "[Circular]";
  if (depth > 2) return Array.isArray(value) ? "[Array]" : "[Object]";
  seen.add(value);
  const next = (item) => inspect(item, depth + 1, seen);
  let out;
  if (Array.isArray(value)) {
    out = value.length ? `[ ${Array.from(value, next).join(", ")} ]` : "[]";
  } else if (value instanceof Map) {
    const items = [...value].map(([key, item]) => `${next(key)} => ${next(item)}`);
    out = `Map(${value.size}) ${items.length ? `{ ${items.join(", ")} }` : "{}"}`;
  } else if (value instanceof Set) {
    const items = [...value].map(next);
    out = `Set(${value.size}) ${items.length ? `{ ${items.join(", ")} }` : "{}"}`;
  } else {
    const proto = Object.getPrototypeOf(value);
    const name = proto && proto !== Object.prototype ? proto.constructor?.name : "";
    const entries = Object.keys(value).map((key) => `${formatKey(key)}: ${next(value[key])}`);
    const body = entries.length ? `{ ${entries.join(", ")} }` : "{}";
    out = name ? `${name} ${body}` : proto === null ? `[Object: null prototype] ${body}` : body;
  }
  seen.delete(value);
  return out;
}

export function formatValue(value) {
  return inspect(value, 0, new Set());
}

export function formatArgs(args) {
  return args.map((value) => formatValue(value)).join(" ");
}
