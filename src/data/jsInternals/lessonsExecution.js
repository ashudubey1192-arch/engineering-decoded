// execution context, call stack, hoisting, functions, global object.
import { njs } from "./schema.js";

export const executionLessons = {
  "nj-execution--how-javascript-works-and-execution-context": njs({
    intro:
      "Everything in JavaScript happens inside an execution context. Think of it as a box the engine builds before running any code: one side (the memory component, or variable environment) stores variables and functions as key-value pairs, and the other side (the code component, or thread of execution) runs the code one line at a time. Because there is one thread of execution, JavaScript is a synchronous, single-threaded language: it finishes one line before it starts the next.",
    concepts: [
      "An execution context has two components. The memory component holds every variable and function declaration the engine found while scanning the code. The code component is where statements actually run, in order, using the values stored in memory.",
      "Single-threaded means there is one call stack and one thread of execution per context. JavaScript cannot run two lines of the same program at the same moment; asynchronous behaviour comes from the runtime around the engine (timers, network, the event loop), not from extra threads inside the language.",
      "Synchronous means 'in a specific order'. Line 2 never starts before line 1 has finished. This is why a long loop blocks everything else on the page, and why understanding the execution context explains almost every 'weird' JavaScript behaviour.",
    ],
    snapshot: {
      title: "Global execution context before line 1 runs",
      panes: [
        ["Memory component", ["n : undefined", "square : ƒ square(num) {…}", "result : undefined"]],
        ["Code component", ["*1 var n = 2", "2 function square(num)…", "3 var result = square(n)", "4 console.log(result)"]],
      ],
      caption:
        "The engine has already scanned the program: variables are reserved with undefined and the function is stored whole. Execution has not started yet.",
    },
    animation: {
      title: "One execution context, two components",
      nodes: [
        ["src", "Source code", "app.js"],
        ["mem", "Memory", "variable environment"],
        ["code", "Code", "thread of execution"],
        ["out", "Console", "result"],
      ],
      steps: [
        ["src", "mem", "scan", "Before running, the engine scans the code and reserves n, square and result in memory."],
        ["mem", "code", "line 1", "The thread of execution starts at line 1 and replaces undefined with 2."],
        ["code", "mem", "lookup", "Calling square(n) reads n from memory and creates a new context for the function."],
        ["code", "out", "4", "The returned 4 is stored in result and printed; then the global context is removed."],
      ],
    },
    code: `// One global execution context runs this whole file, line by line.
var n = 2;

function square(num) {
  // Each call gets its own execution context with its own memory.
  var answer = num * num;
  return answer;
}

var result = square(n);
console.log("n is", n);
console.log("result is", result);
console.log("typeof square is", typeof square);`,
    walkthrough:
      "Before line 1 runs, memory already contains `n` and `result` as undefined and `square` as the full function. Line 1 stores 2. The call `square(n)` builds a brand-new execution context whose memory holds `num` and `answer`; it returns 4, its context is thrown away, and 4 lands in `result`. Each line waits for the previous one, which is exactly what 'synchronous, single-threaded' means.",
    deepDive: [
      {
        heading: "Memory component vs code component",
        paragraphs: [
          "The memory component is also called the variable environment. It is filled in during the creation phase, before any statement executes. The code component (thread of execution) walks through the program afterwards and updates memory as assignments happen.",
        ],
        points: [
          "Variables declared with `var` start as `undefined`.",
          "Function declarations are copied into memory in full, so they can be called before their line.",
          "`let` and `const` are reserved too, but stay uninitialised until their line (the temporal dead zone).",
        ],
      },
      {
        heading: "Why 'single-threaded' does not mean 'slow'",
        paragraphs: [
          "One thread keeps the language simple: no locks, no data races on your variables. Long waits such as network calls are handed to the browser or Node.js runtime, which runs them elsewhere and hands a callback back later. The engine only ever runs your JavaScript one piece at a time.",
        ],
      },
      {
        heading: "Where execution contexts come from",
        points: [
          "Global execution context: created once when the script starts.",
          "Function execution context: created on every function call, destroyed when it returns.",
          "Eval and module contexts exist too, but the same two-component model explains them.",
        ],
      },
    ],
    mistakes: [
      "Thinking JavaScript reads a line and only then discovers the next variable. The whole scope is scanned first, which is why hoisting exists.",
      "Believing `setTimeout` or `fetch` create new JavaScript threads. They are runtime features; your callbacks still run on the single main thread.",
      "Confusing the execution context with scope. The context is the runtime box for one call; scope is the lexical rule that decides which names a piece of code can see.",
    ],
    interview: [
      ["Is JavaScript synchronous or asynchronous?", "The language itself is synchronous and single-threaded: one call stack, one line at a time. Asynchronous behaviour comes from the host runtime (Web APIs or Node.js) plus the event loop, which schedules callbacks back onto that same single thread."],
      ["What are the two components of an execution context?", "The memory component (variable environment) that stores variables and functions as key-value pairs, and the code component (thread of execution) that runs statements in order."],
      ["What happens to a function's execution context when it returns?", "It is popped off the call stack and its memory becomes unreachable, unless something such as a closure still references part of it, in which case only the referenced environment is kept alive."],
    ],
    exercise:
      "Without running it, write down what is in memory and what has executed after line 3 of the example. Then predict what `console.log(result)` would print if you moved it above `var result = square(n)`.",
    answer:
      "After line 3, `n` is 2, `square` is the function and `result` is still undefined because its assignment has not run. Logging `result` before its assignment prints `undefined`, not an error, because `var` reserved it with undefined during the memory phase.",
  }),

  "nj-execution--memory-and-code-execution-phases": njs({
    intro:
      "When you run a JavaScript program the engine creates the global execution context in two phases. Phase 1, memory creation, scans the code and allocates memory for every variable and function. Phase 2, code execution, runs the code line by line and fills in real values. Every function call repeats the same two phases for its own new context. Seeing both phases clearly is the key to hoisting, closures and the call stack.",
    concepts: [
      "Memory creation phase: the engine walks the whole scope and sets every `var` to the placeholder `undefined`, stores every function declaration in full, and records `let`/`const` bindings as uninitialised.",
      "Code execution phase: statements run top to bottom. Assignments overwrite placeholders, and every function invocation pauses the current context to create a new one with its own two phases.",
      "When a function hits `return` (or its last line), control goes back to where it was called, the returned value is used there, and the function's execution context is deleted.",
    ],
    snapshot: {
      title: "Inside square(2): its own two-phase context",
      panes: [
        ["Global memory", ["n : 2", "square : ƒ", "square2 : undefined", "square4 : undefined"]],
        ["square(n) memory", ["*num : 2", "ans : undefined → 4"]],
        ["Call stack", ["*square(n)", "Global EC"]],
      ],
      caption:
        "The global context is paused on `var square2 = square(n)`. The function context ran its memory phase (ans: undefined) and is now executing.",
    },
    animation: {
      title: "Two phases, repeated for every call",
      nodes: [
        ["p1", "Memory phase", "allocate names"],
        ["p2", "Execute phase", "assign + call"],
        ["fn", "Function EC", "its own 2 phases"],
        ["ret", "return", "value back"],
        ["gone", "EC deleted", "popped"],
      ],
      steps: [
        ["p1", "p2", "undefined", "Phase 1 stores n, square2 and square4 as undefined and square as the full function."],
        ["p2", "fn", "square(2)", "Phase 2 reaches square(n) and creates a new execution context for the call."],
        ["fn", "fn", "num = 2", "Inside, the memory phase sets num and ans to undefined, then execution assigns 2 and 4."],
        ["fn", "ret", "4", "return ans hands 4 back to the line that called it."],
        ["ret", "gone", "pop", "The function context is deleted and the global context continues with square(4)."],
      ],
    },
    code: `var n = 2;

function square(num) {
  // Memory phase for this call: num = undefined, ans = undefined
  var ans = num * num;
  return ans;
}

console.log("before the calls:", square2, square4); // phase 1 values
var square2 = square(n);
var square4 = square(4);
console.log("after the calls:", square2, square4);`,
    walkthrough:
      "The first log runs during phase 2 but before the assignments, so it shows the phase-1 placeholders: `undefined undefined`. Each call to `square` builds a fresh context, computes `ans`, returns it, and disappears. After both lines run, `square2` and `square4` hold 4 and 16.",
    deepDive: [
      {
        heading: "Phase 1 in detail",
        points: [
          "`var` declarations → `undefined`.",
          "Function declarations → the whole function object.",
          "Function expressions assigned to `var` → `undefined` (only the variable is hoisted).",
          "`let` / `const` / `class` → reserved but uninitialised (TDZ).",
          "Parameters → set to the argument values when the function context is created.",
        ],
      },
      {
        heading: "Phase 2 in detail",
        paragraphs: [
          "The thread of execution evaluates each statement. When it meets `square(n)` it does not 'jump' into code that is already running; it creates a new execution context, pushes it on the call stack, runs both phases inside it, and only then resumes the caller with the returned value.",
        ],
      },
      {
        heading: "What return really does",
        paragraphs: [
          "`return` ends the current context immediately and transfers control to the caller with a value (or `undefined` if no value is given). Code after `return` in the same block never runs.",
        ],
        code: `function early() {
  return "done";
  console.log("never printed");
}`,
      },
    ],
    mistakes: [
      "Expecting the memory phase to evaluate expressions. It only reserves names; `var ans = num * num` is computed in phase 2.",
      "Assuming function expressions are hoisted like declarations. `var f = function () {}` leaves `f` as undefined in phase 1.",
    ],
    interview: [
      ["What are the two phases of execution context creation?", "The memory creation phase, which allocates memory for variables (as undefined) and functions (in full), and the code execution phase, which runs statements line by line and assigns real values."],
      ["What happens when a function is invoked?", "A brand-new execution context is created and pushed on the call stack. It runs its own memory phase (parameters and local vars) and execution phase, then returns a value and is popped."],
      ["Why does logging a var before its assignment print undefined?", "Because phase 1 already created the variable with the placeholder value undefined; the assignment only happens later in phase 2."],
    ],
    exercise:
      "Add `var cube = function (x) { return x * x * x; };` at the bottom and call `cube(2)` at the top. What error do you get, and in which phase was `cube` created?",
    answer:
      "You get `TypeError: cube is not a function`. In phase 1 `cube` was created as a `var` with the value undefined; the function is only assigned in phase 2, after the call has already failed.",
  }),

  "nj-execution--the-call-stack": njs({
    intro:
      "The call stack is how the engine keeps track of execution contexts. The global context is pushed first; every function call pushes a new context on top, and every return pops it off. The context on top is always the one currently running. The call stack has many names (execution context stack, program stack, control stack, runtime stack, machine stack) but one simple rule: last in, first out.",
    concepts: [
      "The call stack maintains the order of execution of execution contexts. Push on call, pop on return. When it becomes empty, the program (or the current task) has finished.",
      "Only the top frame runs. A function lower in the stack is paused at the exact line where it made the call, waiting for the result.",
      "The stack has a limited size. Unbounded recursion keeps pushing frames until the engine throws `RangeError: Maximum call stack size exceeded` (a stack overflow).",
    ],
    snapshot: {
      title: "Stack at its tallest point",
      panes: [
        ["Call stack (top first)", ["*c()  ← running", "b()  paused at c()", "a()  paused at b()", "Global EC"]],
        ["Order of events", ["push Global", "push a, push b, push c", "pop c → b resumes", "pop b → a resumes", "pop a, pop Global"]],
      ],
      caption: "LIFO: the last context pushed (c) is the first one popped. DevTools shows exactly this list in the Call Stack panel.",
    },
    animation: {
      title: "Push on call, pop on return",
      nodes: [
        ["g", "Global EC", "pushed first"],
        ["a", "a()", "frame 2"],
        ["b", "b()", "frame 3"],
        ["c", "c()", "top frame"],
      ],
      steps: [
        ["g", "a", "push", "The global context calls a(), so a's context is pushed on top."],
        ["a", "b", "push", "a() calls b(); a pauses and b's context becomes the top frame."],
        ["b", "c", "push", "b() calls c(); the stack is now four frames tall."],
        ["c", "b", "pop", "c() returns, its frame is popped, and b resumes where it left off."],
        ["b", "a", "pop", "b() returns and is popped; a continues."],
        ["a", "g", "pop", "a() returns; only the global context is left, then it is popped too."],
      ],
    },
    code: `const trace = [];

function c() { trace.push("c runs"); return "c-done"; }
function b() { trace.push("b calls c"); const r = c(); trace.push("b got " + r); }
function a() { trace.push("a calls b"); b(); trace.push("a finishes"); }

a();
console.log(trace.join(" → "));

// Unbounded recursion overflows the stack.
function forever(n) { return forever(n + 1); }
try {
  forever(0);
} catch (error) {
  console.log(error.name + ":", error.message);
}`,
    walkthrough:
      "The trace shows the LIFO order: a calls b, b calls c, c finishes first, then b, then a. The second part keeps pushing `forever` frames with no base case; the engine refuses to grow the stack further and throws a `RangeError`, which we catch and print.",
    deepDive: [
      {
        heading: "Reading the stack in DevTools",
        paragraphs: [
          "Put a `debugger` statement inside `c` and open DevTools. The Call Stack panel lists `c`, `b`, `a`, `(anonymous)` (the global script). Clicking a frame shows that frame's local variables, which is the memory component of that execution context.",
        ],
      },
      {
        heading: "Stack overflow and the base case",
        points: [
          "Every recursive function needs a base case that stops calling itself.",
          "Deep recursion over large inputs can overflow even with a base case; convert to a loop or an explicit stack array.",
          "Error stack traces (`error.stack`) are a snapshot of the call stack at the moment the error was created.",
        ],
        code: `function sumTo(n) {
  if (n === 0) return 0;      // base case
  return n + sumTo(n - 1);    // one frame per level
}`,
      },
      {
        heading: "The stack and async code",
        paragraphs: [
          "Callbacks from timers or promises never interrupt the stack. They wait until the stack is empty, then the event loop pushes them as a fresh frame. That is why a stack trace inside a `setTimeout` callback does not show the function that scheduled it.",
        ],
      },
    ],
    mistakes: [
      "Writing recursion without a reachable base case, causing `Maximum call stack size exceeded`.",
      "Expecting a timer callback to run in the middle of a long synchronous function. It cannot run until the stack is empty.",
    ],
    interview: [
      ["What is the call stack?", "A LIFO stack of execution contexts. The global context is pushed first, each call pushes a new context, each return pops one. The top frame is the code currently running."],
      ["What other names does the call stack have?", "Execution context stack, program stack, control stack, runtime stack and machine stack all describe the same structure."],
      ["What causes 'Maximum call stack size exceeded'?", "Pushing too many frames, almost always because of recursion without a working base case, or mutual recursion between functions that never stops."],
    ],
    exercise:
      "Write `function countdown(n)` that logs n and calls itself with n - 1, stopping at 0. How tall does the call stack get for `countdown(3)`, counting the global context?",
    answer:
      "Frames are pushed for countdown(3), countdown(2), countdown(1) and countdown(0), plus the global context: five frames at the deepest point. countdown(0) hits the base case, returns, and the frames pop in reverse order.",
  }),

  "nj-execution--hoisting-in-javascript": njs({
    intro:
      "Hoisting is the behaviour where you can access variables and functions before the line that declares them, without getting an error. Nothing is physically moved to the top of the file. It is a direct result of the memory creation phase: before the code runs, `var` variables are already stored as `undefined` and function declarations are already stored in full.",
    concepts: [
      "A function declaration is fully hoisted: its whole body is placed in memory in phase 1, so calling it on the first line works.",
      "A `var` variable is hoisted with the value `undefined`. Reading it early gives `undefined`, not an error, and not the value assigned later.",
      "A name that was never declared anywhere is 'not defined'. Reading it throws `ReferenceError`. `let`, `const` and `class` are hoisted too, but stay in the temporal dead zone until their line.",
    ],
    snapshot: {
      title: "Memory after phase 1, before line 1",
      panes: [
        ["Memory", ["x : undefined", "*getName : ƒ getName() {…}"]],
        ["What line 1-3 print", ["getName() → Hello JS", "x → undefined", "y → ReferenceError"]],
      ],
      caption: "The function exists in full and x exists as undefined, which is why the first two calls work even though they come before the declarations.",
    },
    animation: {
      title: "Why early access works",
      nodes: [
        ["scan", "Phase 1 scan", "whole file"],
        ["fn", "getName", "stored in full"],
        ["v", "x", "undefined"],
        ["run", "Phase 2", "line 1"],
        ["err", "y", "never declared"],
      ],
      steps: [
        ["scan", "fn", "function", "The scan finds the function declaration and stores the entire function."],
        ["scan", "v", "var", "It finds var x and stores the placeholder undefined."],
        ["run", "fn", "call", "Line 1 calls getName(), which already exists, so it prints Hello JS."],
        ["run", "v", "read", "Line 2 reads x and gets undefined because the assignment has not run."],
        ["run", "err", "throw", "Reading y fails: it is not in memory at all, so it is not defined."],
      ],
    },
    code: `getName();                 // works: function declarations are hoisted
console.log(x);            // undefined: var is hoisted with undefined
console.log(typeof getName);

try {
  console.log(y);          // y is declared nowhere
} catch (error) {
  console.log(error.name + ":", error.message);
}

var x = 7;

function getName() {
  console.log("Hello JS");
}

console.log(x);            // 7 after the assignment ran`,
    walkthrough:
      "`getName()` prints its message on the first line because the full function was stored during phase 1. `x` prints `undefined` at the top and 7 at the bottom: same variable, read before and after its assignment. `y` was never declared, so the engine throws `ReferenceError: y is not defined`, which we catch.",
    deepDive: [
      {
        heading: "Hoisting is not 'moving code'",
        paragraphs: [
          "Tutorials often say declarations are 'moved to the top'. That is only a mental shortcut. What really happens is that memory is allocated for every declaration before execution starts. The source code stays where it is.",
        ],
      },
      {
        heading: "Hoisting inside functions",
        paragraphs: [
          "Every function call has its own memory phase, so local `var` and inner function declarations are hoisted to the top of that function, not to the top of the file.",
        ],
        code: `function demo() {
  console.log(local); // undefined, not the outer value
  var local = "inside";
}`,
      },
      {
        heading: "What gets hoisted how",
        points: [
          "`function f() {}` → whole function.",
          "`var v = 1` → `v: undefined`.",
          "`let` / `const` / `class` → hoisted but uninitialised (TDZ → ReferenceError if read early).",
          "`var f = function () {}` or an arrow → only `f`, as undefined.",
        ],
      },
    ],
    mistakes: [
      "Relying on hoisting for readability. Declare before use; hoisting is something to understand, not something to lean on.",
      "Confusing `undefined` (declared, no value yet) with 'not defined' (no memory allocated at all).",
      "Assuming every function form is hoisted the same way; expressions and arrows are not callable before their line.",
    ],
    interview: [
      ["What is hoisting?", "The ability to access variables and functions before their declaration line without an error. It happens because the memory creation phase allocates `var` variables as undefined and function declarations in full before any code runs."],
      ["Are let and const hoisted?", "Yes, but they are not initialised. They sit in the temporal dead zone until their declaration line runs, so accessing them early throws a ReferenceError instead of returning undefined."],
      ["What prints: `console.log(a); var a = 10;`?", "undefined. The declaration of `a` is hoisted with the placeholder undefined; the assignment of 10 happens on its own line later."],
    ],
    exercise:
      "Predict the output: `console.log(typeof hello); var hello = 1; function hello() {}; console.log(typeof hello);`.",
    answer:
      "It prints `function` then `number`. In phase 1 the function declaration wins over the `var` placeholder, so `hello` is a function at the start. In phase 2 the assignment `hello = 1` overwrites it with a number.",
  }),

  "nj-execution--hoisting-function-expressions-and-arrow-functions": njs({
    intro:
      "Not every function is hoisted the same way. Only function declarations (statements that start with the `function` keyword) are stored in full during the memory phase. Function expressions and arrow functions are values assigned to a variable, so they follow the rules of that variable: `undefined` with `var`, the temporal dead zone with `let` or `const`.",
    concepts: [
      "`var getName2 = () => {}` is a variable. In phase 1 it holds `undefined`; calling it early is calling `undefined()`, which throws `TypeError: getName2 is not a function`.",
      "With `let` or `const`, the same early call throws `ReferenceError: Cannot access 'name' before initialization`, because the binding is in the temporal dead zone.",
      "This difference is one of the most common interview traps: the error type tells you which kind of declaration was used.",
    ],
    snapshot: {
      title: "Memory after phase 1",
      panes: [
        ["Memory", ["decl : ƒ decl() {…}", "*exprVar : undefined", "arrowLet : <uninitialized>"]],
        ["Early call", ["decl() → works", "exprVar() → TypeError", "arrowLet() → ReferenceError"]],
      ],
      caption: "Three functions, three different hoisting outcomes. Only the declaration has a function value before its line.",
    },
    animation: {
      title: "Same call, three different outcomes",
      nodes: [
        ["call", "Early call", "line 1"],
        ["d", "Declaration", "ƒ stored"],
        ["e", "var expression", "undefined"],
        ["l", "let arrow", "TDZ"],
      ],
      steps: [
        ["call", "d", "decl()", "The declaration was stored in full during phase 1, so the call runs."],
        ["call", "e", "exprVar()", "exprVar is undefined; calling undefined throws a TypeError."],
        ["call", "l", "arrowLet()", "arrowLet is in the temporal dead zone, so reading it throws a ReferenceError."],
        ["e", "d", "after line", "After their lines run, all three variables hold callable functions."],
      ],
    },
    code: `console.log(decl());

try { exprVar(); } catch (e) { console.log(e.name + ":", e.message); }
try { arrowLet(); } catch (e) { console.log(e.name + ":", e.message); }

function decl() { return "declaration: hoisted in full"; }
var exprVar = function () { return "var expression"; };
let arrowLet = () => "let arrow";

console.log(exprVar(), "|", arrowLet());`,
    walkthrough:
      "The declaration works before its line. The `var` expression fails with a TypeError because its value was still `undefined`. The `let` arrow fails with a ReferenceError from the temporal dead zone. After the assignments run, both expressions are callable.",
    deepDive: [
      {
        heading: "Telling the forms apart",
        points: [
          "Declaration: a statement beginning with `function name(...)`.",
          "Expression: `function` appears where a value is expected, e.g. after `=` or as an argument.",
          "Arrow: always an expression; it has no name of its own unless assigned to a variable.",
        ],
      },
      {
        heading: "Why expressions are useful anyway",
        paragraphs: [
          "Because expressions are values, they are created exactly when the line runs. That lets you choose a function conditionally, create one per loop iteration, or pass one directly as an argument, none of which needs hoisting.",
        ],
        code: `const format = isMobile ? (s) => s.slice(0, 10) : (s) => s;`,
      },
    ],
    mistakes: [
      "Calling a helper defined with `const helper = () => {}` from code higher up in the same module during initialisation.",
      "Reading 'is not a function' as 'is not defined'. The variable exists; its value is just not a function yet.",
    ],
    interview: [
      ["Are arrow functions hoisted?", "The variable holding them is hoisted (as undefined with var, or into the TDZ with let/const), but the function value is not. You cannot call an arrow before its line."],
      ["Which error do you get calling a var function expression early?", "`TypeError: name is not a function`, because the variable exists with the value undefined."],
      ["Which error with a const arrow?", "`ReferenceError: Cannot access 'name' before initialization`, because const bindings stay uninitialised until their declaration runs."],
    ],
    exercise:
      "Rewrite `var greet = function () {...}` so it can be called on line 1 without changing the call site.",
    answer:
      "Turn it into a function declaration: `function greet() {...}`. Declarations are stored in full during the memory phase, so the early call works.",
  }),

  "nj-execution--how-functions-work-and-variable-environment": njs({
    intro:
      "Each function call gets its own execution context with its own variable environment. A variable named `x` inside `a()` and another `x` inside `b()` are completely independent memory slots, even though they share a name with a global `x`. Following each call through the call stack shows how JavaScript keeps them apart.",
    concepts: [
      "Every invocation creates a fresh execution context. Local variables live in that context's memory, so two calls of the same function never share locals.",
      "A name is looked up in the current context first. If a local `x` exists, it is used, and the global `x` is untouched (this is shadowing).",
      "When the function returns, its context is popped and its local memory is released, unless a closure keeps it alive.",
    ],
    snapshot: {
      title: "Three x values in three contexts",
      panes: [
        ["Global memory", ["x : 1", "a : ƒ", "b : ƒ"]],
        ["a() memory", ["*x : 10"]],
        ["b() memory", ["x : 100"]],
      ],
      caption: "Same name, three separate slots. Each console.log reads the x in the context that is currently on top of the call stack.",
    },
    animation: {
      title: "Each call brings its own memory",
      nodes: [
        ["g", "Global EC", "x = 1"],
        ["a", "a() EC", "x = 10"],
        ["b", "b() EC", "x = 100"],
        ["log", "console", "prints"],
      ],
      steps: [
        ["g", "a", "call a", "Calling a() pushes a new context whose memory has its own x."],
        ["a", "log", "10", "Inside a, x resolves to the local 10 and is printed."],
        ["a", "g", "pop", "a returns; its context and its x are discarded."],
        ["g", "b", "call b", "Calling b() pushes another context with a separate x = 100."],
        ["b", "log", "100", "b prints its local 100, then it is popped."],
        ["g", "log", "1", "Back in global, x is still 1: neither function changed it."],
      ],
    },
    code: `var x = 1;
a();
b();
console.log("global x:", x);

function a() {
  var x = 10;   // local to a's execution context
  console.log("a sees x:", x);
}

function b() {
  var x = 100;  // local to b's execution context
  console.log("b sees x:", x);
}`,
    walkthrough:
      "Both functions are hoisted, so they can be called on lines 2 and 3. Each call has its own memory phase that creates a local `x`, so they print 10 and 100. The global `x` was never touched, so the final log prints 1.",
    deepDive: [
      {
        heading: "Variable environment vs lexical environment",
        paragraphs: [
          "The variable environment is the memory of one execution context. The lexical environment is that memory plus a reference to the parent's lexical environment. The parent link is what lets an inner function see outer variables when it has no local of the same name.",
        ],
      },
      {
        heading: "Forgetting var creates a global",
        paragraphs: [
          "In sloppy (non-strict) mode, assigning to an undeclared name inside a function creates a global variable. Strict mode turns this into a ReferenceError, which is one of many reasons to use modules or `\"use strict\"`.",
        ],
        code: `function leak() {
  counter = 5; // no var/let/const: becomes a global in sloppy mode
}`,
      },
    ],
    mistakes: [
      "Expecting a function to change the outer variable when it declares a local with the same name.",
      "Accidentally creating globals by assigning without a declaration in sloppy mode.",
    ],
    interview: [
      ["Do two calls of the same function share local variables?", "No. Each call creates a new execution context with its own variable environment."],
      ["What is the variable environment?", "The memory component of an execution context: the place where its variables, parameters and inner function declarations are stored."],
      ["If a function declares var x and the global also has x, which is used inside?", "The local one. Lookup starts in the current context and only moves to the parent when the name is not found locally."],
    ],
    exercise:
      "Remove `var` from inside `a()` so it reads `x = 10;`. What does the final global log print now, and why?",
    answer:
      "It prints 10. Without a local declaration, `x = 10` inside `a` resolves to the global `x` through the scope chain and overwrites it. `b` still has its own local, so it does not affect the global.",
  }),

  "nj-execution--shortest-js-program-window-and-this": njs({
    intro:
      "The shortest JavaScript program is an empty file. Even with zero lines, the engine still creates a global execution context, a global object, and a `this` binding. In browsers the global object is `window`; in Node.js it is `global`, and `globalThis` names it everywhere. At the global level of a classic script, `this === window`.",
    concepts: [
      "The JavaScript engine always sets up the global execution context, the global object and `this`, whether or not your file has code.",
      "Any `var` or function declared at the global level of a classic script becomes a property of the global object: `var a = 10` makes `window.a`, `this.a` and `a` all equal 10.",
      "`let` and `const` at the top level do not become `window` properties; they live in a separate declarative record of the global scope. ES modules have their own top-level scope, and their top-level `this` is `undefined`.",
    ],
    snapshot: {
      title: "An empty script still has a global context",
      panes: [
        ["Global EC", ["memory: (empty)", "code: (empty)"]],
        ["Global object", ["*window", "this === window", "globalThis === window"]],
        ["After var a = 10", ["window.a : 10", "this.a : 10", "a : 10"]],
      ],
      caption: "The global object exists before any line of yours runs. Global var and function declarations become its properties.",
    },
    animation: {
      title: "What the engine creates for an empty file",
      nodes: [
        ["file", "Empty file", "0 lines"],
        ["ec", "Global EC", "created"],
        ["win", "window", "global object"],
        ["thisv", "this", "→ window"],
      ],
      steps: [
        ["file", "ec", "run", "Running even an empty file creates the global execution context."],
        ["ec", "win", "create", "The engine creates the global object (window in the browser)."],
        ["ec", "thisv", "bind", "At the global level, this is bound to the global object."],
        ["thisv", "win", "===", "this === window is true, so var a also appears as this.a and window.a."],
      ],
    },
    code: `var a = 10;
let b = 20;
function sayHi() {}

console.log(this === window);
console.log(window.a, this.a, a);
console.log(window.b);
console.log(typeof window.sayHi);
console.log(globalThis === window);`,
    mode: "browser",
    sample: "true\n10 10 10\nundefined\nfunction\ntrue",
    walkthrough:
      "Paste this into a browser console. At the top level of a classic script `this` is `window`. The global `var a` and the function declaration become properties of `window`, so `window.a`, `this.a` and `a` agree. `let b` does not, so `window.b` is `undefined`.",
    deepDive: [
      {
        heading: "Global object across environments",
        points: [
          "Browser main thread: `window` (also `self`, `frames`).",
          "Web Worker: `self`.",
          "Node.js: `global`.",
          "Everywhere since ES2020: `globalThis`.",
        ],
      },
      {
        heading: "Why top-level this is different in Node and modules",
        paragraphs: [
          "Node wraps each CommonJS file in a function, so top-level `this` is `module.exports` (an empty object), and `var` does not create a property of `global`. In ES modules, both in browsers and Node, top-level `this` is `undefined` and top-level declarations stay private to the module.",
        ],
        code: `// node file.cjs
console.log(this);        // {}
// node file.mjs, or <script type="module">
console.log(this);        // undefined`,
      },
    ],
    mistakes: [
      "Polluting the global object with `var` in classic scripts, causing name clashes between scripts.",
      "Assuming `this` is `window` inside a module or a Node file.",
    ],
    interview: [
      ["What is the shortest JavaScript program?", "An empty file. Running it still creates the global execution context, the global object (window in browsers) and the `this` binding."],
      ["At the global level in a browser, what is this?", "The global object, `window`, so `this === window` is true in a classic script."],
      ["Does `let x` at the top level create window.x?", "No. Only global `var` and function declarations become properties of the global object; `let`, `const` and `class` live in a separate declarative environment."],
    ],
    exercise:
      "In a browser console, run `var count = 1; window.count = 2; console.log(count);`. What prints and why?",
    answer:
      "2. The global `var count` and `window.count` are the same property of the global object, so writing through `window` updates the variable.",
  }),

  "nj-execution--undefined-vs-not-defined": njs({
    intro:
      "`undefined` and 'not defined' sound alike but mean different things. `undefined` is a real primitive value: the placeholder the engine puts in a declared variable before you assign one. 'Not defined' is an error: the name was never declared, so no memory exists for it at all, and reading it throws `ReferenceError: x is not defined`.",
    concepts: [
      "`undefined` means memory was allocated during the memory phase but nothing has been assigned yet. It is a value of type `\"undefined\"`, not an empty slot.",
      "'Not defined' means the name does not exist in any reachable scope. The engine has nothing to read, so it throws a ReferenceError.",
      "Never assign `undefined` yourself to mark 'empty'. It makes it impossible to tell 'never set' from 'deliberately cleared'. Use `null` for intentional absence.",
    ],
    snapshot: {
      title: "Declared vs never declared",
      panes: [
        ["Memory", ["*a : undefined", "(no entry for x)"]],
        ["Reading them", ["a → undefined", "typeof a → 'undefined'", "x → ReferenceError", "typeof x → 'undefined'"]],
      ],
      caption: "a has a slot holding the value undefined. x has no slot at all. Only typeof can safely probe a name that might not exist.",
    },
    animation: {
      title: "Two lookups, two outcomes",
      nodes: [
        ["code", "Code", "reads a, x"],
        ["mem", "Memory", "a: undefined"],
        ["val", "undefined", "a value"],
        ["err", "ReferenceError", "not defined"],
      ],
      steps: [
        ["code", "mem", "a?", "The engine looks up a and finds a slot created in the memory phase."],
        ["mem", "val", "value", "The slot holds the placeholder value undefined, which is returned."],
        ["code", "mem", "x?", "The engine looks up x; there is no slot in this scope or any parent."],
        ["mem", "err", "throw", "With nothing to read, the engine throws ReferenceError: x is not defined."],
      ],
    },
    code: `var a;
console.log(a);                 // declared, no value yet
console.log(typeof a);

try {
  console.log(x);               // never declared anywhere
} catch (error) {
  console.log(error.name + ":", error.message);
}
console.log(typeof x);          // typeof does not throw for unknown names

a = 7;
console.log(a === undefined ? "still empty" : "assigned " + a);

let profile = null;             // intentional "no value"
console.log(profile ?? "no profile yet");`,
    walkthrough:
      "`a` exists with the value `undefined`, so logging it is safe. `x` was never declared, so reading it throws `ReferenceError: x is not defined`. `typeof x` is the one operation that does not throw on an unknown name; it returns the string `\"undefined\"`. Assigning 7 replaces the placeholder. `null` is the deliberate 'nothing here' value.",
    deepDive: [
      {
        heading: "JavaScript is loosely typed",
        paragraphs: [
          "A variable is not tied to a type. The same `a` can hold `undefined`, then a number, then a string. That flexibility is why the placeholder value must itself be a value: the engine needs something to put in the slot before you choose a type.",
        ],
        code: `var a;        // undefined
a = 10;       // number
a = "ten";    // string — allowed`,
      },
      {
        heading: "undefined vs null",
        points: [
          "`undefined`: set by the engine — uninitialised vars, missing properties, missing arguments, functions without `return`.",
          "`null`: set by you to say 'intentionally empty'.",
          "`null == undefined` is true, `null === undefined` is false.",
          "`typeof null` is `\"object\"` (a historical bug); `typeof undefined` is `\"undefined\"`.",
        ],
      },
    ],
    mistakes: [
      "Writing `x = undefined` to clear something. Use `null` so the intent is clear.",
      "Guarding with `if (someGlobal)` when the name may not exist at all; that throws. Use `typeof someGlobal !== \"undefined\"` or `globalThis.someGlobal`.",
    ],
    interview: [
      ["What is the difference between undefined and not defined?", "`undefined` is a value meaning the variable was declared (memory allocated) but not assigned. 'Not defined' is a ReferenceError meaning the name was never declared, so there is no memory for it."],
      ["Is undefined the same as empty?", "No. It is a real primitive value acting as a placeholder; it takes up the variable's slot until something else is assigned."],
      ["Why does typeof on an undeclared variable not throw?", "typeof is specified to return \"undefined\" for unresolvable references, so it can safely detect whether a global exists."],
    ],
    exercise:
      "What does `function f() {} console.log(f());` print, and is that 'undefined' or 'not defined'?",
    answer:
      "It prints `undefined`. The function exists and runs; it simply returns no value, and a function without `return` gives back the value undefined. Nothing is 'not defined'.",
  }),
};
