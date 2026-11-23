// Season 1, episodes 7-12: scope, lexical environment, TDZ, block scope, closures.
import { njs } from "./schema.js";

export const scopeLessons = {
  "nj-scope--scope-and-lexical-environment": njs({
    intro:
      "Scope answers the question 'where can I access this variable or function?'. In JavaScript the answer is decided by the lexical environment: where the code is physically written in the source. Every execution context has a lexical environment made of its own local memory plus a reference to the lexical environment of its parent, the place where the function was written, not where it was called.",
    concepts: [
      "Lexical means 'in hierarchy, in order of where it is written'. A function `c` written inside `a` is lexically inside `a`, so `a` is its lexical parent.",
      "Lexical environment = local memory + a reference to the parent's lexical environment. The global lexical environment's parent reference is `null`.",
      "Scope is directly dependent on the lexical environment. An inner function can read outer variables; an outer function cannot read an inner function's locals.",
    ],
    snapshot: {
      title: "Lexical environments while c() runs",
      panes: [
        ["c() env", ["*(no local b)", "parent → a()"]],
        ["a() env", ["b : 10", "c : ƒ", "parent → global"]],
        ["Global env", ["a : ƒ", "parent → null"]],
      ],
      caption: "c has no b of its own, so the engine follows the parent reference to a's environment and finds b = 10.",
    },
    animation: {
      title: "Following the parent reference",
      nodes: [
        ["c", "c() env", "local memory"],
        ["a", "a() env", "b = 10"],
        ["g", "Global env", "a: ƒ"],
        ["nul", "null", "end of chain"],
      ],
      steps: [
        ["c", "c", "b?", "c reads b; its own local memory has no b."],
        ["c", "a", "parent", "The engine follows c's parent reference to a's lexical environment."],
        ["a", "c", "10", "a's memory has b = 10, so the lookup succeeds and returns 10."],
        ["g", "a", "no access", "The global code cannot see b: lookups only go outward, never inward."],
        ["g", "nul", "end", "The global environment's parent is null; a name missing there is not defined."],
      ],
    },
    code: `function a() {
  var b = 10;
  c();
  function c() {
    console.log("c sees b =", b); // found in the lexical parent a()
  }
}

a();

try {
  console.log(b);                 // global scope cannot look inside a()
} catch (error) {
  console.log(error.name + ":", error.message);
}`,
    walkthrough:
      "`c` is written inside `a`, so its lexical parent is `a`. When `c` reads `b`, it does not find it locally and moves to `a`'s environment, where `b` is 10. The global code has no `b` in its own environment and its parent is null, so the lookup fails with a ReferenceError.",
    deepDive: [
      {
        heading: "Written-in, not called-from",
        paragraphs: [
          "Lexical scope is fixed when the code is written. Calling a function from somewhere else does not give it access to the caller's variables.",
        ],
        code: `var who = "global";
function show() { console.log(who); }
function caller() { var who = "caller"; show(); }
caller(); // "global" — show's parent is the global scope`,
      },
      {
        heading: "Seeing it in DevTools",
        paragraphs: [
          "Pause inside `c` with a breakpoint. The Scope panel lists Local, then Closure (a), then Global. That list is the lexical environment chain, top to bottom.",
        ],
      },
    ],
    mistakes: [
      "Assuming a function can see the variables of whoever called it (that would be dynamic scope, which JavaScript does not use).",
      "Trying to read a function's local variables from outside it.",
    ],
    interview: [
      ["What is a lexical environment?", "The local memory of an execution context together with a reference to the lexical environment of its lexical parent (where the code was written)."],
      ["What does lexical mean?", "Relating to the physical placement in the source code. A function's lexical parent is the function or scope it was written inside."],
      ["Is JavaScript lexically or dynamically scoped?", "Lexically scoped. Variable access depends on where functions are written, not on where they are called from (`this` is the main thing decided at call time)."],
    ],
    exercise:
      "In the `who` example from the deep dive, how would you make `show()` print \"caller\" without using globals?",
    answer:
      "Either define `show` inside `caller` so its lexical parent is `caller`, or pass the value in: `function show(who) { console.log(who); }` and call `show(who)`.",
  }),

  "nj-scope--the-scope-chain": njs({
    intro:
      "The scope chain is the chain of lexical environments linked by parent references. When code reads a name, the engine searches the current environment, then its parent, then the parent's parent, all the way to the global environment. The first match wins; if the chain ends at null without a match, the name is not defined.",
    concepts: [
      "The search is always inside-out. Each step follows one parent reference, and stops at the first environment that has the name.",
      "Because the first match wins, an inner variable with the same name as an outer one hides (shadows) it for that inner code.",
      "The chain is built from where functions are written, so it is known ahead of time. Engines use this to optimise lookups.",
    ],
    snapshot: {
      title: "Chain while innermost() runs",
      panes: [
        ["innermost()", ["*level : 'inner'", "→ middle()"]],
        ["middle()", ["shared: 'middle'", "→ outer()"]],
        ["outer()", ["shared : 'outer'", "top: 'outer…'", "→ global"]],
        ["Global", ["app : 'demo'", "→ null"]],
      ],
      caption: "Reading shared stops at middle (first match). Reading app walks the whole chain. Reading missing reaches null and throws.",
    },
    animation: {
      title: "Inside-out lookup",
      nodes: [
        ["i", "innermost", "level"],
        ["m", "middle", "shared"],
        ["o", "outer", "shared, top"],
        ["g", "Global", "app"],
        ["n", "null", "not defined"],
      ],
      steps: [
        ["i", "m", "shared?", "shared is not local, so the search moves to middle, where it is found."],
        ["i", "o", "top?", "top is in neither innermost nor middle; the search reaches outer."],
        ["o", "g", "app?", "app is only in the global environment, three hops away."],
        ["g", "n", "missing?", "A name found nowhere reaches null and causes a ReferenceError."],
      ],
    },
    code: `var app = "demo";

function outer() {
  var shared = "outer";
  var top = "outer only";
  function middle() {
    var shared = "middle";
    function innermost() {
      var level = "inner";
      console.log(level, "|", shared, "|", top, "|", app);
      try {
        console.log(missing);
      } catch (e) {
        console.log(e.message);
      }
    }
    innermost();
  }
  middle();
}

outer();`,
    walkthrough:
      "`level` is local. `shared` is found in `middle` first, so the outer `shared` is never reached. `top` comes from `outer`, `app` from the global scope. `missing` exists nowhere in the chain, so the lookup ends at null and throws `missing is not defined`.",
    deepDive: [
      {
        heading: "Scope chain vs prototype chain",
        points: [
          "Scope chain: resolves bare names like `x`, using lexical environments.",
          "Prototype chain: resolves properties like `obj.x`, using `[[Prototype]]` links.",
          "A missing name throws ReferenceError; a missing property just gives `undefined`.",
        ],
      },
      {
        heading: "Cost of long chains",
        paragraphs: [
          "Modern engines resolve most lookups at compile time, so deep nesting is rarely a performance problem. It is a readability problem: deeply nested closures make it hard to see where a value comes from.",
        ],
      },
    ],
    mistakes: [
      "Expecting an inner redeclaration to update the outer variable. It creates a new binding that shadows the outer one.",
      "Confusing a missing variable (ReferenceError) with a missing property (undefined).",
    ],
    interview: [
      ["What is the scope chain?", "The chain of lexical environments connected by parent references. Name lookup walks it from the current environment outward to the global environment."],
      ["What happens when the scope chain ends without a match?", "The engine throws `ReferenceError: name is not defined` (or, in sloppy mode, an assignment to that name creates a global)."],
      ["Can an outer function access an inner function's variables?", "No. Lookups only go outward along parent references, never into child environments."],
    ],
    exercise:
      "Delete `var shared = \"middle\";` from `middle`. What does the first log print now?",
    answer:
      "`inner | outer | outer only | demo`. Without the closer match, the search for `shared` continues to `outer`.",
  }),

  "nj-scope--let-and-const-and-the-temporal-dead-zone": njs({
    intro:
      "`let` and `const` are hoisted, but differently from `var`. Their memory is allocated during the memory phase in a separate place (not on the global object), and they are not initialised. The time from the start of the scope until the declaration line runs is the temporal dead zone (TDZ). Any access during the TDZ throws a ReferenceError.",
    concepts: [
      "`var` at global level is attached to the global object. `let` and `const` live in a separate 'script' scope, so `window.a` is undefined for a global `let a`.",
      "Temporal dead zone: the binding exists but is uninitialised. Reading or writing it before its declaration throws `Cannot access 'a' before initialization`.",
      "`const` must be initialised on the same line and cannot be reassigned. `let` can be declared without a value and reassigned, but neither can be redeclared in the same scope.",
    ],
    snapshot: {
      title: "Memory before line 1",
      panes: [
        ["Global (object)", ["b : undefined", "→ window.b"]],
        ["Script scope", ["*a : <TDZ>", "c : <TDZ>"]],
        ["Timeline for a", ["start of scope", "*… TDZ …", "let a = 10 → 10"]],
      ],
      caption: "b is a normal hoisted var. a and c exist but are uninitialised until their declaration lines execute.",
    },
    animation: {
      title: "Leaving the temporal dead zone",
      nodes: [
        ["start", "Scope starts", "memory phase"],
        ["tdz", "TDZ", "uninitialised"],
        ["decl", "let a = 10", "declaration"],
        ["ok", "a = 10", "usable"],
      ],
      steps: [
        ["start", "tdz", "hoist", "a is hoisted into the script scope but left uninitialised."],
        ["tdz", "tdz", "read a", "Reading a during the TDZ throws ReferenceError: Cannot access 'a' before initialization."],
        ["tdz", "decl", "line runs", "The declaration line runs and initialises a."],
        ["decl", "ok", "10", "From now on a is readable and, because it is let, reassignable."],
      ],
    },
    code: `try {
  console.log(a);           // in the TDZ
} catch (e) {
  console.log(e.name + ":", e.message);
}

console.log(b);             // var: hoisted as undefined
let a = 10;
var b = 100;
console.log(a, b);

const c = 1000;
try {
  c = 2000;                 // const cannot be reassigned
} catch (e) {
  console.log(e.name + ":", e.message);
}

let later;                  // let may start without a value
later = "assigned later";
console.log(later);`,
    walkthrough:
      "Reading `a` before `let a = 10` throws because `a` is in the TDZ. `b` is a `var`, so it logs `undefined`. After their lines, both have values. Assigning to the `const c` throws `TypeError: Assignment to constant variable.`. `let later` starts as undefined and is assigned afterwards.",
    deepDive: [
      {
        heading: "Redeclaration rules",
        points: [
          "`var a; var a;` → allowed.",
          "`let a; let a;` → SyntaxError: Identifier 'a' has already been declared (the whole script fails to run).",
          "`let a; var a;` → SyntaxError as well.",
          "`const` must have an initialiser: `const x;` is a SyntaxError.",
        ],
      },
      {
        heading: "TDZ is about time, not position",
        paragraphs: [
          "A function that reads a `let` can be defined above the declaration, as long as it is called after the declaration has run.",
        ],
        code: `function show() { console.log(value); }
let value = 5;
show(); // 5 — called after the TDZ ended`,
      },
      {
        heading: "Which one to use",
        points: [
          "`const` by default: most bindings never need reassignment.",
          "`let` when the binding must change (counters, accumulators).",
          "Avoid `var`; its function scope and global-object properties cause surprises.",
          "Put declarations at the top of their scope to shrink the TDZ to zero.",
        ],
      },
    ],
    mistakes: [
      "Thinking `let`/`const` are not hoisted. They are; they are just uninitialised (TDZ).",
      "Believing `const` makes objects immutable. It freezes the binding, not the object's contents.",
    ],
    interview: [
      ["Are let and const hoisted?", "Yes. Memory is allocated in the memory phase, but they are not initialised, so they are in the temporal dead zone until their declaration runs."],
      ["What is the temporal dead zone?", "The period between entering a scope and executing a let/const/class declaration, during which accessing that binding throws a ReferenceError."],
      ["Why is window.a undefined for a global let a?", "Global let/const are stored in a separate declarative environment (the script scope), not as properties of the global object."],
    ],
    exercise:
      "What happens with `let x = 1; { console.log(x); let x = 2; }`?",
    answer:
      "ReferenceError. The inner block declares its own `x`, which is hoisted to the top of the block and is in its TDZ at the `console.log`. The outer `x` is shadowed, so the engine does not fall back to it.",
  }),

  "nj-scope--referenceerror-vs-typeerror-vs-syntaxerror": njs({
    intro:
      "Three error types show up constantly around declarations. A SyntaxError means the code is not valid JavaScript and none of it runs. A ReferenceError means a name cannot be resolved (not defined, or in the TDZ). A TypeError means the name exists but the operation is not allowed on its value, such as reassigning a `const` or calling something that is not a function.",
    concepts: [
      "SyntaxError is raised while parsing, before execution. A duplicate `let` declaration or a `const` without an initialiser stops the whole script, even lines above the mistake.",
      "ReferenceError is raised at runtime when a name lookup fails: the name was never declared, or it is still in the temporal dead zone.",
      "TypeError is raised at runtime when a value is used in a way its type does not support: assigning to a `const`, calling `undefined()`, reading a property of `null`.",
    ],
    snapshot: {
      title: "Which error, when",
      panes: [
        ["SyntaxError", ["parse time", "let a; let a;", "const b;", "nothing runs"]],
        ["ReferenceError", ["run time", "never declared", "*read in TDZ", "lines above ran"]],
        ["TypeError", ["run time", "const reassigned", "undefined()", "null.prop"]],
      ],
      caption: "SyntaxError prevents execution entirely. The other two happen when the faulty line runs, so earlier lines have already executed.",
    },
    animation: {
      title: "Where each error is detected",
      nodes: [
        ["src", "Source", "your code"],
        ["parse", "Parser", "grammar check"],
        ["syn", "SyntaxError", "no execution"],
        ["run", "Execution", "line by line"],
        ["ref", "ReferenceError", "name lookup"],
        ["typ", "TypeError", "bad operation"],
      ],
      steps: [
        ["src", "parse", "parse", "The whole script is parsed before any statement runs."],
        ["parse", "syn", "invalid", "Invalid grammar such as a duplicate let stops everything with a SyntaxError."],
        ["parse", "run", "valid", "Valid code moves on to execution, one line at a time."],
        ["run", "ref", "lookup fails", "A name that is not declared or is in its TDZ throws a ReferenceError."],
        ["run", "typ", "bad op", "A value used the wrong way, like calling undefined, throws a TypeError."],
      ],
    },
    code: `function attempt(label, fn) {
  try { fn(); } catch (e) { console.log(label.padEnd(16), "→", e.name + ":", e.message); }
}

attempt("not declared", () => notDeclared);
attempt("TDZ", () => { tdz; let tdz = 1; });
attempt("const reassign", () => { const k = 1; k = 2; });
attempt("call undefined", () => { const f = undefined; f(); });
attempt("null property", () => { const user = null; user.name; });

// SyntaxErrors happen at parse time; here we parse code at runtime to show one.
attempt("duplicate let", () => new Function("let a = 1; let a = 2;"));
attempt("const no value", () => new Function("const b;"));`,
    walkthrough:
      "The first two lookups fail, giving ReferenceErrors (one not defined, one TDZ). The next three use real values incorrectly, giving TypeErrors. The last two are parsed with `new Function`, so the parser reports SyntaxErrors; in a normal script those mistakes would stop the entire file from running.",
    deepDive: [
      {
        heading: "Reading error messages fast",
        points: [
          "'x is not defined' → ReferenceError, missing declaration (typo? wrong scope?).",
          "'Cannot access x before initialization' → ReferenceError, TDZ (move the line or the declaration).",
          "'Assignment to constant variable' → TypeError, use `let`.",
          "'x is not a function' → TypeError, value is undefined or not callable yet (hoisting of expressions?).",
          "'Identifier x has already been declared' → SyntaxError, duplicate let/const.",
        ],
      },
      {
        heading: "Why SyntaxError blocks earlier lines",
        paragraphs: [
          "JavaScript parses the whole script (or module) before executing it. If parsing fails, there is no valid program to run, so even `console.log` on line 1 never happens. ReferenceError and TypeError are thrown mid-execution, after earlier lines already ran.",
        ],
      },
    ],
    mistakes: [
      "Assuming code above a SyntaxError still runs. It does not.",
      "Treating every runtime error as a ReferenceError; the type tells you whether the name or the operation is the problem.",
    ],
    interview: [
      ["Difference between SyntaxError, ReferenceError and TypeError?", "SyntaxError: invalid code found at parse time, nothing runs. ReferenceError: a name cannot be resolved at runtime (undeclared or TDZ). TypeError: the name resolves but the operation is invalid for its value."],
      ["What error does `let a = 1; let a = 2;` give?", "SyntaxError: Identifier 'a' has already been declared, raised before any code executes."],
      ["What error does reassigning a const give?", "TypeError: Assignment to constant variable."],
    ],
    exercise:
      "Classify: `null.length`, `console.log(q); let q;`, `const z;`, `undefinedFn()` where `undefinedFn` was never declared.",
    answer:
      "TypeError (property of null), ReferenceError (TDZ), SyntaxError (const without initialiser), ReferenceError (not defined — the name lookup fails before the call is attempted).",
  }),

  "nj-scope--block-scope": njs({
    intro:
      "A block, also called a compound statement, is the code between a pair of curly braces. Blocks group multiple statements where JavaScript expects one, such as the body of an `if` or a `for`. `let` and `const` declared inside a block live in a block scope that disappears when the block ends; `var` ignores blocks and belongs to the enclosing function or global scope.",
    concepts: [
      "A block `{ ... }` combines several statements into one so you can use them where the grammar expects a single statement: `if (true) statement` becomes `if (true) { ... }`.",
      "`let` and `const` inside a block are hoisted into a separate Block scope. They are only accessible inside the braces.",
      "`var` inside a block is hoisted to the function (or global) scope, so it is still visible after the block ends.",
    ],
    snapshot: {
      title: "Scopes while inside the block",
      panes: [
        ["Block", ["*b : 20", "*c : 30"]],
        ["Script (let/const)", ["(global lets here)"]],
        ["Global", ["a : 10", "(var ignores blocks)"]],
      ],
      caption: "DevTools shows this as Block, Script and Global scopes. After the closing brace, the Block scope (b, c) is gone but a remains.",
    },
    animation: {
      title: "What survives the closing brace",
      nodes: [
        ["blk", "Block { }", "b, c"],
        ["fn", "Global/function", "a"],
        ["after", "After block", "next line"],
        ["err", "ReferenceError", "b gone"],
      ],
      steps: [
        ["blk", "fn", "var a", "var a inside the block is hoisted to the enclosing global scope."],
        ["blk", "blk", "let b", "let b and const c are hoisted into the block's own scope."],
        ["blk", "after", "close", "When the block finishes, its scope is discarded."],
        ["after", "fn", "a ✓", "a is still readable after the block: it never belonged to it."],
        ["after", "err", "b ✗", "Reading b after the block throws because its scope no longer exists."],
      ],
    },
    code: `{
  var a = 10;
  let b = 20;
  const c = 30;
  console.log("inside:", a, b, c);
}

console.log("after, a =", a);
try {
  console.log(b);
} catch (e) {
  console.log(e.name + ":", e.message);
}

// Blocks are what let 'if' run several statements:
if (a > 5) {
  const message = "a is big";
  console.log(message);
}`,
    walkthrough:
      "Inside the block all three are visible. After it, `a` (a `var`) is still there, while `b` and `c` went away with the block scope, so reading `b` throws. The `if` shows the main reason blocks exist: grouping statements, with `message` scoped to that branch.",
    deepDive: [
      {
        heading: "Blocks everywhere",
        points: [
          "`if`, `else`, `for`, `while`, `try`, `catch` and bare `{}` all create blocks.",
          "Function bodies are blocks too, but they also create a function scope that captures `var`.",
          "Each `for (let i ...)` iteration gets its own copy of `i` (the basis of the famous closure-in-loop fix).",
        ],
      },
      {
        heading: "Why block scope matters",
        paragraphs: [
          "Block scope keeps temporary variables close to where they are used and prevents accidental reuse. A loop counter declared with `let` cannot leak out and clash with code below.",
        ],
        code: `for (var i = 0; i < 3; i++) {}
console.log(i); // 3 — leaked
for (let j = 0; j < 3; j++) {}
// console.log(j); // ReferenceError — contained`,
      },
    ],
    mistakes: [
      "Using `var` in loops and blocks and then being surprised the variable is visible (and mutated) outside.",
      "Expecting an object literal `{}` and a block `{}` to be the same thing; at the start of a statement, braces are a block.",
    ],
    interview: [
      ["What is a block in JavaScript?", "A compound statement: zero or more statements wrapped in curly braces, used wherever the grammar expects a single statement."],
      ["What is block scope?", "The scope created by a block. let and const declared inside are only accessible within those braces."],
      ["Is var block scoped?", "No. var is function scoped (or global), so a var declared in a block is accessible outside the block within the same function."],
    ],
    exercise:
      "Without running it: `if (true) { let x = 1; var y = 2; } console.log(typeof x, typeof y);`.",
    answer:
      "`undefined number`. `x` was block scoped and no longer exists, so `typeof x` gives \"undefined\" without throwing. `y` is a var hoisted outside the block.",
  }),

  "nj-scope--shadowing-and-illegal-shadowing": njs({
    intro:
      "Shadowing happens when a variable declared in an inner scope has the same name as one in an outer scope. Inside the inner scope, the inner variable hides the outer one. With `let` and `const` the outer value is untouched. With `var` the 'inner' variable is often the same global or function variable, so 'shadowing' actually overwrites it. Some combinations are illegal and are rejected as SyntaxErrors.",
    concepts: [
      "Shadowing with `let`/`const`: the block gets its own binding, the outer binding keeps its value after the block.",
      "Shadowing a `var` with `var` in a block: both names refer to the same variable in the function/global scope, so the block reassigns it.",
      "Illegal shadowing: a `var` in a block cannot shadow a `let` from an outer block in the same function, because `var` would escape the block and clash with the `let`. Shadowing `var` with `let` is fine.",
    ],
    snapshot: {
      title: "Three shadowing outcomes",
      panes: [
        ["let inside block", ["outer b : 100", "*block b : 20", "after → 100"]],
        ["var inside block", ["same a !", "*a = 10 overwrites", "after → 10"]],
        ["Illegal", ["let a; { var a; }", "SyntaxError", "let a; { let a; } ok"]],
      ],
      caption: "let/const shadowing is isolated. var shadowing shares the variable. var crossing a let boundary is a SyntaxError.",
    },
    animation: {
      title: "Which binding does the name refer to?",
      nodes: [
        ["outer", "Outer scope", "a=100, b=100"],
        ["blk", "Block", "let b, var a"],
        ["after", "After block", "read a, b"],
        ["bad", "SyntaxError", "illegal shadow"],
      ],
      steps: [
        ["blk", "blk", "let b=20", "let b creates a new block-scoped b; the outer b is hidden but intact."],
        ["blk", "outer", "var a=10", "var a resolves to the outer var a, so the assignment overwrites it."],
        ["after", "outer", "a=10 b=100", "After the block, a shows the overwrite and b shows the untouched outer value."],
        ["blk", "bad", "var vs let", "A var in a block that crosses an outer let with the same name is rejected at parse time."],
      ],
    },
    code: `var a = 100;
let b = 100;
const c = 100;
{
  var a = 10;   // same variable as the outer a
  let b = 20;   // new block-scoped b
  const c = 30; // new block-scoped c
  console.log("inside:", a, b, c);
}
console.log("after:", a, b, c);

// Functions shadow the same way:
const d = "outer";
function show() { const d = "inner"; return d; }
console.log(show(), d);

// Illegal shadowing is a SyntaxError (parsed at runtime here to show it):
for (const src of ["let x = 1; { var x = 2; }", "let x = 1; { let x = 2; }", "var x = 1; { let x = 2; }"]) {
  try { new Function(src); console.log("ok      :", src); }
  catch (e) { console.log("illegal :", src, "→", e.name); }
}`,
    walkthrough:
      "Inside the block we see 10, 20, 30. After it, `a` is 10 because the block's `var a` was the same variable, while `b` and `c` are back to 100. The function shows normal shadowing. Of the three snippets, only `var` inside a block below an outer `let` is illegal; `let` over `let` and `let` over `var` are fine.",
    deepDive: [
      {
        heading: "Why var-over-let is illegal",
        paragraphs: [
          "`var` is hoisted to the function or global scope. In `let x; { var x; }` the var would land in the same scope as the outer `let x`, which is a duplicate declaration. A function boundary stops var from escaping, so `let x; function f() { var x; }` is legal.",
        ],
      },
      {
        heading: "Arrow functions and shadowing",
        paragraphs: [
          "Arrow functions and regular functions follow the same lexical scoping rules. A `const` inside an arrow body shadows an outer name exactly like it would in a block.",
        ],
        code: `const x = 1;
const f = () => { const x = 2; return x; };
console.log(f(), x); // 2 1`,
      },
    ],
    mistakes: [
      "Expecting `var` inside a block to protect the outer variable. It overwrites it.",
      "Shadowing so heavily that readers cannot tell which binding a name refers to; rename instead.",
    ],
    interview: [
      ["What is shadowing?", "Declaring a variable in an inner scope with the same name as an outer one, so the inner declaration hides the outer within that scope."],
      ["What is illegal shadowing?", "Shadowing a let/const with var inside a block of the same function. The var would be hoisted into the scope that already has the let, so the parser throws a SyntaxError."],
      ["Can let shadow var?", "Yes. let inside a block creates a separate block binding, which is legal and leaves the outer var unchanged."],
    ],
    exercise:
      "Is `let a = 20; function x() { var a = 10; }` legal? Why?",
    answer:
      "Yes. The function body is its own function scope, so `var a` stays inside `x` and never collides with the outer `let a`.",
  }),

  "nj-scope--closures": njs({
    intro:
      "A closure is a function bundled together with its lexical environment. When a function is returned from (or passed out of) another function, it still remembers the variables of the scope where it was written, even after that outer function has finished executing. It does not keep a copy of the values; it keeps a reference to the variables themselves.",
    concepts: [
      "Functions are values in JavaScript: they can be assigned, passed as arguments and returned. Whatever function leaves a scope carries its lexical scope with it.",
      "After `x()` returns, its execution context is popped, but the variable environment that `y` references stays alive because `y` still needs it. That surviving environment is the closure.",
      "Closures capture references, not snapshots. If the captured variable changes before the inner function runs, the inner function sees the new value.",
    ],
    snapshot: {
      title: "After x() returned",
      panes: [
        ["Call stack", ["Global EC", "(x() popped)"]],
        ["Heap", ["*closure of x", "a : 100 (was 7)", "y : ƒ → closure"]],
        ["Global memory", ["z : ƒ y", "→ points into heap"]],
      ],
      caption: "x's context is gone, but the environment holding a survives on the heap because the returned function y references it.",
    },
    animation: {
      title: "A function that remembers",
      nodes: [
        ["x", "x() runs", "a = 7"],
        ["y", "y defined", "inside x"],
        ["ret", "return y", "x popped"],
        ["z", "z()", "called later"],
        ["env", "Closure env", "a = 100"],
      ],
      steps: [
        ["x", "y", "define", "y is written inside x, so its lexical parent is x's environment."],
        ["y", "y", "a = 100", "Before returning, x changes a to 100; y references the variable, not a copy."],
        ["y", "ret", "return", "x returns y and its execution context is popped off the stack."],
        ["ret", "z", "store", "The global variable z now holds y together with its environment."],
        ["z", "env", "read a", "Calling z() reads a through the closure and finds 100."],
      ],
    },
    code: `function x() {
  var a = 7;
  function y() {
    console.log("a is", a);   // a comes from x's lexical environment
  }
  a = 100;                    // changed before y ever runs
  return y;                   // return the function together with its scope
}

const z = x();                // x has finished; its context is gone
console.log(typeof z);
z();                          // ...but y still remembers a

// Closures across several levels:
function outer() {
  const b = 900;
  return function middle() {
    const c = 1;
    return function inner() { return b + c; };
  };
}
console.log(outer()()());`,
    walkthrough:
      "`x()` returns `y` and finishes. `z` holds a function, and calling it prints 100, not 7: the closure references the variable `a`, which was updated before `return`. The second example shows that an inner function can close over every enclosing level, here `b` from `outer` and `c` from `middle`.",
    deepDive: [
      {
        heading: "Formal definition",
        paragraphs: [
          "A closure is the combination of a function and the lexical environment within which that function was declared. Every function in JavaScript forms a closure; it only becomes noticeable when the function outlives its parent scope.",
        ],
      },
      {
        heading: "Closures in the debugger",
        paragraphs: [
          "Set a breakpoint inside `y`. The Scope panel shows `Closure (x)` with `a: 100`. That entry is the preserved environment.",
        ],
      },
      {
        heading: "Returning a function directly",
        code: `function makeGreeter(greeting) {
  return function (name) {
    return greeting + ", " + name;
  };
}
const hi = makeGreeter("Namaste");
hi("JavaScript"); // "Namaste, JavaScript"`,
        paragraphs: ["Parameters are part of the environment too, so `greeting` is captured just like a local variable."],
      },
    ],
    mistakes: [
      "Thinking a closure stores the value at definition time. It stores a live reference to the variable.",
      "Assuming a finished function's variables are always garbage-collected. They stay alive while any closure references them.",
    ],
    interview: [
      ["What is a closure?", "A function together with references to its surrounding lexical environment. It lets the function access outer variables even after the outer function has returned."],
      ["Does a closure capture values or variables?", "Variables (references). If the variable changes later, the closure sees the new value."],
      ["Give a simple example of a closure.", "A function `counter()` that declares `let count = 0` and returns `() => ++count`. Each call of the returned function increments the same captured count."],
    ],
    exercise:
      "Write `makeAdder(n)` that returns a function adding `n` to its argument. What do `makeAdder(5)(10)` and `makeAdder(-1)(10)` return?",
    answer:
      "`function makeAdder(n) { return (x) => x + n; }`. They return 15 and 9; each returned function closes over its own `n`.",
  }),

  "nj-scope--uses-of-closures": njs({
    intro:
      "Closures are not just an interview topic; they power everyday patterns. The module pattern hides private state, currying and partial application pre-fill arguments, `memoize` caches results, `once` runs a function a single time, and debounce and throttle remember timers between calls. Every one of them works by keeping a variable alive in a closure.",
    concepts: [
      "Module pattern and data hiding: variables in the outer function are private; only the returned functions can read or change them.",
      "Function factories: currying, partial application and `once` return new functions that remember configuration or state from the call that created them.",
      "Stateful helpers: memoize keeps a cache, debounce and throttle keep a timer id, iterators keep a position. setTimeout callbacks also rely on closures to see their variables later.",
    ],
    snapshot: {
      title: "Closures inside memoize and once",
      panes: [
        ["memoize(slowSquare)", ["*cache : Map", "  4 → 16", "  9 → 81", "fn : slowSquare"]],
        ["once(init)", ["*called : true", "result : 'ready'", "fn : init"]],
        ["Caller sees", ["square(4) → 16 (cached)", "setup() → 'ready'", "setup() → 'ready'"]],
      ],
      caption: "The cache and the called flag are invisible to callers but survive across calls because the returned functions close over them.",
    },
    animation: {
      title: "memoize: a cache that lives in a closure",
      nodes: [
        ["call", "square(4)", "caller"],
        ["cache", "cache", "closure Map"],
        ["fn", "slowSquare", "real work"],
        ["out", "Result", "16"],
      ],
      steps: [
        ["call", "cache", "4?", "The memoized wrapper first checks the cache it closes over."],
        ["cache", "fn", "miss", "On the first call the cache has no entry, so the real function runs."],
        ["fn", "cache", "store 16", "The result is stored in the closure's Map."],
        ["cache", "out", "16", "The value is returned to the caller."],
        ["call", "out", "hit", "The second square(4) is answered straight from the cache."],
      ],
    },
    code: `// 1. Module pattern: private state
function createWallet() {
  let balance = 0;                        // private
  return {
    deposit(amount) { balance += amount; return balance; },
    get balance() { return balance; },
  };
}
const wallet = createWallet();
wallet.deposit(50);
console.log("balance:", wallet.balance, "| direct access:", wallet.balanceValue);

// 2. Currying
const multiply = (a) => (b) => a * b;
const double = multiply(2);
console.log("double(21):", double(21));

// 3. memoize
function memoize(fn) {
  const cache = new Map();
  let computed = 0;
  const wrapped = (n) => {
    if (!cache.has(n)) { computed++; cache.set(n, fn(n)); }
    return cache.get(n);
  };
  wrapped.stats = () => ({ computed, cached: cache.size });
  return wrapped;
}
const square = memoize((n) => n * n);
console.log(square(4), square(4), square(9), square.stats());

// 4. once
function once(fn) {
  let called = false, result;
  return (...args) => (called ? result : ((called = true), (result = fn(...args))));
}
const init = once(() => { console.log("initialising..."); return "ready"; });
console.log(init(), init());`,
    walkthrough:
      "The wallet's `balance` can only change through `deposit`; there is no property to tamper with. `double` remembers `a = 2`. `square` computes 4 and 9 once each and serves the repeated 4 from its cache, as the stats show. `init` runs its body a single time and returns the remembered result on every later call.",
    deepDive: [
      {
        heading: "Debounce and throttle",
        paragraphs: [
          "Both store a timer or a timestamp in a closure. Debounce resets the timer on every call and only fires after a quiet period (search-as-you-type). Throttle lets one call through per interval (scroll and resize handlers).",
        ],
        code: `function debounce(fn, ms) {
  let timer;                       // remembered between calls
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
      },
      {
        heading: "Iterators and generators",
        paragraphs: [
          "A hand-written iterator keeps its current index in a closure, so each `next()` continues where the previous call stopped.",
        ],
        code: `function counterIterator(limit) {
  let i = 0;
  return { next: () => (i < limit ? { value: i++, done: false } : { done: true }) };
}`,
      },
      {
        heading: "Where you already use closures",
        points: [
          "Event handlers that read component state.",
          "React hooks: every render's handlers close over that render's props and state.",
          "Callbacks given to `setTimeout`, `fetch().then`, `addEventListener`.",
        ],
      },
    ],
    mistakes: [
      "Memoizing functions whose results depend on something other than their arguments, which returns stale results.",
      "Letting memoize caches grow forever; bound them (LRU) or key them carefully.",
    ],
    interview: [
      ["Name practical uses of closures.", "Module pattern and data privacy, currying/partial application, memoize, once, debounce and throttle, iterators, and preserving state in callbacks such as setTimeout and event listeners."],
      ["How does the module pattern achieve privacy?", "Variables live in a function's scope and are not returned; only the returned functions close over them, so outside code can use them only through that public API."],
      ["Implement `once`.", "Keep `called` and `result` in a closure. On the first call run the function and store the result; on later calls return the stored result without running it again."],
    ],
    exercise:
      "Write `createCounter()` returning `{ increment, decrement, value }` where `count` cannot be changed any other way.",
    answer:
      "`function createCounter() { let count = 0; return { increment: () => ++count, decrement: () => --count, value: () => count }; }`. `count` is only reachable through the three closures.",
  }),

  "nj-scope--settimeout-and-closures-in-a-loop": njs({
    intro:
      "This is the most famous closure interview question: print 1, 2, 3, 4, 5 one second apart using `setTimeout` inside a `for` loop. With `var` it prints 6 five times, because every callback closes over the same `i`, and by the time the timers fire the loop has already finished. Fixing it with `let`, or with a function that creates a fresh scope per iteration, shows exactly how closures capture variables.",
    concepts: [
      "`setTimeout` does not wait. It registers the callback with the timer and the loop continues immediately. The callbacks run later, after the stack is empty.",
      "With `var i`, there is one `i` for the whole function. All five callbacks reference the same variable, which is 6 when they run.",
      "`let i` creates a new binding for each loop iteration, so each callback closes over its own copy. Without `let`, wrap the body in a function and pass `i` as a parameter to get a new scope per iteration.",
    ],
    snapshot: {
      title: "What each callback closes over",
      panes: [
        ["var i (one binding)", ["cb1 → i", "cb2 → i", "cb3 → i", "*i = 4 at run time", "prints 4 4 4"]],
        ["let i (per iteration)", ["cb1 → i₁ = 1", "cb2 → i₂ = 2", "cb3 → i₃ = 3", "*fresh each loop", "prints 1 2 3"]],
      ],
      caption: "Same loop, same timers. The only difference is how many bindings of i exist for the callbacks to reference.",
    },
    animation: {
      title: "Why var prints the final value",
      nodes: [
        ["loop", "for loop", "runs instantly"],
        ["timer", "Timer API", "5 callbacks"],
        ["i", "var i", "one binding"],
        ["queue", "Callback queue", "after delay"],
        ["log", "console", "output"],
      ],
      steps: [
        ["loop", "timer", "register", "Each iteration hands a callback to the timer and moves on without waiting."],
        ["loop", "i", "i = 6", "The loop finishes almost instantly, leaving the single var i at 6."],
        ["timer", "queue", "expire", "When each delay expires the callback is queued for the event loop."],
        ["queue", "i", "read i", "Every callback reads the same i, which is now 6."],
        ["i", "log", "6", "So var prints 6 five times; let would give each callback its own i."],
      ],
    },
    code: `const results = { var: [], let: [], closure: [] };

for (var i = 1; i <= 3; i++) {
  setTimeout(() => results.var.push(i), i * 10);
}

for (let j = 1; j <= 3; j++) {
  setTimeout(() => results.let.push(j), j * 10);
}

for (var k = 1; k <= 3; k++) {
  (function (copy) {                     // new scope per iteration
    setTimeout(() => results.closure.push(copy), copy * 10);
  })(k);
}

console.log("loops finished, nothing printed yet");
setTimeout(() => {
  console.log("var    :", results.var);
  console.log("let    :", results.let);
  console.log("closure:", results.closure);
}, 100);`,
    walkthrough:
      "All three loops finish before a single timer fires, which is why the first log comes first. The `var` callbacks all read the one shared `i`, which ended at 4. The `let` callbacks each captured their own `j`. The IIFE version passes `k` into a new function scope as `copy`, giving each callback its own variable without `let`.",
    deepDive: [
      {
        heading: "The classic 1-second version",
        code: `for (let i = 1; i <= 5; i++) {
  setTimeout(() => console.log(i), i * 1000);
}
// 1 (after 1s), 2 (after 2s), ... 5 (after 5s)`,
        paragraphs: ["Multiplying the delay by `i` spaces the output one second apart; using a constant 1000 would print all five after one second."],
      },
      {
        heading: "Fix without let or IIFE",
        paragraphs: ["`setTimeout` passes extra arguments to the callback, which also creates a per-call value."],
        code: `for (var i = 1; i <= 5; i++) {
  setTimeout((n) => console.log(n), i * 1000, i);
}`,
      },
      {
        heading: "Why the loop never 'waits'",
        paragraphs: [
          "JavaScript cannot pause the call stack for a timer. The timer lives in the browser or Node runtime. Only when the stack is empty does the event loop push each expired callback, by which time the loop has long finished.",
        ],
      },
    ],
    mistakes: [
      "Expecting `setTimeout` to pause the loop.",
      "Fixing the output but using the same delay for every iteration, so everything prints at once.",
      "Forgetting that `let` in `for` creates a binding per iteration only for the loop header variable, not for variables declared outside the loop.",
    ],
    interview: [
      ["Why does `for (var i=1;i<=5;i++) setTimeout(()=>console.log(i), i*1000)` print 6 five times?", "There is a single function-scoped i. The callbacks close over that variable, and by the time they run the loop has finished and i is 6."],
      ["How do you fix it?", "Use `let i` (new binding per iteration), or wrap the timer in a function/IIFE that takes i as a parameter, or pass i as the third argument of setTimeout."],
      ["Why is the IIFE fix a closure solution?", "Each IIFE call creates a new scope with its own parameter; the callback closes over that parameter, which is never reassigned."],
    ],
    exercise:
      "Using `var` only, print 1 to 5 one second apart by writing a named helper `function schedule(x) {...}`.",
    answer:
      "`for (var i = 1; i <= 5; i++) { schedule(i); } function schedule(x) { setTimeout(() => console.log(x), x * 1000); }` — each call to `schedule` has its own `x`.",
  }),

  "nj-scope--closures-interview-deep-dive": njs({
    intro:
      "Interviewers rarely stop at 'what is a closure?'. They follow up: does a closure capture variables from every outer level? What if a `let` is declared after the inner function? What if a parameter has the same name as a global? This lesson walks those follow-ups with code you can run, so the answers come from the mechanism instead of memory.",
    concepts: [
      "An inner function closes over every enclosing scope it references: its parent, the parent's parameters, the grandparent, and so on up to the global scope.",
      "It is the variable that is captured, so declaration order inside the outer function does not matter as long as the variable is initialised before the inner function runs.",
      "Name conflicts resolve through the scope chain: the nearest binding wins. A parameter or local named like a global shadows the global inside the closure.",
    ],
    snapshot: {
      title: "What inner() can see",
      panes: [
        ["inner()", ["*(uses a, b, c)", "→ outer()"]],
        ["outer(b)", ["a: 10 (let)", "b : 'param'", "→ outest()"]],
        ["outest()", ["c : 20", "→ global"]],
        ["Global", ["a : 'global a'", "→ null"]],
      ],
      caption: "inner closes over a and b from outer and c from outest. The global a is shadowed by outer's a.",
    },
    animation: {
      title: "Resolving names in a three-level closure",
      nodes: [
        ["in", "inner()", "called later"],
        ["o", "outer(b)", "a, b"],
        ["oo", "outest()", "c"],
        ["g", "Global", "a (hidden)"],
      ],
      steps: [
        ["in", "o", "a, b", "a and b are found in outer's environment, including the parameter b."],
        ["in", "oo", "c", "c is not in outer, so the search continues to outest."],
        ["o", "g", "shadowed", "The global a is never reached because outer already has an a."],
        ["oo", "in", "values", "inner returns values from all levels even though both outer functions have returned."],
      ],
    },
    code: `var a = "global a";

function outest() {
  var c = 20;
  function outer(b) {
    function inner() {
      return [a, b, c];          // a declared below, still works
    }
    let a = 10;                  // initialised before inner() is called
    return inner;
  }
  return outer;
}

const close = outest()("param");
console.log(close());

// Follow-up: each call of the outer function makes a separate closure.
function counter() {
  let count = 0;
  return () => ++count;
}
const c1 = counter();
const c2 = counter();
c1(); c1();
console.log("c1:", c1(), "c2:", c2());`,
    walkthrough:
      "`close` is `inner`, created by `outest()` then `outer(\"param\")`. It returns `[10, 'param', 20]`: `a` is outer's `let` (shadowing the global), `b` is the parameter and `c` comes from `outest`. `c1` and `c2` come from separate calls of `counter`, so each has its own `count`.",
    deepDive: [
      {
        heading: "Follow-up questions and short answers",
        points: [
          "Does the inner function need to be returned? No; any function that outlives its parent (stored, passed as a callback) forms a closure.",
          "Is a parameter captured? Yes, parameters are part of the function's environment.",
          "If `let a` were declared after `return inner`, the closure would throw a ReferenceError (TDZ) when it reads `a`.",
          "Two calls of the outer function produce two independent closures.",
        ],
      },
      {
        heading: "Advantages and disadvantages",
        points: [
          "Advantages: data hiding and encapsulation, module pattern, currying, memoize, once, keeping state in callbacks.",
          "Disadvantages: variables kept alive longer than expected, which can increase memory use or leak memory if closures are held forever (e.g. listeners never removed).",
        ],
      },
    ],
    mistakes: [
      "Believing only the immediate parent scope is captured.",
      "Expecting two closures from the same factory to share state.",
    ],
    interview: [
      ["Does a closure capture variables from the grandparent scope?", "Yes. It can access every variable reachable through its scope chain, including grandparent and global scopes."],
      ["What if the outer function has a let declared after the inner function?", "That is fine as long as the let is initialised before the inner function runs. Reading it before initialisation would throw a TDZ ReferenceError."],
      ["What are the disadvantages of closures?", "They retain memory: captured variables cannot be garbage-collected while the closure is reachable, which can cause leaks if closures are kept around unnecessarily."],
    ],
    exercise:
      "Change `const c2 = counter();` to `const c2 = c1;`. What does the final log print?",
    answer:
      "`c1: 3 c2: 4`. Both names refer to the same closure, so they share one `count`: c1 makes it 1, 2, 3, then c2 increments to 4.",
  }),

  "nj-scope--data-privacy-and-constructor-functions": njs({
    intro:
      "Closures give JavaScript private variables without any special syntax. A function can keep `count` in its scope and return only the operations that may touch it. The same works with a constructor function: methods defined inside the constructor with `this.increment = function () {...}` close over local variables that cannot be reached from outside. Modern classes add `#private` fields for the same goal.",
    concepts: [
      "Data privacy (encapsulation): if a variable is only referenced by inner functions, outside code has no way to read or modify it except through those functions.",
      "Constructor functions: called with `new`, they create an object; methods assigned in the constructor close over the constructor's local variables, giving each instance its own private state.",
      "Classes with `#field` provide language-level privacy. Closure privacy still matters in factory functions, modules and code that should not depend on `this`.",
    ],
    snapshot: {
      title: "Two counters, two private scopes",
      panes: [
        ["counter1 scope", ["*count : 2", "increment ƒ", "decrement ƒ"]],
        ["counter2 scope", ["*count : 1", "increment ƒ", "decrement ƒ"]],
        ["Outside", ["counter1.count", "→ undefined", "no other access"]],
      ],
      caption: "Each new Counter() call created a separate count. The methods are the only way in.",
    },
    animation: {
      title: "Encapsulation with a constructor",
      nodes: [
        ["new", "new Counter()", "constructor call"],
        ["scope", "Private scope", "count = 0"],
        ["obj", "Instance", "methods only"],
        ["user", "Caller", "outside code"],
      ],
      steps: [
        ["new", "scope", "count", "Each new call creates a fresh scope with its own count."],
        ["scope", "obj", "methods", "increment and decrement are attached to the instance and close over count."],
        ["user", "obj", "increment()", "Outside code calls the methods, which update the private count."],
        ["user", "scope", "denied", "Reading counter.count gives undefined: the variable is not a property."],
      ],
    },
    code: `function Counter() {
  var count = 0;                    // private to this instance
  this.increment = function () { count++; return count; };
  this.decrement = function () { count--; return count; };
}

const counter1 = new Counter();
counter1.increment();
console.log("counter1:", counter1.increment());

const counter2 = new Counter();
console.log("counter2:", counter2.increment());
console.log("counter1.count is", counter1.count);

// The same idea with class private fields:
class Account {
  #balance = 0;
  deposit(n) { this.#balance += n; return this.#balance; }
}
const acc = new Account();
console.log("account:", acc.deposit(25), "| keys:", Object.keys(acc));`,
    walkthrough:
      "`counter1` increments twice and reports 2. `counter2` has its own scope, so its first increment gives 1. `counter1.count` is `undefined` because `count` is a variable, not a property. The class version keeps `#balance` truly private: it does not even show up in `Object.keys`.",
    deepDive: [
      {
        heading: "Evolving a naive counter",
        points: [
          "Global `var count` → any code can change it.",
          "Wrap it in `function counter() { var count = 0; return function inc() {...}; }` → private, one counter per call.",
          "Return an object or use a constructor to expose several operations (increment, decrement) on the same private state.",
        ],
      },
      {
        heading: "Trade-off: methods per instance",
        paragraphs: [
          "Methods defined in the constructor are new function objects for every instance. Methods on the prototype are shared but cannot see constructor locals. That is the price of closure-based privacy; for many small objects, `#private` fields on a class avoid it.",
        ],
      },
    ],
    mistakes: [
      "Calling a constructor function without `new`, which in sloppy mode attaches methods to the global object.",
      "Putting the private variable on `this` (e.g. `this.count`), which makes it public again.",
    ],
    interview: [
      ["How do closures provide data privacy?", "Variables declared in a function scope are inaccessible from outside; returning only inner functions that reference them lets callers use but not directly access the data."],
      ["Write a counter using a constructor function with private state.", "`function Counter() { let count = 0; this.increment = () => ++count; this.decrement = () => --count; }` — `count` is only reachable through the methods."],
      ["How do #private fields differ from closure privacy?", "They are part of the class syntax, enforced by the engine, and shared methods on the prototype can access them; closure privacy requires per-instance functions defined in the constructor scope."],
    ],
    exercise:
      "Add a `reset()` method to `Counter` and make `increment` refuse to go above 10.",
    answer:
      "Inside the constructor: `this.reset = () => (count = 0);` and `this.increment = () => (count < 10 ? ++count : count);`. Both still close over the same private `count`.",
  }),

  "nj-scope--closures-and-garbage-collection": njs({
    intro:
      "A garbage collector frees memory that is no longer reachable. Closures keep their captured variables reachable, so those variables cannot be collected while the closure exists. Modern engines like V8 are smart about it: they only keep the variables a closure actually references, and drop the rest. Understanding this explains both closure 'memory leaks' and why they are rarer than people fear.",
    concepts: [
      "JavaScript is garbage-collected: memory is reclaimed automatically when values become unreachable from the roots (global object, current call stack).",
      "A closure is reachable as long as some variable, listener, timer or cache references it. Everything it captured stays alive with it.",
      "Smart collection: if an outer function has `a` and `z` but the inner function uses only `a`, engines can free `z` when the outer function returns. That is why `z` often shows as not available in the debugger.",
    ],
    snapshot: {
      title: "What survives after a() returns",
      panes: [
        ["Reachable", ["*y (closure) → x", "x : big array", "handler → listener"]],
        ["Collected", ["z : unused", "(a's context)"]],
        ["How to release", ["y = null", "removeEventListener", "clearInterval"]],
      ],
      caption: "Only what the closure references is retained. Dropping the last reference to the closure makes its captured data collectable too.",
    },
    animation: {
      title: "Reachability decides lifetime",
      nodes: [
        ["root", "Roots", "global, stack"],
        ["clo", "Closure y", "kept in a var"],
        ["x", "x", "used by y"],
        ["z", "z", "unused"],
        ["gc", "GC", "frees memory"],
      ],
      steps: [
        ["root", "clo", "reference", "A global variable references the closure, so it is reachable."],
        ["clo", "x", "captures", "The closure uses x, which keeps x alive as well."],
        ["z", "gc", "free", "z was never referenced by the closure, so the engine can free it when a returns."],
        ["root", "clo", "set null", "Setting the variable to null removes the last reference to the closure."],
        ["x", "gc", "free", "Now the closure and x are unreachable and the collector reclaims them."],
      ],
    },
    code: `function a() {
  const x = new Array(5).fill("data");   // referenced by the closure
  const z = "unused";                    // never referenced: can be freed
  return function y() {
    return x.length;
  };
}

let keep = a();
console.log("closure still works:", keep());

// A registry that holds closures keeps their data alive until removed.
const listeners = new Set();
function subscribe(id) {
  const payload = { id, buffer: new Array(1000).fill(id) };
  const listener = () => payload.id;
  listeners.add(listener);
  return () => listeners.delete(listener);   // the way to release it
}
const unsubscribe = [1, 2, 3].map(subscribe);
console.log("live listeners:", listeners.size);
unsubscribe.forEach((release) => release());
console.log("after release:", listeners.size);
keep = null;   // the closure (and x) are now unreachable`,
    walkthrough:
      "`keep` holds the closure, so `x` stays alive and `keep()` reports 5. `z` is not referenced and can be collected as soon as `a` returns. The registry holds three listeners whose closures each keep a 1000-item buffer alive; calling the returned release functions removes them, and setting `keep` to null drops the first closure.",
    deepDive: [
      {
        heading: "Common closure leaks",
        points: [
          "Event listeners added in a component and never removed.",
          "`setInterval` callbacks that are never cleared.",
          "Global caches (memoize) that grow forever.",
          "Long-lived closures that accidentally capture a huge object they only need one field of: copy the field into a local instead.",
        ],
      },
      {
        heading: "Mark and sweep in one paragraph",
        paragraphs: [
          "The collector starts from the roots, marks every object it can reach by following references (including closure environments), then sweeps away everything unmarked. Reference cycles are not a problem: an unreachable cycle is simply never marked.",
        ],
      },
    ],
    mistakes: [
      "Blaming closures for every memory issue; the real problem is keeping closures reachable longer than needed.",
      "Forgetting cleanup functions in effects, subscriptions and timers.",
    ],
    interview: [
      ["How are closures related to garbage collection?", "Captured variables remain reachable while the closure is reachable, so they cannot be collected. When the closure becomes unreachable, its environment can be freed."],
      ["What is smart garbage collection in V8 for closures?", "V8 analyses which outer variables an inner function actually uses and only retains those in the closure context; unused ones can be freed when the outer function returns."],
      ["How can closures cause memory leaks?", "By staying referenced forever, for example via event listeners or intervals that are never removed, keeping all their captured data alive."],
    ],
    exercise:
      "A click handler closes over a 10 MB `report` object but only uses `report.title`. How would you reduce what it retains?",
    answer:
      "Extract what you need before creating the handler: `const title = report.title; button.onclick = () => show(title);`. The closure then captures only the string, and `report` can be collected (if nothing else references it). Also remove the listener when it is no longer needed.",
  }),
};
