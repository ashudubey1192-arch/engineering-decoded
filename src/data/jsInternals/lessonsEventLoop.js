// Web APIs, event loop, queues, JS engine, V8, setTimeout.
import { njs } from "./schema.js";

export const eventLoopLessons = {
  "nj-event-loop--web-apis-and-the-browser-runtime": njs({
    intro:
      "The JavaScript engine has a call stack and a heap, and nothing else: no timer, no network, no DOM. Those 'superpowers' come from the browser, which exposes them as Web APIs on the global object `window`: `setTimeout`, `fetch`, `document` and the DOM APIs, `localStorage`, `console`, `location` and more. Your code reaches them through `window`, which is why you can write `setTimeout` instead of `window.setTimeout`.",
    concepts: [
      "The call stack runs whatever execution context is on top, immediately. It has no concept of time; it cannot 'wait 5 seconds'.",
      "Web APIs are features of the browser (implemented in C++ and others), not of the JavaScript language. The browser wraps them into `window` so JavaScript can use them.",
      "When you call `setTimeout(cb, 5000)`, the browser's timer API stores `cb` and starts counting; JavaScript continues instantly. When the timer expires, the browser hands `cb` back through a queue.",
    ],
    snapshot: {
      title: "Browser = engine + Web APIs",
      panes: [
        ["JS engine", ["call stack", "heap (memory)"]],
        ["Web APIs (window)", ["*setTimeout", "DOM (document)", "fetch()", "localStorage", "console, location"]],
        ["Queues", ["callback queue", "microtask queue"]],
      ],
      caption: "The engine runs your code; the browser provides time, network, storage and the page, and returns results through queues.",
    },
    animation: {
      title: "Borrowing a superpower from the browser",
      nodes: [
        ["stack", "Call stack", "runs code"],
        ["win", "window", "global object"],
        ["timer", "Timer API", "browser"],
        ["queue", "Callback queue", "ready"],
      ],
      steps: [
        ["stack", "win", "setTimeout", "Your code calls setTimeout, which is found on the window object."],
        ["win", "timer", "register cb", "The browser's timer stores the callback and starts the countdown."],
        ["stack", "stack", "continue", "The call stack keeps running the next lines without waiting."],
        ["timer", "queue", "expired", "After the delay, the browser places the callback in the callback queue."],
        ["queue", "stack", "event loop", "The event loop pushes it onto the stack once the stack is empty."],
      ],
    },
    code: `// In a browser console:
console.log(typeof window.setTimeout, typeof window.fetch, typeof window.localStorage);
console.log(window.setTimeout === setTimeout);   // same function

console.log("Start");
setTimeout(function cb() {
  console.log("Callback after 50ms");
}, 50);
console.log("End");`,
    mode: "browser",
    sample: "function function object\ntrue\nStart\nEnd\nCallback after 50ms",
    walkthrough:
      "The timer, network and storage APIs exist on `window` and are the same functions you call without the prefix. 'Start' and 'End' print immediately because the call stack never waits; the browser's timer holds `cb` and the event loop runs it after 50 ms, once the stack is empty.",
    deepDive: [
      {
        heading: "Common Web APIs",
        points: [
          "Timers: `setTimeout`, `setInterval`, `requestAnimationFrame`.",
          "DOM: `document.querySelector`, events, `MutationObserver`.",
          "Network: `fetch`, `XMLHttpRequest`, `WebSocket`.",
          "Storage: `localStorage`, `sessionStorage`, IndexedDB.",
          "Others: `console`, `location`, `history`, `navigator`, Web Workers.",
        ],
      },
      {
        heading: "Node.js has its own APIs",
        paragraphs: [
          "Node.js uses the same V8 engine but provides different host APIs: `fs`, `http`, `process`, plus its own timers. Both environments supply `console`, `setTimeout` and (in modern Node) `fetch`, which is why some code runs in both.",
        ],
      },
    ],
    mistakes: [
      "Calling `setTimeout`, `fetch` or `console` 'part of JavaScript'. They are host APIs; the language specification does not define them.",
      "Assuming the delay passed to `setTimeout` is exact; it is a minimum (see 'Why setTimeout Delays Are Not Exact').",
    ],
    interview: [
      ["Is setTimeout part of JavaScript?", "No. It is a Web API provided by the browser (and a similar API provided by Node.js). The ECMAScript language itself has no timers."],
      ["How does JavaScript access Web APIs?", "Through the global object `window`, which the browser populates with those APIs; because it is the global object, the `window.` prefix is optional."],
      ["Name some Web APIs.", "setTimeout/setInterval, DOM APIs (document), fetch, localStorage/sessionStorage, console, location, history, navigator and WebSocket."],
    ],
    exercise:
      "Without running it: `console.log(1); setTimeout(() => console.log(2), 0); console.log(3);`",
    answer:
      "1, 3, 2. Even with 0 ms, the callback goes through the timer API and the callback queue, so it cannot run until the global code finishes.",
  }),

  "nj-event-loop--callback-queue-and-the-event-loop": njs({
    intro:
      "When a Web API finishes its job, such as a timer expiring or a click happening, it does not push your callback directly onto the call stack. It places the callback into the callback queue (also called the task queue or macrotask queue). The event loop has one job: continuously check whether the call stack is empty and, if it is, take the first callback from the queue and push it onto the stack.",
    concepts: [
      "Callback queue: a FIFO list of callbacks ready to run (timers, DOM events, I/O). Callbacks wait there; they never interrupt running code.",
      "Event loop: a gatekeeper that watches the call stack and the queues. Only when the stack is empty does it move the next callback onto it.",
      "Why a queue? Several events may complete together (a user clicks five times quickly). The queue keeps them in order so each runs one after another.",
    ],
    snapshot: {
      title: "The moment before the event loop acts",
      panes: [
        ["Call stack", ["(empty)"]],
        ["Web APIs", ["click → btn", "timer 5000ms"]],
        ["Callback queue", ["*cbClick #1", "cbClick #2"]],
        ["Event loop", ["stack empty? yes", "→ push cbClick"]],
      ],
      caption: "Two clicks queued two callbacks. The event loop moves them one at a time, only while the stack is empty.",
    },
    animation: {
      title: "A click travels through the queue",
      nodes: [
        ["code", "Global code", "registers"],
        ["api", "DOM API", "listener"],
        ["queue", "Callback queue", "FIFO"],
        ["loop", "Event loop", "watches"],
        ["stack", "Call stack", "runs cb"],
      ],
      steps: [
        ["code", "api", "addEventListener", "The global code registers cbClick with the DOM API and finishes."],
        ["api", "queue", "click", "A click happens; the browser puts cbClick in the callback queue."],
        ["loop", "stack", "empty?", "The event loop checks that the call stack is empty."],
        ["queue", "stack", "push", "It pushes cbClick onto the stack and the callback runs."],
        ["stack", "loop", "done", "When cbClick finishes the stack is empty again and the loop repeats."],
      ],
    },
    code: `const order = [];

setTimeout(() => order.push("timer A (0ms)"), 0);
setTimeout(() => order.push("timer B (0ms)"), 0);
setTimeout(() => order.push("timer C (20ms)"), 20);

order.push("sync 1");
for (let i = 0; i < 3; i++) order.push("sync loop " + i);
order.push("sync 2");

setTimeout(() => console.log(order.join("\\n")), 50);`,
    walkthrough:
      "Every synchronous line runs first; the queue cannot interrupt them. Then the event loop takes timers A and B in the order they were queued, and later C after its 20 ms. The final timer prints the recorded order.",
    deepDive: [
      {
        heading: "One iteration of the event loop (simplified)",
        points: [
          "Run the oldest task from the callback (task) queue until the stack is empty.",
          "Run all microtasks (promise callbacks) until that queue is empty.",
          "Let the browser render if needed (style, layout, paint, `requestAnimationFrame`).",
          "Repeat.",
        ],
      },
      {
        heading: "Why DOM events are queued, not immediate",
        paragraphs: [
          "If the browser ran a click handler in the middle of your function, your variables could change under you. Queuing guarantees run-to-completion: once a piece of JavaScript starts, it finishes before anything else runs.",
        ],
      },
    ],
    mistakes: [
      "Thinking callbacks run 'in parallel' with the main code. They run on the same thread, after it.",
      "Believing timers with the same delay run in random order; they run in the order they were scheduled.",
    ],
    interview: [
      ["What is the event loop?", "A mechanism that continuously checks the call stack and the queues; when the stack is empty it takes the next callback (microtasks first) and pushes it onto the stack."],
      ["What is the callback queue?", "A FIFO queue where Web APIs place callbacks that are ready to run, such as expired timers and DOM events. Also called the task or macrotask queue."],
      ["Why do we need a callback queue?", "Many events can be ready at once; the queue keeps their callbacks in order and holds them until the call stack is free."],
    ],
    exercise:
      "A user clicks a button 3 times while a 1-second synchronous loop is running. When do the 3 handlers run?",
    answer:
      "All three clicks are queued during the loop. After the loop (and the rest of the current task) finishes and the stack is empty, the event loop runs the three handlers one after another, in click order.",
  }),

  "nj-event-loop--microtask-queue": njs({
    intro:
      "There is a second, higher-priority queue: the microtask queue. Promise callbacks (`.then`, `.catch`, `.finally`, the code after `await`), `queueMicrotask` and `MutationObserver` callbacks go there. The event loop always empties the entire microtask queue before taking the next task from the callback queue. That is why a resolved promise runs before a `setTimeout(..., 0)` scheduled earlier.",
    concepts: [
      "Microtask queue: for promise reactions, `queueMicrotask` and `MutationObserver`. Callback (task) queue: for `setTimeout`, `setInterval`, DOM events and I/O.",
      "Priority: after the current script or task finishes, every microtask runs, including microtasks queued by other microtasks, before the next task.",
      "`fetch` itself is handled by a Web API; when the response arrives, the promise resolves and its `.then` callback enters the microtask queue.",
    ],
    snapshot: {
      title: "Queues after the script ends",
      panes: [
        ["Call stack", ["(empty)"]],
        ["Microtask queue", ["*then: promise 1", "queueMicrotask", "then: promise 2"]],
        ["Callback queue", ["timeout 0ms"]],
      ],
      caption: "Even though the timeout was scheduled first, all three microtasks run before it.",
    },
    animation: {
      title: "Microtasks jump ahead",
      nodes: [
        ["script", "Script", "sync code"],
        ["micro", "Microtask queue", "promises"],
        ["task", "Callback queue", "timers"],
        ["loop", "Event loop", "priority rules"],
        ["stack", "Call stack", "runs"],
      ],
      steps: [
        ["script", "task", "setTimeout", "The timeout callback is scheduled first, into the callback queue."],
        ["script", "micro", "then", "A promise callback is queued as a microtask."],
        ["script", "stack", "sync", "The rest of the script runs to completion."],
        ["micro", "stack", "drain", "The event loop runs every microtask before anything else."],
        ["task", "stack", "then task", "Only then does the timeout callback get its turn."],
      ],
    },
    code: `console.log("1. script start");

setTimeout(() => console.log("6. timeout (task)"), 0);

Promise.resolve().then(() => {
  console.log("3. promise then (microtask)");
  Promise.resolve().then(() => console.log("5. nested microtask"));
});

queueMicrotask(() => console.log("4. queueMicrotask"));

console.log("2. script end");`,
    walkthrough:
      "Synchronous lines print first (1, 2). The script is one task; when it ends, the microtask queue drains: the `then` callback (3), the `queueMicrotask` callback (4), and the microtask that the first callback queued (5). Only after the microtask queue is empty does the timeout task run (6).",
    deepDive: [
      {
        heading: "What goes where",
        points: [
          "Microtasks: `promise.then/catch/finally`, continuation after `await`, `queueMicrotask`, `MutationObserver`.",
          "Tasks (macrotasks): `setTimeout`, `setInterval`, DOM events, `MessageChannel`, network/I/O callbacks.",
          "Rendering happens between tasks, after microtasks, not during them.",
        ],
      },
      {
        heading: "fetch walk-through",
        code: `console.log("start");
setTimeout(() => console.log("timer"), 5000);
fetch("/api").then(() => console.log("data"));
console.log("end");
// start, end, data (if the response takes < 5s), timer`,
        paragraphs: [
          "The network request runs in the browser. When the response arrives, the `.then` callback goes to the microtask queue. If both are ready at the same time, the microtask runs first.",
        ],
      },
    ],
    mistakes: [
      "Assuming `setTimeout(fn, 0)` runs before promise callbacks.",
      "Thinking only `.then` is a microtask; the code after `await` is too.",
    ],
    interview: [
      ["What is the microtask queue?", "A higher-priority queue for promise reactions, queueMicrotask and MutationObserver callbacks. The event loop empties it completely after each task before taking the next task."],
      ["Which runs first: setTimeout(fn, 0) or Promise.resolve().then(fn)?", "The promise callback, because microtasks are processed before the next task from the callback queue."],
      ["Where do fetch callbacks go?", "fetch returns a promise; when the response is ready, the promise resolves and its .then callback is placed in the microtask queue."],
    ],
    exercise:
      "Predict: `setTimeout(() => log('T')); Promise.resolve().then(() => log('P1')).then(() => log('P2')); log('S');`",
    answer:
      "S, P1, P2, T. The chained `.then` is queued when P1 finishes, which is still during the microtask phase, so it runs before the timeout task.",
  }),

  "nj-event-loop--starvation-and-task-ordering": njs({
    intro:
      "Because the microtask queue is always drained completely, a microtask that keeps scheduling more microtasks can keep the callback queue waiting forever. That is starvation of the callback queue: timers, clicks and even rendering never get a turn. Putting it together with ordering rules lets you solve any 'what is the output?' event-loop puzzle.",
    concepts: [
      "Starvation: if microtasks keep creating microtasks, the event loop never leaves the microtask phase, so tasks in the callback queue are starved.",
      "The ordering algorithm: run all synchronous code; drain microtasks (including new ones); take one task; drain microtasks again; repeat.",
      "To yield to the browser deliberately, schedule work as a task (`setTimeout`, `MessageChannel`) or use `requestAnimationFrame` / `scheduler.yield()` where available, not another microtask.",
    ],
    snapshot: {
      title: "A starving loop",
      panes: [
        ["Microtask queue", ["*tick 1 → queues tick 2", "tick 2 → queues tick 3", "… never empty …"]],
        ["Callback queue", ["timeout (waiting)", "click (waiting)", "render (blocked)"]],
      ],
      caption: "Every microtask adds another, so the event loop never gets to the callback queue. Our example stops after 5 ticks to let the timer run.",
    },
    animation: {
      title: "Microtasks that refill themselves",
      nodes: [
        ["micro", "Microtask queue", "keeps refilling"],
        ["stack", "Call stack", "runs tick"],
        ["task", "Callback queue", "timeout waits"],
        ["render", "Rendering", "blocked"],
      ],
      steps: [
        ["micro", "stack", "tick", "The event loop runs a microtask from the queue."],
        ["stack", "micro", "queue next", "That microtask schedules another microtask before finishing."],
        ["micro", "stack", "again", "The queue is never empty, so the loop keeps draining it."],
        ["task", "task", "starved", "The timeout and any clicks wait in the callback queue."],
        ["micro", "task", "finally", "Only when the ticks stop does the timeout callback run."],
      ],
    },
    code: `const events = [];
setTimeout(() => {
  events.push("timeout finally runs");
  console.log(events.join("\\n"));
}, 0);

let ticks = 0;
function tick() {
  ticks++;
  events.push("microtask tick " + ticks);
  if (ticks < 5) queueMicrotask(tick);    // remove the limit and the timeout never runs
}
queueMicrotask(tick);

// Classic ordering puzzle:
setTimeout(() => events.push("puzzle: T1"), 0);
Promise.resolve()
  .then(() => { events.push("puzzle: P1"); setTimeout(() => events.push("puzzle: T2"), 0); })
  .then(() => events.push("puzzle: P2"));
events.push("puzzle: sync");`,
    walkthrough:
      "Synchronous code records 'puzzle: sync' first. Then microtasks drain: tick 1, P1, tick 2, P2, and the remaining ticks interleave as each schedules the next. Only after the microtask queue is finally empty does the first timeout run, and it prints the log (T1 and T2 are still behind it in the callback queue). With no tick limit, that timeout would never run.",
    deepDive: [
      {
        heading: "Solving output puzzles step by step",
        points: [
          "Write three columns: stack, microtasks, tasks.",
          "Run synchronous lines top to bottom; put callbacks into the right column.",
          "When the stack empties, run every microtask in order, appending new ones to the end.",
          "Take the first task; then drain microtasks again. Repeat until both queues are empty.",
        ],
      },
      {
        heading: "Node.js extra: process.nextTick",
        paragraphs: [
          "Node has an even higher-priority queue: `process.nextTick` callbacks run before promise microtasks. Recursive `nextTick` can starve I/O the same way recursive microtasks starve the browser.",
        ],
      },
    ],
    mistakes: [
      "Using recursive promise chains for long loops and freezing the UI.",
      "Splitting heavy work into microtasks and expecting the page to repaint in between; it will not.",
    ],
    interview: [
      ["What is starvation of the callback queue?", "When microtasks keep generating new microtasks, the event loop never finishes the microtask phase, so callbacks in the callback queue (timers, events) never get to run."],
      ["How do you yield to the browser between chunks of work?", "Schedule each chunk as a task (setTimeout or MessageChannel), use requestAnimationFrame for visual work, or scheduler.yield where supported; microtasks do not yield."],
      ["Order of: sync code, promise callbacks, timeouts?", "Synchronous code first, then all microtasks (promise callbacks), then one task at a time from the callback queue (timeouts), draining microtasks after each task."],
    ],
    exercise:
      "Output order? `setTimeout(()=>log('A')); Promise.resolve().then(()=>{ log('B'); setTimeout(()=>log('C')); }); log('D');`",
    answer:
      "D, B, A, C. D is sync; B is a microtask; A was queued as a task before C, which was only queued while B ran.",
  }),

  "nj-event-loop--javascript-runtime-environment": njs({
    intro:
      "JavaScript runs everywhere (browsers, servers, smart watches, light bulbs) because of the JavaScript Runtime Environment (JRE). A runtime is the complete package needed to run JavaScript: a JS engine plus host APIs, the event loop, a callback queue and a microtask queue. Browsers and Node.js are both runtimes. They share engines, but give you different APIs.",
    concepts: [
      "JS engine: the heart of the runtime. It parses, compiles and executes your code and manages the call stack and memory heap. Examples: V8 (Chrome, Node, Deno), SpiderMonkey (Firefox), JavaScriptCore (Safari).",
      "Host APIs: features the environment adds around the engine. Browsers give DOM, fetch, localStorage; Node gives fs, http, process. Some, like `setTimeout` and `console`, exist in both with similar behaviour.",
      "Every engine implements the ECMAScript specification, so the language works the same everywhere; differences come from the host APIs and engine optimisations.",
    ],
    snapshot: {
      title: "Two runtimes, one engine",
      panes: [
        ["Browser runtime", ["V8 / SpiderMonkey …", "DOM, fetch, storage", "event loop + queues"]],
        ["Node.js runtime", ["V8", "fs, http, process", "libuv event loop"]],
        ["Shared language", ["ECMAScript spec", "*same JS everywhere", "setTimeout, console"]],
      ],
      caption: "The engine runs the language; the runtime decides which APIs exist. Code using only shared APIs runs in both.",
    },
    animation: {
      title: "Inside a JavaScript runtime",
      nodes: [
        ["code", "Your code", ".js file"],
        ["engine", "JS engine", "V8"],
        ["apis", "Host APIs", "DOM / fs"],
        ["loop", "Event loop", "+ queues"],
      ],
      steps: [
        ["code", "engine", "execute", "The engine parses and runs your code on its call stack."],
        ["engine", "apis", "call API", "Calls like setTimeout or fs.readFile go to the host APIs."],
        ["apis", "loop", "callback", "When an API finishes, its callback is placed in a queue."],
        ["loop", "engine", "run cb", "The event loop hands the callback back to the engine to execute."],
      ],
    },
    code: `// Detect which runtime is running this code.
const runtime =
  typeof window !== "undefined" ? "browser" :
  typeof process !== "undefined" && process.versions?.node ? "node" : "other";
console.log("runtime:", runtime);

// Shared APIs exist in both:
console.log("setTimeout:", typeof setTimeout, "| console:", typeof console);

// Language features are the same everywhere:
console.log([3, 1, 2].toSorted(), Object.hasOwn({ a: 1 }, "a"));

// Host-specific APIs differ:
console.log("document:", typeof document, "| process:", typeof process);`,
    walkthrough:
      "Under Node.js the output reports `node`, shows that `document` does not exist and `process` does. Press Run in the playground and the same code reports the browser, with `document` available and `process` missing. Language features like `toSorted` work in both, because both use spec-compliant engines.",
    deepDive: [
      {
        heading: "Popular engines",
        points: [
          "V8 (Google): Chrome, Edge, Node.js, Deno.",
          "SpiderMonkey (Mozilla): Firefox; the first JavaScript engine, by Brendan Eich.",
          "JavaScriptCore (Apple): Safari, Bun.",
          "Chakra was used by old Edge; Hermes is optimised for React Native.",
        ],
      },
      {
        heading: "The engine is not a machine",
        paragraphs: [
          "A JavaScript engine is ordinary software, mostly written in C++. It takes human-readable JavaScript and turns it into something the CPU can execute. The next lessons open it up: parsing, compilation and garbage collection.",
        ],
      },
    ],
    mistakes: [
      "Writing code that uses `window` or `document` in shared utilities and wondering why it crashes on the server (SSR).",
      "Mixing up the engine (runs the language) and the runtime (engine + APIs + event loop).",
    ],
    interview: [
      ["What is a JavaScript runtime environment?", "Everything required to run JavaScript: a JS engine plus host APIs, an event loop and the task and microtask queues. Browsers and Node.js are runtimes."],
      ["Name some JavaScript engines.", "V8 (Chrome, Node), SpiderMonkey (Firefox), JavaScriptCore (Safari) and Hermes (React Native)."],
      ["Why can the same JavaScript run on the browser and Node?", "Both engines implement the ECMAScript specification; only host APIs (DOM vs fs/http) differ."],
    ],
    exercise:
      "Write a `isBrowser()` helper that is safe to call in Node, Deno and the browser.",
    answer:
      "`const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';` — `typeof` never throws for undeclared globals.",
  }),

  "nj-event-loop--parsing-ast-and-jit-compilation": njs({
    intro:
      "Inside the engine, code goes through three phases: parsing, compilation and execution. Parsing turns source text into tokens and then into an Abstract Syntax Tree (AST). Compilation turns the AST into something executable. Modern engines use Just-In-Time (JIT) compilation: an interpreter starts running bytecode quickly while an optimising compiler turns hot code into fast machine code in the background.",
    concepts: [
      "Parsing: the tokenizer breaks code into tokens (`let`, `a`, `=`, `7`); the syntax parser builds an AST, a tree describing the program's structure. Syntax errors are found here.",
      "Interpreter vs compiler: an interpreter executes line by line (fast start); a compiler translates everything first (fast execution). JavaScript engines combine both: JIT compilation.",
      "Optimisation is speculative. The engine assumes types it has observed (e.g. `add` always gets numbers); if an assumption breaks, it deoptimises back to bytecode.",
    ],
    snapshot: {
      title: "From source to execution",
      panes: [
        ["Parsing", ["let a = 7", "→ tokens", "*→ AST"]],
        ["Compilation", ["AST → bytecode", "hot code →", "*optimised machine code"]],
        ["Execution", ["call stack", "memory heap", "garbage collector"]],
      ],
      caption: "Parse once, start interpreting bytecode quickly, then optimise the parts that run often.",
    },
    animation: {
      title: "Just-in-time compilation",
      nodes: [
        ["src", "Source", "let a = 7"],
        ["ast", "AST", "parser output"],
        ["interp", "Interpreter", "bytecode"],
        ["opt", "Optimizer", "machine code"],
        ["exec", "Execution", "call stack"],
      ],
      steps: [
        ["src", "ast", "parse", "The tokenizer and parser turn source text into an abstract syntax tree."],
        ["ast", "interp", "bytecode", "The interpreter converts the AST to bytecode and starts executing right away."],
        ["interp", "opt", "hot code", "Functions that run often, with stable types, are sent to the optimiser."],
        ["opt", "exec", "fast", "Optimised machine code replaces the bytecode for those functions."],
        ["opt", "interp", "deopt", "If a type assumption breaks, the engine falls back to bytecode."],
      ],
    },
    code: `// A tiny tokenizer + parser for "let name = number;" to show what parsing produces.
function tokenize(source) {
  return source.match(/[A-Za-z_]\\w*|\\d+|[=;]/g);
}

function parse(tokens) {
  const [kind, name, eq, value, semi] = tokens;
  if (kind !== "let" || eq !== "=" || semi !== ";") throw new SyntaxError("Unexpected token");
  return {
    type: "VariableDeclaration",
    kind,
    declarations: [{ type: "VariableDeclarator", id: { type: "Identifier", name }, init: { type: "Literal", value: Number(value) } }],
  };
}

const tokens = tokenize("let a = 7;");
console.log("tokens:", tokens);
const ast = parse(tokens);
console.log("AST:", ast.type, ast.kind, ast.declarations[0].id.name, "=", ast.declarations[0].init.value);

try { parse(tokenize("let = 7;")); } catch (e) { console.log(e.name + ":", e.message); }

// A monomorphic hot function: same argument types every time, easy to optimise.
function add(x, y) { return x + y; }
let total = 0;
for (let i = 0; i < 100000; i++) total = add(total, 1);
console.log("hot loop total:", total);`,
    walkthrough:
      "`tokenize` splits the source into five tokens; `parse` checks the grammar and builds a tiny AST with the same shape real parsers produce (try astexplorer.net with the real parser). An invalid statement fails during parsing with a SyntaxError, which is why syntax errors stop a script before anything runs. The `add` loop is the kind of hot, type-stable code a JIT optimises.",
    deepDive: [
      {
        heading: "Interpreted or compiled?",
        paragraphs: [
          "Both. Early engines were pure interpreters. Since V8 (2008) brought JIT compilation, every major engine compiles at runtime. 'Interpreted vs compiled' depends on the engine, not on the language.",
        ],
      },
      {
        heading: "Write code engines can optimise",
        points: [
          "Keep argument types consistent for hot functions.",
          "Create objects with the same property order (same 'hidden class' / shape).",
          "Avoid adding and deleting properties on hot objects.",
          "Avoid `eval` and `with`, which defeat static analysis.",
        ],
      },
    ],
    mistakes: [
      "Claiming JavaScript is 'just interpreted'. Modern engines JIT-compile it.",
      "Micro-optimising before measuring; engines change, profiles do not lie.",
    ],
    interview: [
      ["What are the phases inside a JS engine?", "Parsing (tokens → AST), compilation (AST → bytecode, hot code → optimised machine code) and execution (call stack, memory heap, garbage collection)."],
      ["What is an AST?", "An abstract syntax tree: a tree representation of the program's grammatical structure produced by the parser and consumed by the compiler/interpreter."],
      ["What is JIT compilation?", "Compiling code while the program runs: start with an interpreter for fast startup, profile, then compile frequently-run code into optimised machine code."],
    ],
    exercise:
      "Why might `add(1, 2)` called 10,000 times, then `add('1', 2)` once, make that function slower for a moment?",
    answer:
      "The optimiser specialised `add` for numbers. The string argument breaks that assumption, so the engine deoptimises back to bytecode (and may re-optimise later for the mixed types).",
  }),

  "nj-event-loop--v8-architecture-and-garbage-collection": njs({
    intro:
      "V8 is Google's JavaScript engine, used in Chrome and Node.js. Its pipeline has a parser that builds the AST, the Ignition interpreter that produces and runs bytecode, and the TurboFan optimising compiler that turns hot functions into machine code (newer V8 versions add mid-tier compilers such as Sparkplug and Maglev). Memory is managed by the Orinoco garbage collector, which uses mark-and-sweep on an Oilpan-style heap.",
    concepts: [
      "Ignition: V8's interpreter. It turns the AST into compact bytecode and executes it, collecting type feedback as it goes.",
      "TurboFan: V8's optimising compiler. It uses the feedback to generate fast machine code for hot functions and deoptimises when assumptions fail.",
      "Garbage collection: memory is allocated in the heap; the collector frees unreachable objects using mark-and-sweep, with a generational split (young objects collected often, old objects less often) and concurrent/incremental work to avoid long pauses.",
    ],
    snapshot: {
      title: "V8 pipeline and heap",
      panes: [
        ["Pipeline", ["Parser → AST", "*Ignition (bytecode)", "Sparkplug / Maglev", "*TurboFan (optimised)"]],
        ["Heap", ["young gen: new objs", "old gen: survivors", "Orinoco GC"]],
        ["Mark and sweep", ["1 mark from roots", "2 sweep unmarked", "3 compact (optional)"]],
      ],
      caption: "Code flows down the pipeline as it gets hotter. Objects that survive young-generation collections are promoted to the old generation.",
    },
    animation: {
      title: "Mark and sweep",
      nodes: [
        ["roots", "Roots", "global, stack"],
        ["a", "user object", "reachable"],
        ["b", "orders array", "reachable"],
        ["c", "old cache", "unreachable"],
        ["gc", "Sweeper", "frees"],
      ],
      steps: [
        ["roots", "a", "mark", "The collector starts at the roots and marks the user object it references."],
        ["a", "b", "mark", "It follows references from user and marks the orders array too."],
        ["c", "c", "unmarked", "The old cache has no path from any root, so it stays unmarked."],
        ["c", "gc", "sweep", "The sweep phase frees every unmarked object."],
        ["gc", "roots", "done", "Memory is returned and allocation continues."],
      ],
    },
    code: `// Objects become garbage when no path from a root reaches them.
// (In Node, compare process.memoryUsage().heapUsed before and after; in Chrome, use
// the Memory panel's heap snapshot.)
let cache = [];
for (let i = 0; i < 200000; i++) cache.push({ id: i, label: "item-" + i });
console.log("cache entries:", cache.length);

cache = null;                       // drop the only reference: now collectable
console.log("cache reachable from a root?", cache !== null);

// A reference cycle is still collectable when unreachable from roots:
let a = { name: "a" };
let b = { name: "b", partner: a };
a.partner = b;
a = b = null;                       // the cycle is now unreachable
console.log("cycle dropped: mark-and-sweep never marks it");`,
    walkthrough:
      "Building 200,000 objects takes several megabytes of heap (a heap snapshot shows them). Setting `cache` to null removes the only path from a root to that array, so the next collection can sweep all of it. The cycle example shows why mark-and-sweep (unlike naive reference counting) has no problem with cycles: unreachable is unreachable.",
    deepDive: [
      {
        heading: "Hidden classes and inline caches",
        paragraphs: [
          "V8 gives objects with the same property layout the same hidden class (shape). Inline caches remember the shape seen at each property access, so `point.x` becomes a fixed-offset load. Changing shapes at a hot site (polymorphism) makes those caches slower.",
        ],
        code: `function Point(x, y) { this.x = x; this.y = y; } // same shape every time
const p1 = new Point(1, 2), p2 = new Point(3, 4);`,
      },
      {
        heading: "Garbage collection algorithms",
        points: [
          "Mark and sweep: mark reachable objects from the roots, sweep the rest.",
          "Scavenger (young generation): copies live objects between two semi-spaces; very fast for short-lived objects.",
          "Mark-compact (old generation): also moves objects together to reduce fragmentation.",
          "Concurrent, parallel and incremental marking keep pauses short.",
        ],
      },
    ],
    mistakes: [
      "Calling `delete` on properties of hot objects, which changes their shape; set to `undefined` or use a Map.",
      "Assuming setting a variable to null frees memory immediately; it only makes it eligible for the next collection.",
    ],
    interview: [
      ["Describe V8's architecture.", "The parser builds an AST; Ignition generates and runs bytecode while collecting type feedback; faster tiers (Sparkplug, Maglev, TurboFan) compile hot functions to machine code; the Orinoco GC manages the heap."],
      ["What is mark and sweep?", "A garbage collection algorithm: mark every object reachable from the roots, then sweep (free) all unmarked objects."],
      ["What is generational garbage collection?", "Splitting the heap into a young generation (collected often and cheaply) and an old generation (survivors, collected less often), since most objects die young."],
    ],
    exercise:
      "Why does `const o = {}; o.a = 1; o.b = 2;` in one place and `const o = {}; o.b = 2; o.a = 1;` in another matter to V8?",
    answer:
      "Property order defines the hidden class, so the two objects get different shapes. Code that handles both at the same site becomes polymorphic and its inline caches are less effective.",
  }),

  "nj-event-loop--trust-issues-with-settimeout": njs({
    intro:
      "`setTimeout(cb, 5000)` does not guarantee that `cb` runs after exactly 5 seconds. It guarantees at least 5 seconds. The timer API waits 5 seconds and then queues the callback, but the callback can only run when the call stack is empty. If the main thread is busy with other code, the callback waits in the queue, however long that takes.",
    concepts: [
      "The delay is a minimum, not an exact time. Expiry only moves the callback into the callback queue.",
      "Concurrency model: JavaScript runs one thing at a time. A long synchronous task delays every queued callback, including timers that have long expired.",
      "Browsers also clamp delays: nested timers (depth 5+) get at least ~4 ms, and timers in background tabs can be throttled to once per second or less.",
    ],
    snapshot: {
      title: "Timer expired, but the stack is busy",
      panes: [
        ["Call stack", ["*blocking loop (300ms)", "Global EC"]],
        ["Timer API", ["50ms elapsed ✓", "expired at t=50"]],
        ["Callback queue", ["*cb waiting…", "runs at t≈300"]],
      ],
      caption: "The callback was ready at 50 ms but had to wait for the 300 ms loop to finish and the stack to empty.",
    },
    animation: {
      title: "Why the timer runs late",
      nodes: [
        ["code", "Global code", "300ms loop"],
        ["timer", "Timer API", "50ms"],
        ["queue", "Callback queue", "cb waits"],
        ["stack", "Call stack", "busy"],
      ],
      steps: [
        ["code", "timer", "setTimeout", "The timer is set for 50 ms and starts counting."],
        ["code", "stack", "block", "The code then runs a loop that keeps the stack busy for 300 ms."],
        ["timer", "queue", "expired", "At 50 ms the timer expires and queues the callback."],
        ["queue", "queue", "waiting", "The event loop cannot push it while the stack is not empty."],
        ["queue", "stack", "≈300ms", "After the loop, the callback finally runs, about 250 ms late."],
      ],
    },
    code: `const start = Date.now();

setTimeout(() => {
  const waited = Date.now() - start;
  console.log("asked for 50ms, actually waited ≥ 300ms:", waited >= 300);
  console.log("ran late by at least 250ms:", waited - 50 >= 250);
}, 50);

// Block the main thread for 300ms.
let spins = 0;
while (Date.now() - start < 300) spins++;
console.log("blocking loop finished");`,
    walkthrough:
      "The timer expires at 50 ms, but the synchronous loop holds the call stack until 300 ms. 'blocking loop finished' prints first; only then can the event loop run the callback, which measures that it waited at least 300 ms. The printed booleans make the result deterministic on any machine.",
    deepDive: [
      {
        heading: "Never block the main thread",
        paragraphs: [
          "The browser renders and handles input on the same thread. A 300 ms loop freezes animations, scrolling and clicks for 300 ms. Long work belongs in a Web Worker, or in small chunks scheduled with `setTimeout`, `requestIdleCallback` or `scheduler.postTask`.",
        ],
      },
      {
        heading: "Timer clamping and throttling",
        points: [
          "Nested `setTimeout` beyond depth 5 is clamped to at least 4 ms.",
          "Inactive tabs throttle timers (often to 1 s; heavily after minutes in the background).",
          "`setInterval` does not 'catch up' missed ticks reliably; compute elapsed time from `Date.now()` or `performance.now()`.",
        ],
      },
    ],
    mistakes: [
      "Using `setTimeout` as a precise clock (countdowns, animations); drift accumulates. Use timestamps and `requestAnimationFrame`.",
      "Doing heavy synchronous work right after scheduling a timer and expecting it on time.",
    ],
    interview: [
      ["Does setTimeout(cb, 5000) run cb exactly after 5 seconds?", "No. After at least 5 seconds. When the timer expires the callback goes to the callback queue and only runs once the call stack is empty, so busy code delays it further."],
      ["Why can a timer callback be delayed?", "Because the main thread may be busy with long synchronous code or other tasks and microtasks; plus browser clamping and background-tab throttling."],
      ["What is the JavaScript concurrency model?", "A single-threaded event loop with run-to-completion semantics: one piece of code runs at a time, and queued callbacks run only when the stack is empty."],
    ],
    exercise:
      "You need a countdown that shows seconds left accurately even if the tab was busy. How?",
    answer:
      "Store the end time (`const end = Date.now() + 60000`) and on every tick compute `Math.ceil((end - Date.now()) / 1000)`. Ticks can be late, but the displayed value is always derived from real elapsed time.",
  }),

  "nj-event-loop--settimeout-zero-and-blocking-the-main-thread": njs({
    intro:
      "`setTimeout(cb, 0)` does not mean 'run now'. It means 'run as soon as possible, after the current code and all microtasks are done'. That makes it useful for deferring less important work, letting the browser breathe between chunks of a long job, and running code after the current event handler finishes. It is also the clearest proof that timers always go through the queue.",
    concepts: [
      "Zero delay still goes through the timer API and the callback queue, so the callback waits for the call stack (and microtask queue) to be empty.",
      "Use it to defer work: let urgent code finish first, then do non-critical work in a later task.",
      "Chunking: split a long loop into pieces, each scheduled with `setTimeout(…, 0)`, so the browser can render and handle input between them.",
    ],
    snapshot: {
      title: "Order with setTimeout 0",
      panes: [
        ["Call stack", ["*Global: logs A, C"]],
        ["Microtasks", ["promise → B2"]],
        ["Callback queue", ["timeout 0 → B1", "chunk 2", "chunk 3"]],
      ],
      caption: "Zero-delay callbacks come after all synchronous code and after promise callbacks, then run in order with other tasks.",
    },
    animation: {
      title: "Chunking a long job",
      nodes: [
        ["job", "Big job", "3 chunks"],
        ["stack", "Call stack", "one chunk"],
        ["queue", "Callback queue", "next chunk"],
        ["paint", "Browser", "render, input"],
      ],
      steps: [
        ["job", "stack", "chunk 1", "The first chunk runs and schedules the next with setTimeout 0."],
        ["stack", "paint", "yield", "Between tasks the browser can render and process clicks."],
        ["queue", "stack", "chunk 2", "The event loop runs the next chunk from the callback queue."],
        ["stack", "queue", "schedule", "Each chunk schedules the following one until the job is done."],
        ["queue", "paint", "finished", "The page stayed responsive the whole time."],
      ],
    },
    code: `console.log("A: sync start");
setTimeout(() => console.log("B1: setTimeout 0"), 0);
Promise.resolve().then(() => console.log("B2: promise microtask"));
console.log("C: sync end");

// Chunk a long job so other tasks can run in between.
function processInChunks(items, chunkSize, onDone) {
  let index = 0, sum = 0, chunks = 0;
  function nextChunk() {
    const end = Math.min(index + chunkSize, items.length);
    for (; index < end; index++) sum += items[index];
    chunks++;
    if (index < items.length) setTimeout(nextChunk, 0);   // yield between chunks
    else onDone(sum, chunks);
  }
  nextChunk();
}

const numbers = Array.from({ length: 30000 }, (_, i) => i + 1);
processInChunks(numbers, 10000, (sum, chunks) => console.log("sum:", sum, "in", chunks, "chunks"));
setTimeout(() => console.log("an unrelated task ran between chunks"), 0);`,
    walkthrough:
      "A and C are synchronous. The promise callback (B2) beats the zero-delay timer (B1). The chunked job runs its first chunk synchronously, then schedules chunk 2 as a task; the unrelated timer queued just after slips in between chunks, which is exactly the responsiveness chunking buys. The final sum of 1..30000 is 450015000.",
    deepDive: [
      {
        heading: "Better tools for yielding",
        points: [
          "`requestAnimationFrame`: run just before the next paint (visual updates).",
          "`requestIdleCallback`: run when the browser is idle (low-priority work).",
          "`scheduler.postTask` / `scheduler.yield()`: prioritised scheduling where supported.",
          "Web Workers: move CPU-heavy work off the main thread entirely.",
        ],
      },
      {
        heading: "Deferring until after the current handler",
        code: `input.addEventListener("keydown", () => {
  setTimeout(() => {
    console.log(input.value); // value already includes the new key
  }, 0);
});`,
        paragraphs: ["Inside `keydown`, the input has not been updated yet. Deferring by one task reads the value after the browser applied the key."],
      },
    ],
    mistakes: [
      "Using `setTimeout(fn, 0)` to 'fix' race conditions without understanding the order; it often hides the real bug.",
      "Assuming `setTimeout(fn, 0)` runs before promise callbacks.",
    ],
    interview: [
      ["What does setTimeout(fn, 0) do?", "It schedules fn as a task to run after the current script and all pending microtasks finish, as soon as the event loop gets to it; it never runs synchronously."],
      ["Why would you use setTimeout with 0 delay?", "To defer non-critical work, to split long tasks into chunks so the UI stays responsive, or to run code after the current event handling completes."],
      ["setTimeout 0 vs Promise.resolve().then?", "The promise callback is a microtask and runs first; setTimeout 0 is a task and runs later."],
    ],
    exercise:
      "Why does chunking with `queueMicrotask` instead of `setTimeout(…, 0)` not keep the page responsive?",
    answer:
      "Microtasks all run before the browser can render or handle the next task, so chunks scheduled as microtasks run back to back and block the page just like one long loop.",
  }),
};
