// Shared shapes for the System Design courses.
//
// Animation (compact form): [title, map, steps]
//   map    "u:User | lb:Load balancer | a:Server A:idle, b:Server B | db:Database"
//          columns are separated by "|", nodes inside a column by ",",
//          each node is id:Label:sub (sub is optional).
//   steps  [path, token, note, changes?]
//          path    "u>lb" moves one token, "a>b,c" broadcasts, "a" is work inside a node.
//          changes "a=40% CPU; b=!down" replaces node subs from this step on.
//                  "!" marks a failure, "+" a success, "~" a warning.
// scripts/check-system-design-depth.mjs enforces the limits.
export function parseMap(map) {
  return map.split("|").map((column) =>
    column.split(",").map((node) => {
      const [id, label, sub = ""] = node.split(":").map((part) => part.trim());
      return { id, label, sub };
    }),
  );
}

export function parseChanges(text = "") {
  return Object.fromEntries(
    text
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const cut = item.indexOf("=");
        const value = item.slice(cut + 1).trim();
        const mood = { "!": "bad", "+": "good", "~": "warn" }[value[0]] || "";
        return [item.slice(0, cut).trim(), { sub: mood ? value.slice(1).trim() : value, mood }];
      }),
  );
}

function animation([title, map, steps]) {
  return {
    title,
    columns: parseMap(map),
    steps: steps.map(([path, token, note, changes]) => {
      const [from, targets] = path.split(">").map((part) => part.trim());
      return {
        from,
        to: targets ? targets.split(",").map((part) => part.trim()) : [from],
        token,
        note,
        changes: parseChanges(changes),
      };
    }),
  };
}

// Extra depth shown around a lesson that already has its own article.
export function deep({ anim, more, use, avoid, answer, qa }) {
  return { anim: animation(anim), more, use, avoid, answer, qa };
}

// A complete lesson rendered by SystemDesignLesson.
export function lesson({ anim, ...content }) {
  return { ...content, anim: animation(anim) };
}
