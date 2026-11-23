// Season 2, episode 6: the this keyword in every context, call/apply/bind, bind polyfill.
import { njs } from "./schema.js";

export const thisLessons = {
  "nj-this--this-in-global-scope-and-functions": njs({
    intro:
      "`this` is decided by how and where code runs, not by where it is written (arrow functions are the exception). In the global scope of a browser script, `this` is the global object `window`. Inside a regular function the value depends on strict mode and on how the function is called: called plainly, `this` is `undefined` in strict mode, but in sloppy mode 'this substitution' replaces `undefined`/`null` with the global object.",
    concepts: [
      "Global space: `this` is the global object (`window` in browsers, `globalThis` in general; `module.exports` in CommonJS files, `undefined` in ES modules).",
      "Inside a function in strict mode, `this` is whatever the call provides; a plain call `x()` provides nothing, so `this` is `undefined`. In non-strict mode, this substitution turns `undefined` or `null` into `globalThis`.",
      "The same function gives different `this` values depending on the call: `x()` → undefined (strict) / window (sloppy), `window.x()` → window, `obj.x()` → obj.",
    ],
    snapshot: {
      title: "Value of this by context (browser)",
      panes: [
        ["Global scope", ["*this → window"]],
        ["function x() (sloppy)", ["x() → window", "(this substitution)"]],
        ["function x() (strict)", ["*x() → undefined", "window.x() → window"]],
      ],
      caption: "Strict mode removes this substitution, so a plain call leaves this undefined. Calling through an object sets this to that object.",
    },
    animation: {
      title: "How the call decides this",
      nodes: [
        ["fn", "function x()", "same function"],
        ["plain", "x()", "plain call"],
        ["win", "window.x()", "via object"],
        ["strict", "strict mode", "undefined"],
        ["sloppy", "sloppy mode", "→ globalThis"],
      ],
      steps: [
        ["plain", "fn", "no receiver", "A plain call passes no object to the function, so this starts as undefined."],
        ["fn", "strict", "keep", "In strict mode undefined is kept: this is undefined."],
        ["fn", "sloppy", "substitute", "In sloppy mode, this substitution replaces undefined with the global object."],
        ["win", "fn", "receiver", "Calling window.x() passes window as the receiver, so this is window in both modes."],
      ],
    },
    code: `// Paste into a browser console (classic script, not a module).
console.log("global:", this === window);

function sloppy() { return this; }
console.log("sloppy x():", sloppy() === window);

function strict() { "use strict"; return this; }
console.log("strict x():", strict());
console.log("strict via window:", window.strict === strict && strict.call(window) === window);

console.log("globalThis:", globalThis === window);`,
    mode: "browser",
    sample: "global: true\nsloppy x(): true\nstrict x(): undefined\nstrict via window: true\nglobalThis: true",
    walkthrough:
      "At the top level `this` is `window`. The sloppy function called plainly gets `window` through this substitution. The strict function called plainly gets `undefined`. Global function declarations are properties of `window`, so calling it through `window` (here via `call`) makes `this` the window.",
    deepDive: [
      {
        heading: "this outside the browser",
        code: `// node file.cjs  (CommonJS)
console.log(this);               // {}  (module.exports)
function f() { return this; }
f() === globalThis;              // true (sloppy)

// node file.mjs or <script type="module">
console.log(this);               // undefined`,
      },
      {
        heading: "Why strict mode is the better default",
        points: [
          "No accidental writes to the global object through `this.something = …` in plain calls.",
          "Classes and ES modules are always strict.",
          "A `TypeError: Cannot read properties of undefined` from `this` is easier to debug than silently using `window`.",
        ],
      },
    ],
    mistakes: [
      "Assuming `this` inside a function means 'the function itself'.",
      "Testing `this` in a module or Node file and expecting `window` behaviour.",
    ],
    interview: [
      ["What is this in the global scope?", "The global object: window in browsers (globalThis in general). In ES modules it is undefined; in CommonJS it is module.exports."],
      ["What is this inside a regular function?", "It depends on the call. Called plainly, it is undefined in strict mode; in non-strict mode this substitution makes it the global object."],
      ["What is this substitution?", "The non-strict mode rule that replaces a this value of undefined or null with the global object (and boxes primitives)."],
    ],
    exercise:
      "In a browser, what do `(function () { return this; })()` and `(function () { 'use strict'; return this; })()` return?",
    answer:
      "The first returns `window` (sloppy mode substitutes the global object). The second returns `undefined`.",
  }),

  "nj-this--this-in-object-methods": njs({
    intro:
      "When a function is a property of an object it is called a method, and when you call it with dot (or bracket) syntax, `this` inside it is the object before the dot. That is implicit binding. The binding happens at call time, so if you take the method off the object, store it in a variable and call it plainly, `this` is lost.",
    concepts: [
      "Implicit binding: `obj.method()` sets `this` to `obj`. Nested objects bind to the nearest one: `a.b.method()` sets `this` to `a.b`.",
      "Losing `this`: `const fn = obj.method; fn()` is a plain call, so `this` is `undefined` (strict) or the global object (sloppy). Passing `obj.method` as a callback has the same effect.",
      "Methods defined with shorthand syntax (`method() {}`) or `function` get `this` at call time. Arrow functions as object properties do not; they take `this` from the surrounding scope.",
    ],
    snapshot: {
      title: "Same function, different calls",
      panes: [
        ["student.printName()", ["*this → student", "→ 'Akshay'"]],
        ["detached f()", ["f = student.printName", "this → undefined", "→ TypeError (strict)"]],
        ["as a callback", ["setTimeout(student", "  .printName)", "plain call: this lost"]],
      ],
      caption: "this follows the call, not the definition. Only the call with student before the dot sees student.",
    },
    animation: {
      title: "Implicit binding at the call site",
      nodes: [
        ["obj", "student", "{ name }"],
        ["m", "printName", "method"],
        ["call", "student.print()", "dot call"],
        ["lost", "f()", "plain call"],
      ],
      steps: [
        ["call", "obj", "receiver", "The call student.printName() has student before the dot."],
        ["obj", "m", "this = student", "So this inside printName is student and this.name is Akshay."],
        ["m", "lost", "extract", "Storing the method in a variable keeps the function but not the object."],
        ["lost", "lost", "this lost", "Calling f() plainly gives this = undefined in strict mode."],
      ],
    },
    code: `"use strict";
const student = {
  name: "Akshay",
  printName() {
    return "Name: " + this.name;
  },
  address: {
    city: "Dehradun",
    printCity() { return "City: " + this.city; },  // this = student.address
  },
};

console.log(student.printName());
console.log(student.address.printCity());

const student2 = { name: "Deepika" };
student2.printName = student.printName;          // borrow the method
console.log(student2.printName());

const detached = student.printName;
try {
  detached();
} catch (e) {
  console.log("detached:", e.name + ":", e.message);
}

function runCallback(cb) { return cb(); }        // callbacks are plain calls
try { runCallback(student.printName); } catch (e) { console.log("as callback:", e.name); }

const arrowObject = { name: "Arrow", print: () => typeof this };
console.log("arrow method this is:", arrowObject.print());`,
    walkthrough:
      "`student.printName()` and `student.address.printCity()` bind `this` to the object before the dot. Copying the method to `student2` and calling it there gives 'Deepika', because binding happens at the call. Calling the detached method or passing it as a callback is a plain call, so in strict mode `this` is `undefined` and reading `this.name` throws. The arrow property takes `this` from the module scope, where it is `module.exports`, an object, not `arrowObject`.",
    deepDive: [
      {
        heading: "Fixing lost this",
        code: `setTimeout(() => student.printName(), 0);     // call it as a method
setTimeout(student.printName.bind(student), 0); // bind it permanently`,
        paragraphs: ["Both keep `student` as the receiver; `bind` is covered in the next lesson."],
      },
      {
        heading: "Precedence of this rules",
        points: [
          "`new` binding: `new Fn()` → the new object.",
          "Explicit binding: `call`, `apply`, `bind` → the given object.",
          "Implicit binding: `obj.fn()` → `obj`.",
          "Default binding: plain `fn()` → `undefined` (strict) or `globalThis` (sloppy).",
          "Arrow functions ignore all of the above and use lexical `this`.",
        ],
      },
    ],
    mistakes: [
      "Passing `obj.method` to `setTimeout`, `addEventListener` or `map` and expecting `this` to be `obj`.",
      "Defining object methods as arrow functions.",
    ],
    interview: [
      ["What is this inside an object method?", "The object the method was called on, i.e. the object before the dot at call time (implicit binding)."],
      ["Why does `const f = obj.method; f()` lose this?", "Because this is determined by the call site; f() is a plain call with no receiver, so this is undefined in strict mode or the global object in sloppy mode."],
      ["What is this in `a.b.c.method()`?", "a.b.c, the object immediately before the method name."],
    ],
    exercise:
      "Without `bind`, make `[1, 2].map(student.printName)` work so each call uses `student`.",
    answer:
      "Wrap it: `[1, 2].map(() => student.printName())`. Alternatively pass `student` as map's second argument (`thisArg`): `[1, 2].map(student.printName, student)`.",
  }),

  "nj-this--call-apply-and-bind": njs({
    intro:
      "`call`, `apply` and `bind` let you choose `this` explicitly. `call(thisArg, a, b)` invokes the function immediately with arguments listed one by one. `apply(thisArg, [a, b])` does the same with arguments in an array. `bind(thisArg, a)` does not call anything: it returns a new function with `this` (and optionally the first arguments) permanently fixed. They are the standard tool for method borrowing.",
    concepts: [
      "`fn.call(obj, arg1, arg2)`: invoke the function right now with `this = obj` and the arguments listed comma-separated.",
      "`fn.apply(obj, [arg1, arg2])`: run now, `this = obj`, arguments as an array (handy when you already have an array).",
      "`fn.bind(obj, arg1)`: returns a bound copy to call later. Its `this` cannot be changed again, even by `call` or `apply`. Pre-filled arguments give you partial application.",
    ],
    snapshot: {
      title: "Three ways to set this = name2",
      panes: [
        ["call", ["printFullName", ".call(name2, 'Pune')", "*runs now"]],
        ["apply", ["printFullName", ".apply(name2, ['Pune'])", "*runs now"]],
        ["bind", ["const p = printFullName", "  .bind(name2, 'Pune')", "p() later"]],
      ],
      caption: "call and apply invoke immediately and differ only in how arguments are passed. bind returns a new function.",
    },
    animation: {
      title: "Method borrowing",
      nodes: [
        ["fn", "printFullName", "shared function"],
        ["n1", "name1", "Akshay Saini"],
        ["n2", "name2", "Sachin Tendulkar"],
        ["bound", "bound fn", "this fixed"],
      ],
      steps: [
        ["fn", "n1", "call", "call(name1, …) runs the function with this = name1."],
        ["fn", "n2", "apply", "apply(name2, [args]) runs it with this = name2 and an argument array."],
        ["fn", "bound", "bind", "bind(name2, …) returns a new function with this locked to name2."],
        ["bound", "n2", "later", "Calling the bound function later still uses name2."],
      ],
    },
    code: `const name1 = { firstName: "Akshay", lastName: "Saini" };
const name2 = { firstName: "Sachin", lastName: "Tendulkar" };

function printFullName(hometown, state) {
  return this.firstName + " " + this.lastName + " from " + hometown + ", " + state;
}

console.log("call :", printFullName.call(name1, "Dehradun", "Uttarakhand"));
console.log("apply:", printFullName.apply(name2, ["Mumbai", "Maharashtra"]));

const printSachin = printFullName.bind(name2, "Mumbai");   // this + first arg fixed
console.log("bind :", printSachin("Maharashtra"));
console.log("bind returns a function:", typeof printSachin);

// A bound function's this cannot be overridden:
console.log("rebind attempt:", printSachin.call(name1, "ignored?"));

// apply is handy with arrays; spread is the modern equivalent
const scores = [72, 95, 61];
console.log("max:", Math.max.apply(null, scores), Math.max(...scores));

// Borrowing array methods for array-likes
function joinArgs() { return Array.prototype.join.call(arguments, "-"); }
console.log("borrowed join:", joinArgs("a", "b", "c"));`,
    walkthrough:
      "`call` and `apply` produce the same kind of result immediately; only the argument format differs. `bind` returns a new function with `this = name2` and 'Mumbai' pre-filled; calling it with 'Maharashtra' completes the arguments. Trying to `call` the bound function with `name1` changes nothing about `this`: the extra argument fills the next parameter, `state`. `apply` spreads an array into `Math.max`, and `call` borrows `join` for the array-like `arguments`.",
    deepDive: [
      {
        heading: "Mnemonics",
        points: [
          "call → Comma-separated arguments.",
          "apply → Array of arguments.",
          "bind → Bound copy, called later.",
        ],
      },
      {
        heading: "bind for callbacks and partial application",
        code: `button.addEventListener("click", counter.increment.bind(counter));

const multiply = (a, b) => a * b;
const double = multiply.bind(null, 2);   // this unused, a = 2
double(21);                              // 42`,
        paragraphs: ["Binding with `null` is common when only the pre-filled arguments matter."],
      },
    ],
    mistakes: [
      "Using `bind` when you meant to call immediately, then wondering why nothing happened.",
      "Trying to re-bind a bound function; only the first `bind` sets `this`.",
      "Passing an array to `call` instead of `apply`.",
    ],
    interview: [
      ["Difference between call, apply and bind?", "call and apply invoke the function immediately with an explicit this; call takes arguments individually, apply takes an array. bind returns a new function with this (and optional leading arguments) fixed for later calls."],
      ["What is function borrowing?", "Using a method defined on one object with another object as this, typically via call or apply, e.g. Array.prototype.slice.call(arguments)."],
      ["Can you change this of a bound function?", "No. A bound function's this is fixed; call, apply or another bind cannot change it (new is the only exception)."],
    ],
    exercise:
      "Create `greetIn = greet.bind(user, 'Hindi')` for `function greet(lang, punct) { return this.name + ':' + lang + punct; }` and call it with '!'. What is the result?",
    answer:
      "With `user = { name: 'Akshay' }`, `greetIn('!')` returns `'Akshay:Hindi!'`. `this` is `user`, `lang` was pre-filled, and `punct` comes from the call.",
  }),

  "nj-this--this-in-arrow-functions": njs({
    intro:
      "Arrow functions do not have their own `this`. Inside an arrow, `this` is looked up lexically, exactly like a variable: it is the `this` of the enclosing function or scope at the time the arrow was created. That makes arrows ideal for callbacks inside methods, and wrong as object methods. `call`, `apply` and `bind` cannot change an arrow's `this`.",
    concepts: [
      "Lexical `this`: an arrow written inside a method sees the method's `this`; an arrow written at the top level sees the top-level `this`.",
      "An arrow used directly as an object property does not see the object, because an object literal is not a scope; its `this` comes from the code around the literal.",
      "Explicit binding is ignored: `arrow.call(obj)` or `arrow.bind(obj)` still uses the lexical `this` (the arguments are passed normally).",
    ],
    snapshot: {
      title: "Where each arrow takes this from",
      panes: [
        ["obj = { x: arrow }", ["arrow's scope: module", "*this ≠ obj"]],
        ["method() { arrow }", ["arrow's scope: method", "*this = obj"]],
        ["arrow.call(other)", ["call ignored", "this unchanged"]],
      ],
      caption: "An arrow's this is the this of the function it was written in. Object literals don't create a new this.",
    },
    animation: {
      title: "Lexical this lookup",
      nodes: [
        ["outer", "module scope", "this = exports"],
        ["obj", "obj literal", "not a scope"],
        ["method", "method()", "this = obj"],
        ["arrow", "arrow =>", "no own this"],
      ],
      steps: [
        ["arrow", "obj", "look up", "An arrow placed directly in the literal finds no this there."],
        ["obj", "outer", "outer", "It continues to the surrounding scope, so this is not the object."],
        ["arrow", "method", "enclosing", "An arrow created inside method() finds the method's this."],
        ["method", "arrow", "this = obj", "So that arrow sees obj, even when called later as a callback."],
      ],
    },
    code: `"use strict";
const obj = {
  a: 10,
  arrowProp: () => this,                       // lexical: module-level this
  method() {
    const inner = () => this.a;                // lexical: method's this
    return inner();
  },
  delayed() {
    return new Promise((resolve) => setTimeout(() => resolve(this.a * 2), 5));
  },
};

console.log("arrow as property sees obj?", obj.arrowProp() === obj);
console.log("arrow inside method:", obj.method());
obj.delayed().then((value) => console.log("arrow in setTimeout:", value));

// call/apply/bind cannot change an arrow's this
const outerThis = this;
const arrow = () => this;
console.log("call ignored:", arrow.call({ other: true }) === outerThis);

// Regular function inside a method loses this; arrow keeps it
const counter = {
  count: 0,
  regular() { return [1, 2].map(function () { return this; }); },
  arrow() { return [1, 2].map(() => this.count); },
};
console.log("regular callback this:", counter.regular());
console.log("arrow callback this.count:", counter.arrow());`,
    walkthrough:
      "The arrow property returns the module's `this`, not `obj`. The arrow inside `method` uses the method's `this`, giving 10, and the arrow inside `setTimeout` still sees `obj` later (20). `arrow.call(...)` is ignored. In `counter`, the regular callback gets `this = undefined` (strict mode plain call), while the arrow callback reads `counter.count`.",
    deepDive: [
      {
        heading: "Before arrows: that = this",
        code: `const timer = {
  seconds: 0,
  start() {
    const that = this;           // save this in a variable
    setInterval(function () { that.seconds++; }, 1000);
  },
};`,
        paragraphs: ["Arrows replace this pattern: the arrow simply closes over the method's `this` like the old code closed over `that`."],
      },
      {
        heading: "Arrows in classes",
        paragraphs: [
          "A class field like `handleClick = () => { this.count++; }` creates one arrow per instance whose `this` is that instance. It is popular for event handlers that are passed around, at the cost of one function per instance.",
        ],
      },
    ],
    mistakes: [
      "Defining object or prototype methods as arrows and reading `this` inside.",
      "Trying to `bind` an arrow to a different object.",
    ],
    interview: [
      ["What is this inside an arrow function?", "Arrows have no own this; they use the this of the enclosing lexical scope at creation time."],
      ["Why does an arrow function as an object property not see the object?", "An object literal does not create a scope or a this binding, so the arrow takes this from the code surrounding the literal."],
      ["Can call/apply/bind change an arrow function's this?", "No. The thisArg is ignored for arrows (arguments are still passed)."],
    ],
    exercise:
      "Inside `const user = { name: 'Akshay', greetLater() { setTimeout(/* ? */, 10); } }`, write the callback so it logs the name.",
    answer:
      "Use an arrow: `setTimeout(() => console.log(this.name), 10)`. It inherits `greetLater`'s `this`, which is `user` when called as `user.greetLater()`.",
  }),

  "nj-this--this-in-dom-event-handlers": njs({
    intro:
      "When the browser calls an event handler registered with a regular function, it sets `this` to the element the listener is attached to (the same as `event.currentTarget`). Inline HTML handlers like `onclick=\"alert(this)\"` also get the element. Arrow function handlers do not: their `this` is lexical, so use `event.currentTarget` to reach the element.",
    concepts: [
      "`element.addEventListener('click', function () { this })`: `this` is `element`, the one the listener is on, even if the click started on a child.",
      "`event.target` is where the event originated (maybe a child); `event.currentTarget` and `this` are where the listener is attached.",
      "With an arrow handler, `this` comes from the surrounding scope (often `window` or `undefined`). Inline `onclick=\"...\"` attributes run with `this` as the element.",
    ],
    snapshot: {
      title: "Click on <span> inside <button>",
      panes: [
        ["function handler", ["*this → button", "currentTarget → button", "target → span"]],
        ["arrow handler", ["this → outer scope", "currentTarget → button", "target → span"]],
      ],
      caption: "this and currentTarget point to the element with the listener; target points to the innermost element clicked.",
    },
    animation: {
      title: "Who is this in a click handler?",
      nodes: [
        ["span", "<span>", "clicked"],
        ["btn", "<button>", "has listener"],
        ["fn", "function handler", "this = button"],
        ["arr", "arrow handler", "lexical this"],
      ],
      steps: [
        ["span", "btn", "bubble", "The click starts on the span and bubbles up to the button."],
        ["btn", "fn", "invoke", "The browser calls the regular handler with this set to the button."],
        ["btn", "arr", "invoke", "For the arrow handler, the browser's this value is ignored."],
        ["arr", "btn", "currentTarget", "The arrow reaches the button through event.currentTarget instead."],
      ],
    },
    code: `// Run in a browser console on any page.
const button = document.createElement("button");
button.id = "buy";
button.innerHTML = "<span id='label'>Buy now</span>";
document.body.append(button);

button.addEventListener("click", function (event) {
  console.log("function: this is", this.id, "| currentTarget", event.currentTarget.id, "| target", event.target.id);
});

button.addEventListener("click", (event) => {
  console.log("arrow: this is window?", this === window, "| currentTarget", event.currentTarget.id);
});

button.setAttribute("onclick", "console.log('inline: this is', this.id)");

button.querySelector("span").click();   // click the child; the event bubbles to the button
button.remove();`,
    mode: "browser",
    sample:
      "function: this is buy | currentTarget buy | target label\narrow: this is window? true | currentTarget buy\ninline: this is buy",
    walkthrough:
      "Clicking the span bubbles to the button. The regular handler gets `this` = the button, while `event.target` is the span. The arrow handler ignores the browser's `this` and sees the console's top-level `this` (`window`), so it uses `currentTarget`. The inline `onclick` attribute runs with `this` as the button. Handlers run in registration order; the attribute handler was set last.",
    deepDive: [
      {
        heading: "Class components and handlers",
        code: `class Toggle {
  constructor(el) {
    this.on = false;
    el.addEventListener("click", this.toggle);              // this = el (bug)
    el.addEventListener("click", this.toggle.bind(this));   // this = Toggle
    el.addEventListener("click", () => this.toggle());      // this = Toggle
  }
  toggle() { this.on = !this.on; }
}`,
        paragraphs: ["Passing a method directly makes the browser call it with `this` = element. Bind it or wrap it in an arrow to keep the instance."],
      },
      {
        heading: "Prefer currentTarget",
        paragraphs: [
          "`event.currentTarget` works the same in regular and arrow handlers, so many codebases use it everywhere and avoid relying on `this` in handlers.",
        ],
      },
    ],
    mistakes: [
      "Using `event.target` when you want the element with the listener; it can be a child.",
      "Passing class methods as handlers without binding, so `this` becomes the element.",
    ],
    interview: [
      ["What is this inside a DOM event handler?", "For a regular function registered with addEventListener (or an inline handler), this is the element the listener is attached to, i.e. event.currentTarget."],
      ["What is this in an arrow function event handler?", "The this of the enclosing scope, not the element. Use event.currentTarget to get the element."],
      ["Difference between event.target and event.currentTarget?", "target is the element where the event originated; currentTarget is the element whose listener is currently running."],
    ],
    exercise:
      "A list `<ul>` has one click listener for all `<li>` items (delegation). Inside a regular handler, what are `this` and `event.target` when an `<li>` is clicked?",
    answer:
      "`this` (and `currentTarget`) is the `<ul>`, where the listener lives. `event.target` is the clicked `<li>` (or an element inside it, so use `event.target.closest('li')`).",
  }),

  "nj-this--writing-a-bind-polyfill": njs({
    intro:
      "Writing your own `bind` is the classic follow-up to call/apply/bind. A polyfill `Function.prototype.mybind` must return a new function that, when called, invokes the original with the chosen `this` and with both the pre-filled arguments and the arguments of the later call. Building it uses everything from this course: closures, `this`, `apply`, rest parameters and prototypes.",
    concepts: [
      "Put `mybind` on `Function.prototype` so every function has it. Inside it, `this` is the function being bound (because we call it as `fn.mybind(...)`).",
      "Return a closure that remembers the original function, the target object and the pre-filled arguments, and calls `original.apply(target, [...preset, ...later])`.",
      "A complete version also supports `new` on the bound function (ignore the bound `this`, keep the prototype) and rejects non-functions with a TypeError.",
    ],
    snapshot: {
      title: "What mybind's closure remembers",
      panes: [
        ["Closure", ["*fn : printName", "obj : name", "preset : ['Dehradun']"]],
        ["Later call", ["printMyName('UK')", "later : ['UK']"]],
        ["Result", ["fn.apply(obj,", "  ['Dehradun', 'UK'])"]],
      ],
      caption: "The returned function is a closure over the original function, the target object and the preset arguments.",
    },
    animation: {
      title: "Inside mybind",
      nodes: [
        ["fn", "printName", "original"],
        ["mb", "mybind(obj, a)", "on prototype"],
        ["clo", "bound fn", "closure"],
        ["call", "bound('b')", "later call"],
        ["apply", "fn.apply", "obj, [a, b]"],
      ],
      steps: [
        ["fn", "mb", "this = fn", "Calling printName.mybind(...) runs mybind with this = printName."],
        ["mb", "clo", "return", "mybind returns a new function closing over fn, obj and the preset args."],
        ["call", "clo", "args b", "Later the bound function is called with more arguments."],
        ["clo", "apply", "merge", "It merges preset and new arguments and calls fn.apply(obj, merged)."],
      ],
    },
    code: `const name = { firstName: "Akshay", lastName: "Saini" };

function printName(hometown, state) {
  return this.firstName + " " + this.lastName + ", " + hometown + ", " + state;
}

// Basic polyfill
Function.prototype.mybind = function (thisArg, ...preset) {
  const original = this;                                // the function being bound
  if (typeof original !== "function") throw new TypeError("mybind must be called on a function");
  return function (...later) {
    return original.apply(thisArg, [...preset, ...later]);
  };
};

const printMyName = printName.mybind(name, "Dehradun");
console.log("mybind:", printMyName("Uttarakhand"));
console.log("native:", printName.bind(name, "Dehradun")("Uttarakhand"));

// Full polyfill: also works with new
Function.prototype.mybindFull = function (thisArg, ...preset) {
  const original = this;
  function bound(...later) {
    const isNew = this instanceof bound;                 // called with new?
    return original.apply(isNew ? this : thisArg, [...preset, ...later]);
  }
  bound.prototype = Object.create(original.prototype);
  return bound;
};

function Point(x, y) { this.x = x; this.y = y; }
const PointAtX5 = Point.mybindFull({ ignored: true }, 5);
const p = new PointAtX5(9);
console.log("new on bound:", p.x, p.y, p instanceof Point);

try { Function.prototype.mybind.call({}, null); } catch (e) { console.log(e.name + ":", e.message); }

delete Function.prototype.mybind;
delete Function.prototype.mybindFull;`,
    walkthrough:
      "`printName.mybind(name, 'Dehradun')` returns a closure; calling it with 'Uttarakhand' merges the arguments and applies `printName` with `this = name`, matching native `bind`. The full version detects `new` with `instanceof`, so `new PointAtX5(9)` builds a real `Point` with x = 5, y = 9, ignoring the bound object. Calling `mybind` on a non-function throws a TypeError. The prototype additions are removed at the end.",
    deepDive: [
      {
        heading: "Polyfill for call (no apply allowed)",
        code: `Function.prototype.mycall = function (thisArg, ...args) {
  const target = thisArg ?? globalThis;
  const key = Symbol("fn");          // avoid clobbering an existing property
  target[key] = this;                // call as a method → implicit binding
  const result = target[key](...args);
  delete target[key];
  return result;
};`,
        paragraphs: ["Temporarily attaching the function to the object and calling it as a method uses implicit binding to set `this`."],
      },
      {
        heading: "Interview checklist for bind",
        points: [
          "Returns a function, does not call immediately.",
          "Supports preset arguments and later arguments, in that order.",
          "Uses `apply` (or the spread form of `call`).",
          "Bonus: `new` support, `length`/`name` (`bound printName`), TypeError for non-functions.",
        ],
      },
    ],
    mistakes: [
      "Writing `mybind` as an arrow function, so `this` is not the function being bound.",
      "Forgetting the later arguments and only passing the preset ones.",
      "Calling the original immediately inside `mybind` instead of returning a function.",
    ],
    interview: [
      ["Write a polyfill for bind.", "`Function.prototype.mybind = function (obj, ...preset) { const fn = this; return function (...later) { return fn.apply(obj, [...preset, ...later]); }; };`"],
      ["Why must mybind be a regular function?", "Because inside it, this must be the function on which mybind was called (printName.mybind), which only works with call-time this."],
      ["How does the polyfill keep obj and preset arguments for later?", "Through a closure: the returned function references fn, obj and preset from mybind's scope."],
    ],
    exercise:
      "Write `Function.prototype.myapply(thisArg, argsArray)` using your `mycall` idea.",
    answer:
      "`Function.prototype.myapply = function (thisArg, args = []) { const target = thisArg ?? globalThis; const key = Symbol(); target[key] = this; const result = target[key](...args); delete target[key]; return result; };`",
  }),
};
