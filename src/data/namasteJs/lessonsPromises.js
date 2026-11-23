// Season 2, episodes 1-3: callback hell, inversion of control, promises, chaining, errors.
import { njs } from "./schema.js";

// Simulated e-commerce APIs shared by several examples (small delays keep them quick).
const cartApi = `const cart = ["shoes", "pants", "kurta"];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));`;

export const promiseLessons = {
  "nj-promises--callback-hell": njs({
    intro:
      "Callbacks are how JavaScript handles asynchronous work, but when one async step depends on another, the callbacks nest: create the order, then in its callback proceed to payment, then in that callback show the summary, then update the wallet. Code grows sideways instead of downwards. This structure is called callback hell, or the pyramid of doom, and it is hard to read, hard to change and easy to break.",
    concepts: [
      "Callbacks are essential: without them we could not say 'run this after the API responds'. The problem is not callbacks, it is deeply nested dependent callbacks.",
      "Callback hell / pyramid of doom: every dependent step adds another level of indentation. Error handling must be repeated at every level.",
      "The fix is to flatten the flow: named functions help a little; Promises and async/await (next lessons) solve it properly.",
    ],
    snapshot: {
      title: "The pyramid of doom",
      panes: [
        ["Nesting depth", ["createOrder(cart, …", "  proceedToPayment(…", "    showSummary(…", "      updateWallet(…", "*        ← keeps growing"]],
        ["Problems", ["hard to read", "errors at every level", "hard to reorder steps", "trust issues (IoC)"]],
      ],
      caption: "Each async step lives inside the callback of the previous one, so the code drifts right with every dependency.",
    },
    animation: {
      title: "Dependent async steps",
      nodes: [
        ["order", "createOrder", "API 1"],
        ["pay", "proceedToPayment", "API 2"],
        ["sum", "showSummary", "API 3"],
        ["wal", "updateWallet", "API 4"],
      ],
      steps: [
        ["order", "pay", "orderId", "createOrder calls back with an orderId, and only then can payment start."],
        ["pay", "sum", "paymentInfo", "Inside the payment callback, the summary call is nested one level deeper."],
        ["sum", "wal", "summary", "The wallet update is nested inside the summary callback."],
        ["wal", "order", "pyramid", "Four steps mean four levels of nesting and four places to handle errors."],
      ],
    },
    code: `const cart = ["shoes", "pants", "kurta"];
const steps = [];

// Callback-based APIs (simulated with timers)
function createOrder(cart, callback) {
  setTimeout(() => callback(null, "ORD-" + cart.length), 10);
}
function proceedToPayment(orderId, callback) {
  setTimeout(() => callback(null, { orderId, paid: true }), 10);
}
function showOrderSummary(payment, callback) {
  setTimeout(() => callback(null, "Summary for " + payment.orderId), 10);
}
function updateWallet(callback) {
  setTimeout(() => callback(null, 900), 10);
}

createOrder(cart, function (err, orderId) {
  if (err) return console.log("order failed");
  steps.push("created " + orderId);
  proceedToPayment(orderId, function (err, payment) {
    if (err) return console.log("payment failed");
    steps.push("paid " + payment.paid);
    showOrderSummary(payment, function (err, summary) {
      if (err) return console.log("summary failed");
      steps.push(summary);
      updateWallet(function (err, balance) {
        if (err) return console.log("wallet failed");
        steps.push("wallet " + balance);
        console.log(steps.join(" → "));
      });
    });
  });
});`,
    walkthrough:
      "Each API call is nested in the previous callback because it needs the previous result. The code works and prints the full flow, but four steps already produce four indentation levels and four copies of the error check. Adding a step in the middle means re-indenting everything below it.",
    deepDive: [
      {
        heading: "Flattening with named functions",
        paragraphs: ["Naming each step reduces visual nesting but not the coupling: each function still has to know what comes next."],
        code: `createOrder(cart, onOrder);
function onOrder(err, id) { proceedToPayment(id, onPayment); }
function onPayment(err, p) { showOrderSummary(p, onSummary); }`,
      },
      {
        heading: "The two problems callbacks bring",
        points: [
          "Callback hell: dependent steps nest into a pyramid (this lesson).",
          "Inversion of control: you hand your continuation to someone else's code and trust them to call it correctly (next lesson).",
        ],
      },
    ],
    mistakes: [
      "Forgetting the error check at one nesting level, so failures silently stop the flow.",
      "Adding parallel steps inside a pyramid and making them accidentally sequential.",
    ],
    interview: [
      ["What is callback hell?", "Deeply nested callbacks that arise when each asynchronous step depends on the previous one, producing a pyramid-shaped structure that is hard to read, maintain and handle errors in."],
      ["What is the pyramid of doom?", "Another name for callback hell, describing how the code grows horizontally with each nested callback."],
      ["How do you avoid callback hell?", "Use Promises with chaining or async/await, modularise steps into named functions, and handle errors centrally."],
    ],
    exercise:
      "Add a `sendEmail(summary, callback)` step after `showOrderSummary` in the pyramid. How many lines change, and why is that a problem?",
    answer:
      "You have to insert a new nested level and re-indent `updateWallet` and everything inside it. The change touches unrelated code, which is exactly the maintenance cost of callback hell.",
  }),

  "nj-promises--inversion-of-control": njs({
    intro:
      "Inversion of control is the second, subtler problem with callbacks. When you pass your callback to `createOrder(cart, callback)`, you give control of the rest of your program to `createOrder`. You now trust it to call your callback exactly once, at the right time, with the right arguments, and to report errors. If that code belongs to someone else, any of those assumptions can fail.",
    concepts: [
      "With callbacks, the other code decides when (and whether) your continuation runs. You lose control over your own program flow.",
      "Possible failures: the callback is never called, called twice (double payment!), called too early (synchronously), or called with swallowed errors.",
      "Promises restore control: the async function returns a promise object, and you attach your continuation to it. A promise settles only once and always calls handlers asynchronously.",
    ],
    snapshot: {
      title: "Who controls the next step?",
      panes: [
        ["Callback style", ["createOrder(cart, pay)", "*createOrder owns pay", "may call 0, 1, 2 times"]],
        ["Promise style", ["p = createOrder(cart)", "*you own p.then(pay)", "settles once, async"]],
      ],
      caption: "With a promise, the API only reports a result. You decide what happens next, and the promise guarantees it happens at most once.",
    },
    animation: {
      title: "Handing over vs holding on",
      nodes: [
        ["you", "Your code", "has proceedToPayment"],
        ["api", "createOrder", "third-party"],
        ["cb", "callback", "called by API"],
        ["prom", "Promise", "settles once"],
      ],
      steps: [
        ["you", "api", "callback", "In callback style you pass proceedToPayment into createOrder."],
        ["api", "cb", "×2 ?", "A buggy API might call it twice, charging the customer twice."],
        ["api", "prom", "return", "In promise style the API just returns a promise."],
        ["you", "prom", ".then", "You attach proceedToPayment yourself; it runs at most once."],
      ],
    },
    code: `let charges = 0;
function proceedToPayment(orderId) { charges++; return "charged for " + orderId; }

// A buggy third-party API that calls the callback twice.
function createOrderBuggy(cart, callback) {
  setTimeout(() => { callback("ORD-1"); callback("ORD-1"); }, 5);
}
createOrderBuggy(["shoes"], proceedToPayment);

// The same buggy API wrapped in a promise: resolve can only take effect once.
function createOrderPromise(cart) {
  return new Promise((resolve) => {
    setTimeout(() => { resolve("ORD-2"); resolve("ORD-2"); }, 5);
  });
}
let promiseCharges = 0;
createOrderPromise(["shoes"]).then((orderId) => { promiseCharges++; proceedToPayment(orderId); });

setTimeout(() => {
  console.log("callback style charges:", charges - promiseCharges);
  console.log("promise style charges:", promiseCharges);
}, 50);

// Promises are also always async, even when resolved immediately:
const flow = [];
Promise.resolve("now").then(() => flow.push("then"));
flow.push("sync");
setTimeout(() => console.log("order:", flow.join(", ")), 60);`,
    walkthrough:
      "The buggy API calls the callback twice, so the callback style charges twice. Wrapped in a promise, the second `resolve` is ignored, so the `.then` handler runs once. The last part shows another guarantee: `.then` callbacks never run synchronously, so 'sync' is recorded before 'then'.",
    deepDive: [
      {
        heading: "Promise guarantees",
        points: [
          "A promise settles once: fulfilled or rejected, never both, never twice.",
          "Handlers are always called asynchronously (as microtasks), even if the promise is already settled.",
          "Handlers attached after settlement still run with the stored result.",
          "Exceptions thrown in the executor or a handler become rejections instead of disappearing.",
        ],
      },
      {
        heading: "Callback style with promise semantics",
        paragraphs: [
          "You can protect yourself from callback APIs by wrapping them in a promise (promisify). Node ships `util.promisify` for error-first callbacks.",
        ],
        code: `const createOrderAsync = (cart) =>
  new Promise((resolve, reject) =>
    createOrder(cart, (err, id) => (err ? reject(err) : resolve(id))));`,
      },
    ],
    mistakes: [
      "Trusting third-party callback APIs to call back exactly once.",
      "Mixing callbacks and promises so the same continuation can be triggered from both paths.",
    ],
    interview: [
      ["What is inversion of control in the context of callbacks?", "Passing a callback gives control of your program's continuation to another function, and you must trust it to call your callback correctly (once, at the right time, with correct data)."],
      ["How do promises solve inversion of control?", "The async function returns a promise and you attach handlers yourself; the promise settles only once, is immutable afterwards and always calls handlers asynchronously."],
      ["What happens if resolve is called twice?", "The second call is ignored; a promise's state and value are fixed after the first settlement."],
    ],
    exercise:
      "Wrap `setTimeout` into `delay(ms)` returning a promise, and use it to log 'done' after 100 ms.",
    answer:
      "`const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); delay(100).then(() => console.log('done'));`",
  }),

  "nj-promises--promises": njs({
    intro:
      "A Promise is an object representing the eventual completion or failure of an asynchronous operation. Instead of passing a callback into `createOrder`, `createOrder` returns a promise immediately, initially an empty placeholder. When the data arrives, the promise is filled in, and any handler you attached with `.then` runs automatically. `fetch` is the most familiar API that returns one.",
    concepts: [
      "A promise is a placeholder for a future value: `const promise = createOrder(cart)` returns right away, and the value appears later.",
      "Attach a callback with `promise.then(fn)`. It runs once the promise is fulfilled, and it receives the value. Attaching is not the same as passing control: you decide what runs.",
      "Promise chaining replaces nesting. Each `.then` returns a new promise, so dependent steps line up vertically: `createOrder().then(pay).then(showSummary).then(updateWallet)`.",
    ],
    snapshot: {
      title: "The promise object over time",
      panes: [
        ["Immediately", ["*state: pending", "result: undefined"]],
        ["After the API", ["*state: fulfilled", "result: 'ORD-3'"]],
        ["Handlers", [".then(proceedToPayment)", "runs once with ORD-3"]],
      ],
      caption: "DevTools shows these internal slots when you log a promise. The handler you attached runs when the state turns fulfilled.",
    },
    animation: {
      title: "From placeholder to value",
      nodes: [
        ["call", "createOrder()", "returns promise"],
        ["p", "Promise", "pending"],
        ["api", "API / timer", "working"],
        ["done", "Promise", "fulfilled"],
        ["then", ".then(handler)", "runs"],
      ],
      steps: [
        ["call", "p", "return", "createOrder returns a pending promise immediately."],
        ["p", "then", "attach", "You attach a handler with .then; nothing runs yet."],
        ["api", "done", "resolve", "When the API finishes, it resolves the promise with the order id."],
        ["done", "then", "value", "The fulfilled value is passed to your handler as a microtask."],
      ],
    },
    code: `${cartApi}

function createOrder(cart) {
  return wait(10).then(() => "ORD-" + cart.length);   // returns a promise
}
function proceedToPayment(orderId) {
  return wait(10).then(() => ({ orderId, paid: true }));
}
function showOrderSummary(payment) {
  return wait(10).then(() => "Summary for " + payment.orderId);
}

const promise = createOrder(cart);
console.log("returned immediately:", promise instanceof Promise);

promise
  .then((orderId) => { console.log("order:", orderId); return proceedToPayment(orderId); })
  .then((payment) => { console.log("paid:", payment.paid); return showOrderSummary(payment); })
  .then((summary) => console.log(summary));

// The same data source as fetch would give: a promise you attach to.
const fakeFetch = () => wait(5).then(() => ({ json: () => Promise.resolve({ login: "akshay" }) }));
fakeFetch().then((res) => res.json()).then((data) => console.log("user:", data.login));`,
    walkthrough:
      "`createOrder` returns a promise at once; nothing has happened yet. The chain runs each step when the previous promise fulfils, passing results down. Compare it with the pyramid from Callback Hell: same steps, but flat. `fakeFetch` mirrors `fetch(url).then(res => res.json())`, which resolves twice: once for the response, once for the parsed body.",
    deepDive: [
      {
        heading: "fetch returns a promise",
        code: `const GITHUB_API = "https://api.github.com/users/akshaymarch7";
const user = fetch(GITHUB_API);
console.log(user);              // Promise {<pending>}
user.then((res) => res.json())
    .then((data) => console.log(data.name));`,
        paragraphs: [
          "Logging the promise in Chrome right away shows `pending`; expanding it later may show `fulfilled` because DevTools evaluates lazily. The internal state at the moment of logging was still pending.",
        ],
      },
      {
        heading: "Callbacks vs promises",
        points: [
          "Callback: you pass your function in and lose control (inversion of control).",
          "Promise: you get an object back and attach your function (you keep control).",
          "Promise chains avoid the pyramid; one `.catch` can handle errors for the whole chain.",
        ],
      },
    ],
    mistakes: [
      "Forgetting to `return` the next promise inside `.then`, which breaks the chain's ordering and loses the value.",
      "Nesting `.then` inside `.then` and recreating callback hell.",
    ],
    interview: [
      ["What is a Promise?", "An object representing the eventual completion or failure of an asynchronous operation. It starts pending and later becomes fulfilled with a value or rejected with a reason."],
      ["How do promises improve on callbacks?", "They return control to the caller (no inversion of control), settle only once, and allow flat chaining with centralised error handling instead of nested callbacks."],
      ["What does fetch return?", "A promise that resolves to a Response object; `response.json()` returns another promise for the parsed body."],
    ],
    exercise:
      "Rewrite the callback pyramid from the Callback Hell lesson's `updateWallet` step as one more `.then` in this chain.",
    answer:
      "Add `.then(() => updateWallet())` after the summary step, where `updateWallet` returns a promise (`wait(10).then(() => 900)`), and then `.then((balance) => console.log(balance))`.",
  }),

  "nj-promises--promise-states-and-the-promise-object": njs({
    intro:
      "Every promise has an internal state and an internal result. The state starts as `pending` and becomes either `fulfilled` (success, with a value) or `rejected` (failure, with a reason). Once a promise is fulfilled or rejected it is settled, and it can never change again. That immutability is what makes promises trustworthy to pass around your codebase.",
    concepts: [
      "Three states: `pending` (in progress), `fulfilled` (completed successfully), `rejected` (failed). 'Settled' means fulfilled or rejected.",
      "Two internal slots: `[[PromiseState]]` and `[[PromiseResult]]`. They are not readable properties; you observe them through `.then`, `.catch`, `.finally` or `Promise.allSettled`.",
      "Promise objects are immutable once settled. You can share one promise with many consumers; each `.then` gets the same value, and nobody can change it.",
    ],
    snapshot: {
      title: "State machine of a promise",
      panes: [
        ["pending", ["result: undefined", "*may change once"]],
        ["fulfilled", ["result: value", "→ .then(onFulfilled)", "final"]],
        ["rejected", ["result: reason", "→ .catch(onRejected)", "final"]],
      ],
      caption: "A promise moves from pending to exactly one of the settled states and stays there forever.",
    },
    animation: {
      title: "One transition, then frozen",
      nodes: [
        ["pend", "pending", "no result"],
        ["ful", "fulfilled", "value"],
        ["rej", "rejected", "reason"],
        ["cons", "Consumers", "many .then"],
      ],
      steps: [
        ["pend", "ful", "resolve(v)", "Calling resolve moves the promise to fulfilled with a value."],
        ["pend", "rej", "reject(e)", "Or reject moves it to rejected with a reason instead."],
        ["ful", "ful", "ignored", "Any later resolve or reject call is ignored: the state is final."],
        ["ful", "cons", "same value", "Every handler attached, before or after, receives the same value."],
      ],
    },
    code: `// Observe a promise's state without peeking at internals.
function stateOf(promise) {
  const marker = {};
  return Promise.race([promise, Promise.resolve(marker)]).then(
    (value) => (value === marker ? "pending" : "fulfilled: " + value),
    (reason) => "rejected: " + reason.message,
  );
}

let resolveLater;
const p = new Promise((resolve) => { resolveLater = resolve; });

stateOf(p).then((s) => console.log("1.", s));
setTimeout(() => {
  resolveLater("done");
  resolveLater("again");                  // ignored: already settled
  stateOf(p).then((s) => console.log("2.", s));
}, 10);

const failed = Promise.reject(new Error("network down"));
failed.catch(() => {});                   // handled, so no warning
stateOf(failed).then((s) => console.log("3.", s));

// Many consumers, one immutable result:
const shared = Promise.resolve(42);
Promise.all([shared.then((v) => v), shared.then((v) => v * 2)])
  .then(([a, b]) => console.log("4. consumers saw", a, "and", b));`,
    walkthrough:
      "`stateOf` races the promise against an already-resolved marker: if the marker wins, the promise was still pending. The rejected promise reports its reason immediately (3), and the shared promise gives both consumers 42 (4). After 10 ms, `p` is resolved with 'done' and the second `resolve` is ignored, so check 2 reports `fulfilled: done`.",
    deepDive: [
      {
        heading: "Seeing state in DevTools",
        paragraphs: [
          "Logging a promise in the browser console shows `Promise {<pending>}` or expands to show `[[PromiseState]]: \"fulfilled\"` and `[[PromiseResult]]`. These double-bracket names are spec-internal slots, so code cannot read `promise.PromiseState`.",
        ],
      },
      {
        heading: "Resolved is not always fulfilled",
        paragraphs: [
          "Resolving a promise with another promise makes it follow that promise. It is 'resolved' (locked in) but still pending until the inner promise settles, and it may end up rejected.",
        ],
        code: `const inner = new Promise((_, reject) => setTimeout(() => reject(new Error("x")), 10));
const outer = Promise.resolve(inner); // follows inner → eventually rejected`,
      },
    ],
    mistakes: [
      "Trying to read `promise.state`; use handlers or `allSettled` instead.",
      "Thinking a second `resolve` can 'update' a promise. It cannot; create a new promise or use a different pattern (events, observables).",
    ],
    interview: [
      ["What are the states of a promise?", "pending, fulfilled and rejected. Fulfilled and rejected are both called settled."],
      ["Can a settled promise change its state?", "No. Once fulfilled or rejected, a promise is immutable; further resolve/reject calls are ignored."],
      ["What are [[PromiseState]] and [[PromiseResult]]?", "Internal slots holding the promise's state and its value or rejection reason; DevTools displays them, but they are not accessible properties."],
    ],
    exercise:
      "What does `new Promise((res, rej) => { rej(new Error('a')); res(1); })` end up as?",
    answer:
      "Rejected with Error('a'). The first settlement wins; the later `res(1)` is ignored.",
  }),

  "nj-promises--creating-a-promise": njs({
    intro:
      "As a consumer you call `.then` on promises others give you. As a producer you create them with the Promise constructor: `new Promise((resolve, reject) => { ... })`. The function you pass, the executor, runs immediately and synchronously. Inside it you start the async work and call `resolve(value)` on success or `reject(error)` on failure. This lesson builds `createOrder` and `validateCart` from scratch.",
    concepts: [
      "`new Promise(executor)`: the executor receives two functions, `resolve` and `reject`, provided by JavaScript. It runs synchronously, before the constructor returns.",
      "Call `resolve(value)` to fulfil and `reject(new Error(...))` to reject. Always reject with an `Error` object so you get a message and a stack trace.",
      "If the executor throws, the promise is rejected automatically with that error. Code after `resolve` still runs; `resolve` does not act like `return`.",
    ],
    snapshot: {
      title: "Producer and consumer",
      panes: [
        ["Producer: createOrder", ["new Promise((res, rej) =>", "  if !valid → rej(err)", "  else → res(orderId)", ")"]],
        ["Consumer", ["createOrder(cart)", "  .then(id => …)", "  .catch(err => …)"]],
      ],
      caption: "The producer decides how the promise settles; the consumer decides what happens after.",
    },
    animation: {
      title: "Inside new Promise",
      nodes: [
        ["ctor", "new Promise", "constructor"],
        ["exec", "executor", "runs now"],
        ["check", "validateCart", "true / false"],
        ["res", "resolve(id)", "fulfilled"],
        ["rej", "reject(err)", "rejected"],
      ],
      steps: [
        ["ctor", "exec", "sync", "The constructor calls the executor immediately and synchronously."],
        ["exec", "check", "validate", "The executor validates the cart before doing any async work."],
        ["check", "rej", "invalid", "An invalid cart rejects the promise with an Error."],
        ["check", "res", "valid", "A valid cart starts the async work and later resolves with an order id."],
      ],
    },
    code: `function validateCart(cart) {
  return Array.isArray(cart) && cart.length > 0;
}

function createOrder(cart) {
  const promise = new Promise(function (resolve, reject) {
    console.log("executor runs synchronously for", JSON.stringify(cart));
    if (!validateCart(cart)) {
      const err = new Error("Cart is not valid");
      reject(err);
      return;                              // stop here; resolve is not a return
    }
    setTimeout(() => resolve("ORD-" + 12345), 10);   // simulate the DB call
  });
  return promise;
}

console.log("before");
createOrder(["shoes", "pants"])
  .then((orderId) => console.log("created", orderId))
  .catch((err) => console.log("error:", err.message));

createOrder([])
  .then((orderId) => console.log("created", orderId))
  .catch((err) => console.log("error:", err.message));
console.log("after");

// A throw inside the executor becomes a rejection:
new Promise(() => { throw new TypeError("boom"); })
  .catch((err) => console.log("caught", err.name, err.message));`,
    walkthrough:
      "Both executors log before 'after', proving they run synchronously inside the constructor. The empty cart is rejected right away, so its `.catch` runs in the first microtask round; the valid cart resolves 10 ms later. The final promise shows that throwing in the executor is the same as calling `reject`.",
    deepDive: [
      {
        heading: "Promise helpers for already-known values",
        points: [
          "`Promise.resolve(value)` creates an already-fulfilled promise (or adopts a promise you pass in).",
          "`Promise.reject(error)` creates an already-rejected promise.",
          "`Promise.withResolvers()` returns `{ promise, resolve, reject }` so you can settle it from outside the executor.",
        ],
        code: `const { promise, resolve } = Promise.withResolvers();
setTimeout(() => resolve("later"), 100);`,
      },
      {
        heading: "Promisifying a callback API",
        code: `function readJson(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, text) => {
      if (err) return reject(err);
      try { resolve(JSON.parse(text)); } catch (e) { reject(e); }
    });
  });
}`,
        paragraphs: ["Errors thrown inside the async callback are not caught by the executor automatically, so convert them to `reject` yourself."],
      },
    ],
    mistakes: [
      "Wrapping something that already returns a promise in `new Promise` (the 'explicit construction anti-pattern').",
      "Rejecting with strings instead of `Error` objects, losing stack traces.",
      "Forgetting `return` after `reject`, so the success path also runs.",
    ],
    interview: [
      ["How do you create a promise?", "With `new Promise((resolve, reject) => { ... })`. Start async work in the executor and call resolve(value) on success or reject(error) on failure."],
      ["Is the executor synchronous?", "Yes. It runs immediately during the constructor call; only the handlers attached with then/catch run asynchronously."],
      ["What happens if the executor throws?", "The promise is rejected with the thrown error."],
    ],
    exercise:
      "Write `proceedToPayment(orderId)` that returns a promise resolving to 'Payment successful' after 20 ms, or rejecting if `orderId` is falsy.",
    answer:
      "`const proceedToPayment = (orderId) => new Promise((resolve, reject) => { if (!orderId) return reject(new Error('No order')); setTimeout(() => resolve('Payment successful'), 20); });`",
  }),

  "nj-promises--promise-chaining": njs({
    intro:
      "`.then` always returns a new promise. Whatever your handler returns becomes that new promise's value; if it returns a promise, the chain waits for it. That is how a chain like `createOrder(cart).then(proceedToPayment).then(showSummary).then(updateWallet)` passes data from one async step to the next, top to bottom, without nesting.",
    concepts: [
      "Each `.then(handler)` creates a new promise that resolves to the handler's return value. Returning a plain value passes it on immediately; returning a promise makes the next step wait for it.",
      "Always `return` from handlers. A handler without `return` gives `undefined` to the next step, and the chain no longer waits for the async work you started.",
      "Prefer chaining over nesting. Arrow functions keep chains compact: `.then((id) => proceedToPayment(id))` or simply `.then(proceedToPayment)`.",
    ],
    snapshot: {
      title: "Values flowing down the chain",
      panes: [
        ["Step", ["createOrder", ".then(pay)", ".then(summary)", ".then(wallet)"]],
        ["Returns", ["promise → ORD-3", "promise → paid", "value 'summary'", "promise → 900"]],
        ["Next step gets", ["'ORD-3'", "{ paid: true }", "'summary'", "*900"]],
      ],
      caption: "Each handler's return value (or the value of the promise it returns) becomes the next handler's argument.",
    },
    animation: {
      title: "A flat chain of dependent steps",
      nodes: [
        ["o", "createOrder", "ORD-3"],
        ["p", "proceedToPayment", "paid"],
        ["s", "showSummary", "text"],
        ["w", "updateWallet", "balance"],
        ["c", "catch", "errors"],
      ],
      steps: [
        ["o", "p", "orderId", "The order id returned by createOrder is passed to proceedToPayment."],
        ["p", "s", "payment", "Payment returns a promise, so the chain waits for it before continuing."],
        ["s", "w", "summary", "A plain returned value is passed on immediately."],
        ["w", "c", "if error", "Any rejection skips the remaining steps and lands in the final catch."],
      ],
    },
    code: `${cartApi}

const createOrder = (cart) => wait(5).then(() => "ORD-" + cart.length);
const proceedToPayment = (orderId) => wait(5).then(() => ({ orderId, paid: true }));
const showOrderSummary = (payment) => "Summary: " + payment.orderId + " paid=" + payment.paid; // sync value
const updateWallet = (summary) => wait(5).then(() => ({ summary, balance: 900 }));

createOrder(cart)
  .then((orderId) => proceedToPayment(orderId))   // returns a promise
  .then(showOrderSummary)                         // returns a value
  .then(updateWallet)
  .then(({ summary, balance }) => console.log(summary, "| wallet:", balance));

// The classic bug: forgetting to return
createOrder(cart)
  .then((orderId) => { proceedToPayment(orderId); })  // no return!
  .then((value) => console.log("next step received:", value));

// .then always creates a new promise
const p1 = Promise.resolve(1);
const p2 = p1.then((v) => v + 1);
console.log("p1 === p2 ?", p1 === p2);
p2.then((v) => console.log("p2 value:", v));`,
    walkthrough:
      "The main chain passes the order id to payment, the payment object to the summary (a plain value), and the summary to the wallet update, then logs the result. In the buggy chain the handler starts payment but returns nothing, so the next step receives `undefined` immediately. `p1.then(...)` is a different promise, `p2`, whose value is 2.",
    deepDive: [
      {
        heading: "Chaining vs nesting",
        code: `// Nested (callback hell again)
createOrder(cart).then((id) => {
  proceedToPayment(id).then((p) => {
    showOrderSummary(p);
  });
});

// Chained
createOrder(cart)
  .then(proceedToPayment)
  .then(showOrderSummary);`,
        paragraphs: ["Only nest when an inner step needs a value from much earlier in the chain; even then, async/await is usually clearer."],
      },
      {
        heading: "Passing several values down",
        paragraphs: ["Return an object (or use async/await) when a later step needs results from more than one earlier step."],
        code: `.then((orderId) => proceedToPayment(orderId).then((payment) => ({ orderId, payment })))`,
      },
    ],
    mistakes: [
      "Missing `return` in a block-bodied handler.",
      "Calling the function instead of passing it: `.then(proceedToPayment())`.",
      "Nesting `.then` calls and losing the flat structure.",
    ],
    interview: [
      ["What does .then return?", "A new promise that resolves with the handler's return value, or follows the promise the handler returns, or rejects if the handler throws."],
      ["Why must you return inside a then handler?", "So the next step receives the value and, if it is a promise, the chain waits for it. Without return the next step gets undefined right away."],
      ["What is promise chaining?", "Connecting dependent asynchronous steps with successive .then calls, each receiving the previous step's result, which keeps code flat and readable."],
    ],
    exercise:
      "What does `Promise.resolve(2).then((x) => x * 2).then((x) => Promise.resolve(x + 1)).then(console.log)` print?",
    answer:
      "5. The first handler returns 4; the second returns a promise for 5, which the chain waits for; the last handler logs 5.",
  }),

  "nj-promises--error-handling-in-promise-chains": njs({
    intro:
      "A rejection travels down a promise chain until it meets a rejection handler: `.catch(fn)` or the second argument of `.then`. Every step in between is skipped. Where you place `.catch` controls which steps a failure cancels: one `.catch` at the end handles errors from the whole chain; a `.catch` in the middle handles errors above it and lets the chain continue below it.",
    concepts: [
      "A thrown error or rejected promise anywhere in the chain skips the following `.then` handlers until a `.catch` is found.",
      "A `.catch` returns a new promise too. If it returns normally, the chain continues fulfilled with its return value; if it rethrows, the error keeps travelling.",
      "`.finally(fn)` runs on both success and failure for cleanup (hide a spinner), without changing the value or error passing through. Unhandled rejections are reported by the runtime.",
    ],
    snapshot: {
      title: "Where a rejection lands",
      panes: [
        ["Chain", ["createOrder ✗ reject", "*.then(pay) skipped", "*.then(summary) skipped", ".catch(handle) ✓", ".then(always) ✓"]],
        ["Effect", ["error created", "not called", "not called", "receives error", "runs after catch"]],
      ],
      caption: "Steps between the failure and the catch are skipped. Steps after a recovering catch run normally.",
    },
    animation: {
      title: "A rejection skipping down the chain",
      nodes: [
        ["o", "createOrder", "rejects"],
        ["p", ".then(pay)", "skipped"],
        ["c", ".catch", "handles"],
        ["n", ".then(next)", "continues"],
        ["f", ".finally", "cleanup"],
      ],
      steps: [
        ["o", "p", "Error", "createOrder rejects because the cart is invalid."],
        ["p", "c", "skip", "The payment handler is skipped; the error travels to the nearest catch."],
        ["c", "n", "recovered", "The catch returns normally, so the chain is fulfilled again."],
        ["n", "f", "always", "finally runs whether the chain succeeded or failed."],
      ],
    },
    code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = [];

function createOrder(cart) {
  return new Promise((resolve, reject) => {
    if (!cart.length) return reject(new Error("Cart is empty"));
    setTimeout(() => resolve("ORD-1"), 5);
  });
}
const proceedToPayment = (id) => wait(5).then(() => { log.push("paid " + id); return "receipt"; });

// 1. One catch for the whole chain
createOrder([])
  .then(proceedToPayment)
  .then(() => log.push("never runs"))
  .catch((err) => log.push("caught: " + err.message));

// 2. A catch in the middle recovers, later steps still run
createOrder([])
  .catch((err) => { log.push("recovered from: " + err.message); return "GUEST-ORDER"; })
  .then((id) => log.push("continued with " + id))
  .finally(() => log.push("finally (cleanup)"));

// 3. Throwing inside then is a rejection too; rethrowing keeps it going
Promise.resolve()
  .then(() => { throw new TypeError("bad data"); })
  .catch((err) => { log.push("first catch: " + err.name); throw err; })
  .catch((err) => log.push("second catch: " + err.message));

setTimeout(() => console.log(log.join("\\n")), 40);`,
    walkthrough:
      "Chain 1 fails at `createOrder`; both `.then` steps are skipped and the final `.catch` records the message. Chain 2 recovers in the middle, so the next `.then` runs with the fallback id and `finally` runs afterwards. Chain 3 shows a `throw` inside `.then` becoming a rejection, and a rethrow passing it to the next `.catch`. The entries appear in microtask order across the three chains.",
    deepDive: [
      {
        heading: "then(onFulfilled, onRejected) vs catch",
        paragraphs: [
          "`.then(a, b)` only catches errors from the promise before it, not from `a`. `.then(a).catch(b)` also catches errors thrown inside `a`. Prefer `.catch` for clarity.",
        ],
        code: `p.then(handle, onError);        // errors in handle are NOT caught here
p.then(handle).catch(onError);  // errors in handle ARE caught`,
      },
      {
        heading: "Unhandled rejections",
        points: [
          "Browsers fire `unhandledrejection` on `window` and log 'Uncaught (in promise)'.",
          "Node.js prints a warning and, by default since v15, exits the process.",
          "Every chain should end in a `.catch` or be awaited inside `try/catch`.",
        ],
      },
    ],
    mistakes: [
      "Putting `.catch` only at the top of a long chain and assuming it covers later steps.",
      "Swallowing errors with `.catch(() => {})` and hiding real failures.",
      "Expecting `.finally` to receive the value; it receives no arguments.",
    ],
    interview: [
      ["How does error handling work in a promise chain?", "A rejection or throw skips subsequent then handlers until the nearest catch (or rejection handler). The catch returns a new promise; returning normally recovers the chain, rethrowing propagates the error."],
      ["What happens to .then handlers after a .catch?", "They run, because a catch that returns normally produces a fulfilled promise with its return value."],
      ["What is .finally used for?", "Cleanup that should run regardless of outcome. It receives no arguments and passes the original value or error through unchanged (unless it throws)."],
    ],
    exercise:
      "Make chain 1 still run a step after the error that logs 'cart step done' regardless of outcome. Where do you put it?",
    answer:
      "After the `.catch`: `.catch(handle).then(() => log.push('cart step done'))`, or use `.finally(() => log.push('cart step done'))` anywhere you want it to run on both paths.",
  }),
};
