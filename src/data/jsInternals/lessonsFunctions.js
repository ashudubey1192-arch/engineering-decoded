// function forms, first-class functions, callbacks, event listeners.
import { njs } from "./schema.js";

export const functionLessons = {
  "nj-functions--function-statement-expression-and-declaration": njs({
    intro:
      "JavaScript lets you create a function in several ways, and the names matter in interviews. A function statement and a function declaration are the same thing: a standalone `function name() {}`. A function expression is a function used as a value, usually assigned to a variable. The big practical difference between them is hoisting.",
    concepts: [
      "Function statement / function declaration: `function a() {}` at the start of a statement. It is hoisted in full, so it can be called before its line.",
      "Function expression: `var b = function () {}`. The function is created when the line runs; before that, `b` is just a hoisted variable holding `undefined`.",
      "Both create the same kind of function object. The difference is when the function becomes available and whether the name is a binding in the enclosing scope.",
    ],
    snapshot: {
      title: "Memory after phase 1",
      panes: [
        ["Function statement", ["function a() {…}", "*a : ƒ a (full)", "a() before line ✓"]],
        ["Function expression", ["var b = function(){…}", "*b : undefined", "b() before line ✗"]],
      ],
      caption: "The statement is stored whole during the memory phase; the expression only reserves the variable.",
    },
    animation: {
      title: "Statement vs expression over time",
      nodes: [
        ["mem", "Memory phase", "scan"],
        ["a", "a", "ƒ stored"],
        ["b", "b", "undefined"],
        ["run", "Execution", "line by line"],
        ["bfn", "b = ƒ", "assigned"],
      ],
      steps: [
        ["mem", "a", "declaration", "The function statement a is stored in full during the memory phase."],
        ["mem", "b", "var", "The expression's variable b is reserved with undefined."],
        ["run", "a", "a()", "Calling a() early works because the function already exists."],
        ["run", "b", "b()", "Calling b() early is calling undefined, which throws a TypeError."],
        ["run", "bfn", "assign", "When the assignment line runs, b finally holds the function."],
      ],
    },
    code: `a();                                   // statement: already in memory
try { b(); } catch (e) { console.log(e.name + ":", e.message); }

function a() {                         // function statement (= declaration)
  console.log("a called");
}

var b = function () {                  // function expression
  console.log("b called");
};

b();                                   // works now
console.log(typeof a, typeof b);
console.log("names:", a.name, b.name); // expressions infer the variable name`,
    walkthrough:
      "`a()` works on line 1 because declarations are hoisted in full. `b()` throws `TypeError: b is not a function`, since `b` is still undefined. After the assignment, `b()` works. Both are ordinary functions; the anonymous expression even gets an inferred `name` of `b`.",
    deepDive: [
      {
        heading: "How the parser decides",
        paragraphs: [
          "If a statement begins with the keyword `function`, it is a declaration. If `function` appears anywhere a value is expected (after `=`, inside parentheses, as an argument, after `return`), it is an expression.",
        ],
        code: `function decl() {}                 // declaration
const expr = function () {};        // expression
(function iife() {})();             // expression (inside parentheses)
[1, 2].map(function (n) {});        // expression (argument)`,
      },
      {
        heading: "When to use which",
        points: [
          "Declarations: top-level helpers you want callable anywhere in the file.",
          "Expressions / arrows: callbacks, conditional functions, functions stored in objects or created in loops.",
          "Many teams prefer `const fn = () => {}` to make use-before-definition impossible.",
        ],
      },
    ],
    mistakes: [
      "Calling a function expression before its assignment.",
      "Declaring functions inside `if` blocks and relying on them being hoisted; block-level declarations have murky, environment-dependent rules in sloppy mode.",
    ],
    interview: [
      ["What is a function statement?", "A function created with the `function` keyword at the start of a statement, like `function a() {}`. It is the same as a function declaration and is hoisted in full."],
      ["What is the difference between a function statement and a function expression?", "Hoisting: a statement is created during the memory phase and can be called before its line; an expression is created when its line runs, so its variable is undefined (var) or in the TDZ (let/const) before that."],
      ["Is function declaration different from function statement?", "No, they are two names for the same construct."],
    ],
    exercise:
      "Which of these can run on line 1: `function x(){}`, `const y = function(){}`, `const z = () => {}`?",
    answer:
      "Only `x`. `y` and `z` are expressions assigned to `const`, so before their lines they are in the temporal dead zone and calling them throws a ReferenceError.",
  }),

  "nj-functions--anonymous-and-named-function-expressions": njs({
    intro:
      "An anonymous function is a function without a name. It cannot stand alone as a statement, because the grammar requires a function statement to have a name, but it is perfect wherever functions are used as values. A named function expression gives the function a name that is only visible inside its own body, which helps recursion and stack traces.",
    concepts: [
      "Anonymous function: `function () {}` with no name. As a statement, `function () {}` is a SyntaxError: 'Function statements require a function name'.",
      "Anonymous functions are used as values: assigned to variables, passed as callbacks, returned from functions.",
      "Named function expression: `var b = function xyz() {}`. The name `xyz` exists only inside the function's own scope; calling `xyz()` from outside throws a ReferenceError.",
    ],
    snapshot: {
      title: "Where the name xyz lives",
      panes: [
        ["Outer scope", ["b : ƒ xyz", "xyz : (not here)", "xyz() → ReferenceError"]],
        ["Inside xyz", ["*xyz : ƒ (itself)", "can call xyz()", "for recursion"]],
      ],
      caption: "A named function expression binds its name only inside its own body. Outside, you use the variable b.",
    },
    animation: {
      title: "Named function expression scope",
      nodes: [
        ["outer", "Outer scope", "has b"],
        ["fn", "function xyz", "own scope"],
        ["self", "xyz", "self-reference"],
        ["err", "ReferenceError", "xyz outside"],
      ],
      steps: [
        ["outer", "fn", "b()", "Calling b() runs the function object named xyz."],
        ["fn", "self", "xyz()", "Inside the body, the name xyz refers to the function itself."],
        ["self", "fn", "recurse", "That makes recursion safe even if b is later reassigned."],
        ["outer", "err", "xyz()", "Outside, xyz is not declared, so calling it throws."],
      ],
    },
    code: `try {
  new Function("function () {}");     // anonymous function as a statement
} catch (e) {
  console.log(e.name + ":", e.message);
}

// Anonymous functions are fine as values:
const add = function (x, y) { return x + y; };
console.log("add:", add(2, 3), "| inferred name:", add.name);

// Named function expression:
var b = function xyz(n) {
  return n <= 1 ? 1 : n * xyz(n - 1);   // the name works inside
};
console.log("factorial(5):", b(5), "| name:", b.name);

try {
  xyz(3);                               // not visible outside
} catch (e) {
  console.log(e.name + ":", e.message);
}`,
    walkthrough:
      "Parsing a nameless function statement fails with a SyntaxError. As a value, an anonymous function works, and JavaScript infers its `name` from the variable. The named expression uses `xyz` to recurse; its `name` is `xyz`. Outside, `xyz` was never declared, so calling it throws a ReferenceError.",
    deepDive: [
      {
        heading: "Why name your expressions",
        points: [
          "Stack traces show `xyz` instead of `(anonymous)`, which makes debugging easier.",
          "Safe recursion: the internal name cannot be reassigned from outside.",
          "Self-documenting callbacks: `button.addEventListener('click', function onSaveClick() {...})`.",
        ],
      },
      {
        heading: "Immediately invoked function expressions",
        paragraphs: [
          "Wrapping an anonymous function in parentheses turns it into an expression, which can be invoked immediately. Before block scope and modules, IIFEs were the standard way to create private scope.",
        ],
        code: `(function () {
  const secret = "hidden";
  console.log("IIFE ran");
})();`,
      },
    ],
    mistakes: [
      "Trying to call a named function expression by its inner name from outside.",
      "Writing `function () {}` at statement start and expecting an IIFE; it needs parentheses.",
    ],
    interview: [
      ["What is an anonymous function?", "A function without a name. It is valid only as an expression (a value), for example a callback or an assignment; as a statement it is a SyntaxError."],
      ["What is a named function expression?", "A function expression that has its own name, like `var b = function xyz() {}`. The name is only available inside the function body."],
      ["What happens if you call xyz() outside in that example?", "ReferenceError: xyz is not defined, because xyz is not created in the outer scope."],
    ],
    exercise:
      "In `const fib = function f(n) { return n < 2 ? n : f(n - 1) + f(n - 2); }`, what happens if you later write `const g = fib;` and then reassign... can you reassign `fib`? What does `g(10)` return?",
    answer:
      "`fib` is a `const`, so it cannot be reassigned. `g(10)` returns 55; the recursion uses the internal name `f`, which always refers to the function itself regardless of the variable used to call it.",
  }),

  "nj-functions--parameters-arguments-and-first-class-functions": njs({
    intro:
      "Parameters are the names in a function's definition; arguments are the values passed when you call it. And functions themselves are values: they can be passed as arguments, returned from other functions and stored in variables, arrays and objects. That ability is what 'functions are first-class citizens' (or first-class functions) means, and it is the foundation for callbacks and higher-order functions.",
    concepts: [
      "Parameters are local variables of the function, created in its memory phase. Arguments fill them in order; missing arguments leave parameters `undefined`, extra arguments are ignored (but available via rest parameters).",
      "First-class functions: functions can be assigned to variables, passed into other functions and returned from functions, just like numbers or strings.",
      "A function that takes or returns another function is a higher-order function; the function passed in is a callback.",
    ],
    snapshot: {
      title: "Calling b(1, 2, 3) with b(param1, param2)",
      panes: [
        ["Arguments", ["1", "2", "3 (extra)"]],
        ["Parameters (b's memory)", ["*param1 : 1", "*param2 : 2", "rest : [ 3 ]"]],
        ["First-class uses", ["store: const f = b", "pass: run(b)", "return: () => b"]],
      ],
      caption: "Arguments are values at the call site; parameters are the local variables that receive them inside the function.",
    },
    animation: {
      title: "Passing a function like any other value",
      nodes: [
        ["def", "Definition", "params"],
        ["call", "Call site", "args"],
        ["fn", "Function value", "first-class"],
        ["hof", "Higher-order", "takes a fn"],
      ],
      steps: [
        ["call", "def", "1, 2", "Arguments 1 and 2 are copied into the parameters param1 and param2."],
        ["def", "fn", "is a value", "The function itself is just a value stored in a variable."],
        ["fn", "hof", "pass", "It can be passed as an argument to another function."],
        ["hof", "fn", "return", "And a function can return a new function back."],
      ],
    },
    code: `function b(param1, param2, ...rest) {   // parameters
  return { param1, param2, rest };
}
console.log(b(1, 2, 3, 4));             // arguments
console.log(b(1));                      // missing → undefined

// First-class: store, pass, return
const sayHi = function (name) { return "Hi " + name; };
const tools = [sayHi, (n) => n.toUpperCase()];

function runTwice(fn, value) {          // takes a function
  return fn(fn(value));
}
console.log(runTwice((n) => n * 3, 2));

function makePrefixer(prefix) {         // returns a function
  return (text) => prefix + text;
}
const warn = makePrefixer("[warn] ");
console.log(warn("disk almost full"), "|", tools[1]("first-class"));`,
    walkthrough:
      "`b(1, 2, 3, 4)` fills `param1` and `param2` and collects the rest. `b(1)` leaves `param2` undefined and `rest` empty. Functions are stored in a variable and an array, passed into `runTwice` (2 → 6 → 18), and returned from `makePrefixer`.",
    deepDive: [
      {
        heading: "Default parameters and the arguments object",
        points: [
          "Defaults: `function greet(name = \"guest\") {}` applies when the argument is `undefined`.",
          "`arguments` is an array-like object of all passed values in regular functions; arrow functions do not have it. Prefer rest parameters.",
          "Primitive arguments are copied; object arguments share the reference, so mutating them inside is visible outside.",
        ],
      },
      {
        heading: "Why first-class functions matter",
        paragraphs: [
          "Everything from `addEventListener` to `Array.prototype.map`, Promises, React hooks and middleware pipelines depends on passing functions around. Without first-class functions, there would be no callbacks and no functional programming in JavaScript.",
        ],
      },
    ],
    mistakes: [
      "Passing `fn()` (the result) instead of `fn` (the function) as a callback.",
      "Relying on `arguments` inside arrow functions; it refers to the outer function's arguments, if any.",
    ],
    interview: [
      ["Difference between parameters and arguments?", "Parameters are the identifiers in the function definition (local variables); arguments are the actual values passed at call time."],
      ["What are first-class functions?", "The ability to use functions as values: assign them to variables, pass them as arguments and return them from other functions."],
      ["What does 'functions are first-class citizens' mean?", "The same as first-class functions: functions are treated like any other value in the language."],
    ],
    exercise:
      "Write `compose(f, g)` that returns a function computing `f(g(x))`. What is `compose((n) => n + 1, (n) => n * 10)(4)`?",
    answer:
      "`const compose = (f, g) => (x) => f(g(x));`. The result is 41: `g(4)` is 40, then `f(40)` is 41.",
  }),

  "nj-functions--arrow-functions": njs({
    intro:
      "Arrow functions, introduced in ES6, are a shorter syntax for function expressions: `(a, b) => a + b`. They are more than syntax sugar, though. Arrows do not have their own `this`, `arguments`, `super` or `new.target`; they take those from the surrounding scope. They cannot be used as constructors and have no `prototype`. These differences decide where arrows are the right choice.",
    concepts: [
      "Syntax: a single expression body returns implicitly (`x => x * 2`); a block body needs `return`. Returning an object literal needs parentheses: `() => ({ ok: true })`.",
      "Lexical `this`: an arrow uses the `this` of the code around it, which makes arrows ideal for callbacks inside methods and wrong for object methods that need `this` to be the object.",
      "No `arguments`, not constructible (`new` throws), no `prototype`. Like other expressions, arrows are not hoisted as functions.",
    ],
    snapshot: {
      title: "Regular function vs arrow function",
      panes: [
        ["function", ["own this (call-time)", "has arguments", "new ✓, prototype ✓", "hoisted if declared"]],
        ["arrow =>", ["*lexical this", "no arguments", "new ✗, no prototype", "never hoisted as ƒ"]],
      ],
      caption: "Arrows borrow this and arguments from where they are written. Regular functions get their own when called.",
    },
    animation: {
      title: "Where an arrow gets this from",
      nodes: [
        ["obj", "timer object", "seconds = 0"],
        ["method", "start()", "this = timer"],
        ["arrow", "arrow callback", "no own this"],
        ["reg", "regular callback", "own this"],
      ],
      steps: [
        ["obj", "method", "timer.start()", "Calling the method sets this to the timer object."],
        ["method", "arrow", "lexical", "The arrow callback inherits this from start(), so it sees the timer."],
        ["method", "reg", "own this", "A regular callback gets its own this when called plainly."],
        ["reg", "obj", "lost", "That plain call leaves this undefined in strict mode, so it cannot reach seconds."],
      ],
    },
    code: `"use strict";
const double = (n) => n * 2;                 // implicit return
const toObject = (id) => ({ id });           // object needs parentheses
console.log(double(21), toObject(7));

const timer = {
  seconds: 0,
  startArrow() {
    [1, 2, 3].forEach(() => this.seconds++);  // this = timer (lexical)
    return this.seconds;
  },
  startRegular() {
    try {
      [1, 2, 3].forEach(function () { this.seconds++; }); // own this = undefined
    } catch (e) {
      return e.name + ": " + e.message;
    }
  },
};
console.log("arrow:", timer.startArrow());
console.log("regular:", timer.startRegular());

const Arrow = () => {};
try { new Arrow(); } catch (e) { console.log(e.name + ":", e.message); }
console.log("prototype:", Arrow.prototype);

function regular() { return (() => arguments.length)(); }
console.log("arrow sees outer arguments:", regular("a", "b"));`,
    walkthrough:
      "The arrow callback in `startArrow` uses the method's `this`, so it increments `timer.seconds` to 3. The regular callback gets its own `this`, which is `undefined` in strict mode, so reading `this.seconds` throws. `new Arrow()` fails because arrows are not constructors, and they have no `prototype`. The inner arrow reads the outer function's `arguments`.",
    deepDive: [
      {
        heading: "When not to use arrows",
        points: [
          "Object methods that use `this`: `{ total: 0, add: () => this.total++ }` does not see the object.",
          "Prototype methods and constructors.",
          "DOM handlers that rely on `this` being the element (use `event.currentTarget` instead if you prefer arrows).",
        ],
      },
      {
        heading: "Syntax cheat sheet",
        code: `x => x + 1            // one param, no parens needed
(x, y) => x + y       // several params
() => 42              // none
(x) => { const y = x * 2; return y; }  // block body
() => ({ key: "value" })               // return an object`,
      },
    ],
    mistakes: [
      "Writing `() => { id: 1 }` and getting `undefined`; the braces are parsed as a block with a label.",
      "Using arrows as object methods and then reading `this` inside them.",
    ],
    interview: [
      ["What are the differences between arrow and regular functions?", "Arrows have lexical this and arguments, cannot be used with new, have no prototype, cannot be generators, and have concise syntax with implicit returns."],
      ["What is `this` inside an arrow function?", "Whatever `this` is in the enclosing lexical scope at the time the arrow is created. call, apply and bind cannot change it."],
      ["Are arrow functions hoisted?", "No. They are expressions; only the variable that holds them is hoisted (undefined with var, TDZ with let/const)."],
    ],
    exercise:
      "Fix `const counter = { n: 0, inc: () => { this.n++; return this.n; } };` so `counter.inc()` returns 1.",
    answer:
      "Use method syntax so `this` is set at call time: `inc() { this.n++; return this.n; }`. The arrow version takes `this` from the module/global scope, not the object.",
  }),

  "nj-functions--callback-functions": njs({
    intro:
      "A callback function is a function passed into another function, to be called by it later. Because functions are first-class, `x(function y() {})` hands `y` to `x`, and `x` decides when to call it. Callbacks are how single-threaded, synchronous JavaScript becomes asynchronous: you give `setTimeout`, an event listener or a network API a function, and it 'calls you back' when the work is done.",
    concepts: [
      "A callback is just a function value passed as an argument. The receiving function may call it immediately (synchronous callback, like `array.map`) or later (asynchronous callback, like `setTimeout`).",
      "Asynchronous callbacks let the call stack stay free: `setTimeout` registers the callback and returns at once; the callback runs after the timer expires and the stack is empty.",
      "Never block the main thread. Long synchronous work inside a callback (or anywhere) freezes clicks, rendering and every other callback until it finishes.",
    ],
    snapshot: {
      title: "Call stack around setTimeout(y, 50)",
      panes: [
        ["Call stack now", ["*x(y)", "Global EC"]],
        ["Timer (Web API)", ["y waiting 50ms"]],
        ["Later stack", ["*y()", "(x and Global gone)"]],
      ],
      caption: "x runs and finishes immediately. Only after the stack is empty and the timer expires does y get pushed and run.",
    },
    animation: {
      title: "Synchronous vs asynchronous callback",
      nodes: [
        ["main", "Global code", "calls x(y)"],
        ["x", "x(cb)", "runs cb now"],
        ["timer", "setTimeout", "holds callback"],
        ["queue", "Callback queue", "ready cbs"],
        ["stack", "Call stack", "runs y"],
      ],
      steps: [
        ["main", "x", "x(y)", "x receives y and calls it immediately: a synchronous callback."],
        ["main", "timer", "register", "setTimeout receives another callback and returns at once."],
        ["main", "main", "continue", "The rest of the global code runs without waiting."],
        ["timer", "queue", "expired", "When the timer expires, the callback moves to the callback queue."],
        ["queue", "stack", "event loop", "Once the stack is empty, the event loop pushes the callback and it runs."],
      ],
    },
    code: `const log = [];

function x(callback) {
  log.push("x starts");
  callback("sync");                   // called right now
  log.push("x ends");
}

setTimeout(function timerCallback() { // called later
  log.push("timer callback");
  console.log(log.join(" → "));
}, 50);

x(function y(kind) {
  log.push("y called (" + kind + ")");
});

log.push("global code done");

// Built-in synchronous callbacks:
console.log([1, 2, 3].map((n) => n * 10));`,
    walkthrough:
      "`x` calls `y` synchronously, so 'y called' sits between 'x starts' and 'x ends'. The `setTimeout` callback is registered first but runs last, after all global code finished and 50 ms passed. `map` is a synchronous callback consumer, so its result prints immediately.",
    deepDive: [
      {
        heading: "Blocking the main thread",
        paragraphs: [
          "The browser uses the same thread for JavaScript, rendering and input. A callback that loops for two seconds blocks everything for two seconds. Split work into chunks, move it to a Web Worker, or make it asynchronous.",
        ],
        code: `button.addEventListener("click", () => {
  const end = Date.now() + 2000;
  while (Date.now() < end) {}   // page frozen for 2s — avoid
});`,
      },
      {
        heading: "Callbacks and closures together",
        paragraphs: [
          "A callback usually closes over variables from where it was created. That is how a timer or listener 'remembers' its context when it runs much later.",
        ],
      },
      {
        heading: "Error-first callbacks (Node.js style)",
        code: `readFile("a.txt", (error, data) => {
  if (error) return handle(error);
  use(data);
});`,
        paragraphs: ["Before Promises, Node APIs passed an error as the first callback argument. Promises and async/await replaced most of this style (see the Promises section)."],
      },
    ],
    mistakes: [
      "Passing `callback()` instead of `callback`, which calls it immediately and passes its return value.",
      "Assuming `setTimeout(cb, 0)` runs before the following lines; it always waits for the stack to clear.",
    ],
    interview: [
      ["What is a callback function?", "A function passed as an argument to another function, which is called back at some later point, either immediately (synchronous) or after an async operation (asynchronous)."],
      ["How do callbacks enable asynchronous JavaScript?", "Async APIs accept a callback and return immediately; the runtime does the work and, when done, queues the callback, which the event loop runs once the call stack is empty."],
      ["What does 'blocking the main thread' mean?", "Running long synchronous code so the call stack stays busy, which prevents rendering, input handling and other callbacks from running."],
    ],
    exercise:
      "Predict the order: `setTimeout(() => console.log('A'), 0); [1].forEach(() => console.log('B')); console.log('C');`",
    answer:
      "B, C, A. `forEach` calls its callback synchronously, then C logs, and the timer callback runs only after the stack is empty.",
  }),

  "nj-functions--event-listeners-and-closures": njs({
    intro:
      "`addEventListener` is the classic callback API in the browser: you pass a function, and the browser calls it every time the event happens. Combined with closures, a listener can remember state between clicks without any global variable. This is the 'count clicks' interview question, and it shows closures and callbacks working together.",
    concepts: [
      "`element.addEventListener(\"click\", handler)` registers `handler` with the browser. Your code continues; the handler is called later, once per event, when the call stack is empty.",
      "Wrapping the listener setup in a function gives the handler a private variable through a closure, e.g. a `count` that survives between clicks.",
      "The handler receives an `event` object (`event.type`, `event.target`, `event.currentTarget`), so one handler can serve many elements.",
    ],
    snapshot: {
      title: "Listener closure after three clicks",
      panes: [
        ["Browser", ["button#clickMe", "click → handler"]],
        ["Closure", ["*count : 3", "(private to attach)"]],
        ["Console", ["Button clicked 1", "Button clicked 2", "Button clicked 3"]],
      ],
      caption: "attachEventListeners has returned long ago, but the handler's closure keeps count alive and updates it on every click.",
    },
    animation: {
      title: "Each click reuses the same closure",
      nodes: [
        ["setup", "attach()", "count = 0"],
        ["dom", "Browser DOM", "button"],
        ["queue", "Callback queue", "click event"],
        ["handler", "handler", "closes over count"],
      ],
      steps: [
        ["setup", "dom", "register", "attach() registers the handler with the button and returns."],
        ["dom", "queue", "click", "The user clicks; the browser queues the handler as a task."],
        ["queue", "handler", "run", "The event loop runs the handler once the stack is empty."],
        ["handler", "setup", "count++", "The handler updates count in attach's preserved environment."],
        ["dom", "handler", "again", "The next click runs the same function with the same count."],
      ],
    },
    code: `// Run in a browser console on any page.
function attachEventListeners() {
  let count = 0;                       // private, survives between clicks
  const button = document.createElement("button");
  button.id = "clickMe";
  button.textContent = "Click me";
  button.addEventListener("click", function handler(event) {
    count++;
    console.log("Button clicked", count, "| target:", event.target.id);
  });
  document.body.append(button);
  return button;
}

const button = attachEventListeners();
button.click();                        // simulate three clicks
button.click();
button.click();`,
    mode: "browser",
    sample: "Button clicked 1 | target: clickMe\nButton clicked 2 | target: clickMe\nButton clicked 3 | target: clickMe",
    walkthrough:
      "`attachEventListeners` creates the button, registers `handler` and returns. Each `button.click()` dispatches a click; the browser calls `handler`, which increments the `count` it closed over. No global variable is needed, and no other code can change the count.",
    deepDive: [
      {
        heading: "Event delegation",
        paragraphs: [
          "Instead of one listener per item, attach one listener to a parent and use `event.target.closest(selector)` to find which child was clicked. It saves memory and works for elements added later.",
        ],
        code: `list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (item) select(item.dataset.id);
});`,
      },
      {
        heading: "Bubbling and capturing",
        points: [
          "Events travel down (capturing phase), hit the target, then bubble back up through ancestors.",
          "`addEventListener(type, fn, { capture: true })` listens during the capture phase.",
          "`event.stopPropagation()` stops further propagation; use it sparingly.",
        ],
      },
    ],
    mistakes: [
      "Using a global counter for each listener, which any code can overwrite.",
      "Adding listeners inside a function that runs repeatedly (e.g. every render) without removing old ones.",
    ],
    interview: [
      ["How do you count clicks on a button without a global variable?", "Create the listener inside a function that declares `let count = 0`; the handler closes over count and increments it on each click."],
      ["Is addEventListener synchronous?", "Registering is synchronous; the handler is an asynchronous callback invoked by the browser when the event fires and the call stack is free. (`element.click()` and `dispatchEvent` call handlers synchronously, however.)"],
      ["What is event delegation?", "Handling events for many child elements with one listener on a common ancestor, using event.target to identify the source."],
    ],
    exercise:
      "Change the example so the button disables itself after 5 clicks.",
    answer:
      "Inside the handler: `if (count === 5) { button.disabled = true; }` — `button` is also in the closure, so the handler can reach it.",
  }),

  "nj-functions--removing-event-listeners": njs({
    intro:
      "Event listeners are heavy. Each one keeps its callback alive, and the callback keeps its whole closure alive, so a page that keeps adding listeners and never removes them leaks memory and does duplicate work. Removing a listener requires the exact same function reference, which is why anonymous inline handlers are hard to clean up. Modern options include `{ once: true }` and `AbortController` signals.",
    concepts: [
      "`removeEventListener(type, fn)` only works with the same function object (and same capture flag) that was added. Passing a new arrow with identical code removes nothing.",
      "Garbage collection cannot free a listener's closure while the listener is registered on a living element.",
      "Cleanup tools: keep a reference and call `removeEventListener`, pass `{ once: true }` for one-shot handlers, or pass `{ signal }` and call `controller.abort()` to remove many listeners at once.",
    ],
    snapshot: {
      title: "Why the second remove does nothing",
      panes: [
        ["Registered", ["*handler (ref A)", "() => … (ref B)"]],
        ["remove(handler)", ["matches ref A ✓", "removed"]],
        ["remove(() => …)", ["new ref C ✗", "B stays forever"]],
      ],
      caption: "Listeners are matched by identity. An inline arrow can never be removed because no one holds its reference.",
    },
    animation: {
      title: "Cleaning up with AbortController",
      nodes: [
        ["ctrl", "AbortController", "signal"],
        ["add", "addEventListener", "{ signal }"],
        ["el", "Element", "3 listeners"],
        ["abort", "abort()", "cleanup"],
        ["gc", "GC", "closures freed"],
      ],
      steps: [
        ["ctrl", "add", "signal", "Every listener is added with the same abort signal."],
        ["add", "el", "register", "The element now holds three listeners and their closures."],
        ["abort", "el", "abort", "One abort() call removes all three listeners."],
        ["el", "gc", "unreachable", "With no listener references left, their closures can be collected."],
      ],
    },
    code: `// Node.js also implements EventTarget, so this runs outside the browser too.
const target = new EventTarget();
let calls = 0;

function handler() { calls++; }
target.addEventListener("ping", handler);
target.addEventListener("ping", () => calls++);        // inline: no reference kept

target.dispatchEvent(new Event("ping"));
console.log("after 1st ping:", calls);

target.removeEventListener("ping", handler);           // same reference: removed
target.removeEventListener("ping", () => calls++);     // new function: no effect
target.dispatchEvent(new Event("ping"));
console.log("after 2nd ping:", calls);

// once: removed automatically after the first call
const t2 = new EventTarget();
let onceCalls = 0;
t2.addEventListener("ping", () => onceCalls++, { once: true });
t2.dispatchEvent(new Event("ping"));
t2.dispatchEvent(new Event("ping"));
console.log("once listener ran:", onceCalls);

// AbortController: remove many listeners in one call
const controller = new AbortController();
const t3 = new EventTarget();
let signalCalls = 0;
for (const type of ["a", "b", "c"]) {
  t3.addEventListener(type, () => signalCalls++, { signal: controller.signal });
}
controller.abort();
["a", "b", "c"].forEach((type) => t3.dispatchEvent(new Event(type)));
console.log("after abort:", signalCalls);`,
    walkthrough:
      "The first ping runs both listeners (2). Removing `handler` works; removing a brand-new arrow does nothing, so the second ping adds only 1 (total 3). The `{ once: true }` listener runs a single time. After `controller.abort()`, none of the signal-bound listeners run, so the count stays 0.",
    deepDive: [
      {
        heading: "Cleanup in components",
        paragraphs: [
          "Frameworks give you a place for this. In React, return a cleanup function from `useEffect` that removes the listener (or aborts the controller). Forgetting it leaks a listener on every mount.",
        ],
        code: `useEffect(() => {
  const controller = new AbortController();
  window.addEventListener("resize", onResize, { signal: controller.signal });
  return () => controller.abort();
}, []);`,
      },
      {
        heading: "Why listeners are heavy",
        points: [
          "Each listener holds its function and closure in memory.",
          "Scroll and mousemove listeners can fire dozens of times per second; throttle them.",
          "Removed DOM elements with listeners are usually collected, but references from your code (arrays, caches) keep them alive.",
        ],
      },
    ],
    mistakes: [
      "Removing with a newly created function and assuming it worked.",
      "Adding a listener on every render or route change without cleanup.",
      "Using different `capture` values in add and remove; they must match.",
    ],
    interview: [
      ["Why should you remove event listeners?", "Listeners keep their callbacks and closures in memory and keep doing work. Removing unused ones prevents memory leaks and duplicate handling."],
      ["Why does removeEventListener sometimes not work?", "It needs the exact same function reference and the same capture option. An inline arrow passed again is a different function, so nothing is removed."],
      ["How can AbortController help with listeners?", "Pass `{ signal: controller.signal }` when adding listeners; calling controller.abort() removes all of them at once."],
    ],
    exercise:
      "A modal adds a `keydown` listener on `document` every time it opens. Sketch a fix.",
    answer:
      "Create an `AbortController` when the modal opens, add the listener with its `signal`, and call `abort()` when the modal closes. Alternatively store the handler reference and call `document.removeEventListener('keydown', handler)` on close.",
  }),
};
