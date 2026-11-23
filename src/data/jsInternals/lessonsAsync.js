// async/await and the Promise combinators.
import { njs } from "./schema.js";

// Simulated requests: settle after `ms` with a value or an error.
const helpers = `const ok = (value, ms) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (message, ms) => new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));`;

export const asyncLessons = {
  "nj-async--async-functions": njs({
    intro:
      "`async` is a keyword you put before a function. An async function always returns a promise. If you return a plain value, JavaScript wraps it in a fulfilled promise; if you return a promise, that promise is followed; if you throw, the returned promise is rejected. `async` and `await` together are the modern, readable way to consume promises.",
    concepts: [
      "`async function getData() { return \"Hello\"; }` returns `Promise<\"Hello\">`, not the string. Callers use `.then` or `await` to get the value.",
      "Returning a promise from an async function does not double-wrap it: the result promise adopts the returned one.",
      "A `throw` inside an async function becomes a rejected promise. `await` can only be used inside async functions (and at the top level of ES modules).",
    ],
    snapshot: {
      title: "What an async function gives back",
      panes: [
        ["return 'Hello'", ["→ Promise", "*fulfilled: 'Hello'"]],
        ["return promise p", ["→ follows p", "same outcome as p"]],
        ["throw new Error()", ["→ Promise", "*rejected: Error"]],
      ],
      caption: "Every path out of an async function is a promise. That is why callers always use await or .then.",
    },
    animation: {
      title: "async wraps every outcome",
      nodes: [
        ["call", "getData()", "caller"],
        ["fn", "async body", "runs"],
        ["wrap", "Promise", "returned"],
        ["then", ".then / await", "consumer"],
      ],
      steps: [
        ["call", "fn", "invoke", "Calling an async function starts running its body synchronously."],
        ["fn", "wrap", "return v", "A plain return value is wrapped into a fulfilled promise."],
        ["fn", "wrap", "throw", "A thrown error becomes a rejection of that promise instead."],
        ["wrap", "then", "settle", "The caller reads the outcome through then, catch or await."],
      ],
    },
    code: `async function getData() {
  return "Hello";                    // wrapped automatically
}

const data = getData();
console.log("is a promise:", data instanceof Promise);
data.then((value) => console.log("value:", value));

const p = new Promise((resolve) => setTimeout(() => resolve("Promise resolved value"), 10));
async function returnsPromise() {
  return p;                          // not double-wrapped
}
returnsPromise().then((value) => console.log("adopted:", value));

async function broken() {
  throw new Error("something went wrong");
}
broken().catch((err) => console.log("rejected with:", err.message));

// The body runs synchronously until the first await:
async function order() {
  console.log("A: inside async, before await");
  await null;
  console.log("C: after await (microtask)");
}
order();
console.log("B: caller continues");`,
    walkthrough:
      "`getData()` returns a promise immediately; its value arrives in a `.then`. `returnsPromise` hands back `p`'s value without nesting promises. `broken` rejects instead of throwing synchronously. In `order`, the body runs synchronously up to `await` (A), the caller continues (B), and the rest of the body resumes as a microtask (C). Output appears in microtask order.",
    deepDive: [
      {
        heading: "Async forms",
        code: `async function a() {}
const b = async () => {};
const obj = { async c() {} };
class Api { async d() {} }`,
        paragraphs: ["Any function form can be async: declarations, expressions, arrows, methods."],
      },
      {
        heading: "Top-level await",
        paragraphs: [
          "In ES modules (`<script type=\"module\">`, `.mjs`), `await` works at the top level. In classic scripts and CommonJS it is a SyntaxError outside async functions.",
        ],
      },
    ],
    mistakes: [
      "Expecting `const x = asyncFn()` to be the value; it is a promise.",
      "Marking functions `async` that never await, adding a promise wrapper callers then forget to handle.",
    ],
    interview: [
      ["What does an async function return?", "Always a promise. Return values are wrapped in a fulfilled promise; returned promises are adopted; thrown errors reject the returned promise."],
      ["Can you use await outside an async function?", "Only at the top level of ES modules. Anywhere else it must be inside an async function."],
      ["Does the body of an async function run synchronously?", "Yes, until the first await. After that, the remainder runs asynchronously as a microtask once the awaited promise settles."],
    ],
    exercise:
      "What do `async function f() { return 1; } console.log(f() === 1, typeof f());` print?",
    answer:
      "`false object`. `f()` returns a promise (an object), not the number 1.",
  }),

  "nj-async--await-behind-the-scenes": njs({
    intro:
      "`await` pauses an async function until a promise settles, then resumes it with the value. Crucially, it does not block the JavaScript engine. When the function hits `await` on a pending promise, its execution context is suspended and removed from the call stack; the rest of the program keeps running. When the promise settles, the function is resumed as a microtask exactly where it left off. This explains the classic two-await timing puzzle.",
    concepts: [
      "`await promise` suspends only the current async function. The call stack is freed, so timers, clicks and other code keep running.",
      "When the awaited promise settles, the function's remaining code is queued as a microtask and continues with the value (or throws the rejection).",
      "Two awaits on promises created before the first await run in parallel: both timers start immediately, so `await p1 (10s)` then `await p2 (5s)` completes after about 10 s, not 15.",
    ],
    snapshot: {
      title: "handlePromise() while awaiting p1",
      panes: [
        ["Call stack", ["Global EC (other work)", "*(handlePromise paused)"]],
        ["Waiting", ["p1 timer: 300ms", "p2 timer: 150ms", "both already running"]],
        ["Microtask queue", ["resume at line after", "await p1"]],
      ],
      caption: "The suspended function holds no stack frame. When p1 settles, its continuation is queued; p2 is already done by then.",
    },
    animation: {
      title: "Suspend and resume",
      nodes: [
        ["fn", "handlePromise", "async"],
        ["stack", "Call stack", "free"],
        ["p1", "p1 (300ms)", "pending"],
        ["micro", "Microtask queue", "continuation"],
        ["rest", "Rest of fn", "resumed"],
      ],
      steps: [
        ["fn", "p1", "await p1", "At await p1 the function is suspended and leaves the call stack."],
        ["fn", "stack", "free", "The engine is not blocked: other code and timers keep running."],
        ["p1", "micro", "settled", "When p1 fulfils, the function's continuation is queued as a microtask."],
        ["micro", "rest", "resume", "The event loop resumes the function exactly after the await."],
        ["rest", "rest", "await p2", "p2 already fulfilled during the wait, so the next await resumes almost at once."],
      ],
    },
    code: `const start = Date.now();
const elapsed = () => Math.round((Date.now() - start) / 100) * 100;  // rounded to 100ms

const p1 = new Promise((resolve) => setTimeout(() => resolve("p1 done"), 300));
const p2 = new Promise((resolve) => setTimeout(() => resolve("p2 done"), 150));

async function handlePromise() {
  console.log("Hello World");
  const v1 = await p1;
  console.log("~" + elapsed() + "ms", v1);
  const v2 = await p2;              // already settled: resumes right away
  console.log("~" + elapsed() + "ms", v2);
}

handlePromise();
console.log("engine is free while handlePromise waits");
setTimeout(() => console.log("~" + elapsed() + "ms", "a timer ran during the await"), 100);

// Sequential version: each promise is created only after the previous await
async function sequential() {
  const t0 = Date.now();
  await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 100));
  console.log("sequential: two 100ms waits took ~" + Math.round((Date.now() - t0) / 100) * 100 + "ms");
}
setTimeout(sequential, 400);`,
    walkthrough:
      "'Hello World' prints synchronously, then the function suspends on `p1` and the caller logs that the engine is free. A timer runs at ~100 ms while the function is suspended. At ~300 ms `p1` fulfils and the function resumes; `p2` fulfilled at 150 ms, so the second await resumes immediately, also at ~300 ms. The sequential version creates each timer after the previous await, so its two 100 ms waits add up to ~200 ms.",
    deepDive: [
      {
        heading: "Line-by-line on the call stack",
        points: [
          "handlePromise is pushed; logs 'Hello World'.",
          "`await p1`: p1 is pending, so handlePromise is suspended and popped.",
          "Global code continues; timers fire as tasks.",
          "p1 fulfils → continuation microtask → handlePromise pushed again, logs v1.",
          "`await p2`: already fulfilled → suspended for one microtask tick only → logs v2.",
        ],
      },
      {
        heading: "Parallel vs sequential awaits",
        code: `// Sequential: total = a + b
const a = await fetchA();
const b = await fetchB();

// Parallel: total = max(a, b)
const [a2, b2] = await Promise.all([fetchA(), fetchB()]);`,
        paragraphs: ["Start independent work first, then await. Awaiting inside a loop runs requests one at a time."],
      },
    ],
    mistakes: [
      "Believing `await` blocks the whole program.",
      "Awaiting independent requests one after another and doubling the latency.",
      "Using `await` inside `forEach`; forEach does not wait. Use `for...of` or `Promise.all`.",
    ],
    interview: [
      ["Does await block the main thread?", "No. It suspends only the async function, removing it from the call stack; the engine keeps running other code and resumes the function as a microtask when the promise settles."],
      ["Two awaits, p1 resolves after 10s and p2 after 5s, both created up front. When is each logged?", "Both are logged at about 10 seconds. The timers run in parallel; p2 is already fulfilled when the function reaches await p2."],
      ["What happens if p1 takes 5s and p2 takes 10s?", "p1's value is logged at about 5s, then the function waits again and p2's value is logged at about 10s."],
    ],
    exercise:
      "Convert `sequential()` so both 100 ms waits run in parallel. How long does it take?",
    answer:
      "Create both promises first, then await: `const a = delay(100), b = delay(100); await a; await b;` or `await Promise.all([delay(100), delay(100)])`. It takes about 100 ms.",
  }),

  "nj-async--error-handling-with-async-await": njs({
    intro:
      "With async/await, a rejected promise behaves like a thrown exception at the `await` line. That means you can use the ordinary `try...catch...finally` you already know. You can also attach `.catch` to the promise an async function returns. Choosing where to catch decides which failures stop the flow and which are recovered.",
    concepts: [
      "`await rejectedPromise` throws the rejection reason inside the async function, so `try { await x } catch (err) {}` catches it.",
      "Alternatively, handle errors at the call site: `handlePromise().catch(handle)`. An uncaught error inside the function becomes a rejection of its returned promise.",
      "Granular handling: wrap only the step that may fail, or convert results to `[error, data]` tuples so one failure does not abort the whole function.",
    ],
    snapshot: {
      title: "Where the rejection goes",
      panes: [
        ["Inside async fn", ["try {", "*  await fetchUser() ✗", "} catch (err) ← here", "finally { cleanup }"]],
        ["No try/catch", ["await fetchUser() ✗", "fn's promise rejects", "caller .catch ← here"]],
      ],
      caption: "A rejection surfaces as an exception at the await. Catch it inside the function, or let it reject the function's promise.",
    },
    animation: {
      title: "A rejection becoming an exception",
      nodes: [
        ["p", "fetchUser()", "rejects"],
        ["aw", "await", "throws"],
        ["tc", "catch (err)", "handles"],
        ["fin", "finally", "cleanup"],
        ["caller", "caller .catch", "fallback"],
      ],
      steps: [
        ["p", "aw", "rejected", "The awaited promise rejects with an Error."],
        ["aw", "tc", "throw", "await rethrows it at that line, so the surrounding catch receives it."],
        ["tc", "fin", "always", "finally runs afterwards whether there was an error or not."],
        ["aw", "caller", "uncaught", "Without try/catch the error rejects the async function's promise for the caller to catch."],
      ],
    },
    code: `${helpers}

async function loadProfile(shouldFail) {
  try {
    const user = await (shouldFail ? fail("User API is down", 10) : ok({ name: "Asha" }, 10));
    return "profile of " + user.name;
  } catch (err) {
    return "fallback profile (" + err.message + ")";
  } finally {
    console.log("finally: hide spinner (failed=" + shouldFail + ")");
  }
}

async function main() {
  console.log(await loadProfile(false));
  console.log(await loadProfile(true));

  // No try/catch inside: the caller handles the rejection
  async function noGuard() { await fail("Orders API timeout", 10); return "unreachable"; }
  await noGuard().catch((err) => console.log("caller caught:", err.message));

  // Tuple style: keep going after a failure
  const settle = (promise) => promise.then((data) => [null, data], (error) => [error, null]);
  const [err1, orders] = await settle(fail("orders failed", 5));
  const [err2, cart] = await settle(ok(["shoes"], 5));
  console.log("orders:", err1 ? err1.message : orders, "| cart:", err2 ? err2.message : cart);
}

main();`,
    walkthrough:
      "The first call succeeds and the second is recovered by the `catch` block; `finally` runs both times, before each awaited result is logged. `noGuard` has no try/catch, so its returned promise rejects and the caller's `.catch` handles it. The `settle` helper turns each outcome into an `[error, data]` pair, so a failed orders request does not stop the cart request.",
    deepDive: [
      {
        heading: "Do not lose errors",
        points: [
          "Every async entry point (event handler, `main()`) needs a `try/catch` or a `.catch`.",
          "`return await` inside `try` is needed if you want the local `catch` to see the rejection; `return promise` would skip it.",
          "Log or rethrow in `catch`; empty catch blocks hide bugs.",
        ],
        code: `async function f() {
  try {
    return await risky();   // rejection caught below
  } catch (e) { /* ... */ }
}`,
      },
      {
        heading: "Errors in parallel work",
        paragraphs: [
          "`await Promise.all([...])` throws on the first rejection. When you need every result, use `Promise.allSettled` and inspect each status.",
        ],
      },
    ],
    mistakes: [
      "Wrapping an entire 50-line function in one try/catch so you cannot tell which step failed.",
      "Writing `return risky()` inside try and expecting the local catch to run.",
      "Forgetting that `finally` runs even after `return` in try.",
    ],
    interview: [
      ["How do you handle errors with async/await?", "Wrap awaits in try...catch (with finally for cleanup), or attach .catch to the promise returned by the async function."],
      ["What happens to an error thrown inside an async function with no try/catch?", "It rejects the promise returned by the function; the caller must handle it with await + try/catch or .catch."],
      ["Why does `return await` matter inside try?", "With `return promise`, the function returns before the promise settles, so a later rejection skips the local catch; `return await` waits inside the try block."],
    ],
    exercise:
      "Write `async function safeJson(url)` that returns `null` if `fetch` or `res.json()` fails, and always logs 'request finished'.",
    answer:
      "`async function safeJson(url) { try { const res = await fetch(url); return await res.json(); } catch { return null; } finally { console.log('request finished'); } }`",
  }),

  "nj-async--async-await-vs-then-and-catch": njs({
    intro:
      "async/await is syntactic sugar over promises: under the hood the same promise machinery and microtasks run. You can always rewrite one style as the other. The difference is readability. async/await reads top to bottom like synchronous code and avoids callback chains; `.then/.catch` is concise for short transformations and for composing promises without an async function.",
    concepts: [
      "Both styles produce identical runtime behaviour: same microtasks, same ordering, same error semantics (rejection ↔ throw).",
      "async/await shines with multiple dependent steps, conditionals and loops, where chains would need nesting or helper closures.",
      "`.then` shines for small pipelines and for library code that returns promises without needing local variables. Mixing both is fine when it reads better.",
    ],
    snapshot: {
      title: "The same flow, two styles",
      panes: [
        [".then / .catch", ["createOrder(cart)", "  .then(proceedToPayment)", "  .then(showSummary)", "  .catch(handle)"]],
        ["async / await", ["try {", "  id = await createOrder()", "  p = await pay(id)", "} catch (e) { handle }"]],
      ],
      caption: "Same promises underneath. await turns each .then into a line, and .catch into a catch block.",
    },
    animation: {
      title: "Desugaring await",
      nodes: [
        ["aw", "await p", "async style"],
        ["then", "p.then(rest)", "promise style"],
        ["micro", "Microtask", "same queue"],
        ["rest", "rest of code", "continues"],
      ],
      steps: [
        ["aw", "then", "equivalent", "await p behaves like registering the rest of the function in p.then."],
        ["then", "micro", "settle", "Both register the continuation as a microtask when p settles."],
        ["micro", "rest", "resume", "The continuation runs with the value in both styles."],
        ["aw", "rest", "readable", "async/await lets you write that continuation as plain following lines."],
      ],
    },
    code: `const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));
const createOrder = (cart) => wait(5, "ORD-" + cart.length);
const proceedToPayment = (id) => wait(5, { id, paid: true });
const applyCoupon = (payment) => wait(5, { ...payment, discount: 10 });

// Style 1: promise chain
function checkoutThen(cart, hasCoupon) {
  return createOrder(cart)
    .then(proceedToPayment)
    .then((payment) => (hasCoupon ? applyCoupon(payment) : payment))
    .then((payment) => "then: " + JSON.stringify(payment))
    .catch((err) => "then failed: " + err.message);
}

// Style 2: async/await
async function checkoutAwait(cart, hasCoupon) {
  try {
    const id = await createOrder(cart);
    let payment = await proceedToPayment(id);
    if (hasCoupon) payment = await applyCoupon(payment);
    return "await: " + JSON.stringify(payment);
  } catch (err) {
    return "await failed: " + err.message;
  }
}

async function main() {
  console.log(await checkoutThen(["shoes"], true));
  console.log(await checkoutAwait(["shoes"], true));
  console.log(await checkoutAwait(["shoes", "kurta"], false));

  // Ordering is identical: both continuations are microtasks
  const order = [];
  Promise.resolve().then(() => order.push("then"));
  (async () => { await null; order.push("await"); })();
  order.push("sync");
  await wait(1);
  console.log("order:", order.join(", "));
}
main();`,
    walkthrough:
      "Both checkout functions produce the same payment object with the coupon applied; the await version handles the conditional step with a plain `if`, while the chain needs a ternary inside a handler. The final check shows the microtask ordering is the same: 'sync' first, then the `.then` callback and the `await` continuation in the order they were queued.",
    deepDive: [
      {
        heading: "When to use which",
        points: [
          "Many dependent steps, loops, conditionals, try/finally cleanup → async/await.",
          "One or two quick transforms, returning a promise from a non-async helper → `.then`.",
          "Parallel work → `Promise.all` / `allSettled` in either style.",
        ],
      },
      {
        heading: "Loops are where await wins",
        code: `// Process items one by one, in order
for (const id of ids) {
  const item = await load(id);
  render(item);
}`,
        paragraphs: ["The `.then` equivalent needs `reduce` over promises or recursion, which is much harder to read."],
      },
    ],
    mistakes: [
      "Thinking async/await is faster or different at runtime than promises; it is the same mechanism.",
      "Using `await` for independent operations one after another instead of `Promise.all`.",
    ],
    interview: [
      ["Is async/await different from promises?", "No, it is syntactic sugar over promises. Async functions return promises and await consumes them using the same microtask queue."],
      ["Which should you use: async/await or then/catch?", "async/await for readability in multi-step or conditional flows; then/catch for short chains. Both are valid and can be mixed."],
      ["How is error handling different?", "With then/catch you attach .catch; with async/await you use try/catch around awaits. A rejection is equivalent to a thrown exception."],
    ],
    exercise:
      "Rewrite `fetch(url).then((r) => r.json()).then((d) => d.items).catch(() => [])` with async/await.",
    answer:
      "`async function getItems(url) { try { const r = await fetch(url); const d = await r.json(); return d.items; } catch { return []; } }`",
  }),

  "nj-async--promise-all": njs({
    intro:
      "`Promise.all(iterable)` runs several promises in parallel and waits for all of them. It returns one promise that fulfils with an array of values, in the same order as the input (not the order they finished). It is fail-fast: as soon as any input rejects, the combined promise rejects with that error, without waiting for the rest.",
    concepts: [
      "All succeed → array of results in input order, after the slowest promise. Three API calls of 3 s, 1 s and 2 s complete together after about 3 s.",
      "Any fails → immediate rejection with the first error. The other operations keep running in the background, but their results are ignored.",
      "Use it when every result is required (load user, settings and permissions before rendering). An empty array fulfils immediately with `[]`.",
    ],
    snapshot: {
      title: "Promise.all([p1 300ms, p2 100ms, p3 200ms])",
      panes: [
        ["All fulfil", ["p2 ✓ at 100", "p3 ✓ at 200", "p1 ✓ at 300", "*→ [v1, v2, v3] at 300"]],
        ["p2 rejects", ["p2 ✗ at 100", "*→ reject at 100", "p1, p3 ignored"]],
      ],
      caption: "Results keep input order. One rejection settles the whole thing immediately.",
    },
    animation: {
      title: "Wait for all, fail fast",
      nodes: [
        ["p1", "p1", "300ms"],
        ["p2", "p2", "100ms"],
        ["p3", "p3", "200ms"],
        ["all", "Promise.all", "combined"],
        ["out", "Result", "array / error"],
      ],
      steps: [
        ["p2", "all", "v2", "p2 settles first, but all keeps waiting for the others."],
        ["p3", "all", "v3", "p3 fulfils at 200 ms."],
        ["p1", "all", "v1", "When the slowest, p1, fulfils, every value is in."],
        ["all", "out", "[v1,v2,v3]", "The combined promise fulfils with values in input order."],
        ["p2", "out", "if ✗", "If any input rejected instead, the result would reject immediately."],
      ],
    },
    code: `${helpers}
const start = Date.now();
const at = () => "~" + Math.round((Date.now() - start) / 100) * 100 + "ms";

async function main() {
  const values = await Promise.all([ok("user", 300), ok("settings", 100), ok("permissions", 200)]);
  console.log(at(), "all fulfilled:", values);

  try {
    await Promise.all([ok("user", 300), fail("settings API failed", 100), ok("permissions", 200)]);
  } catch (err) {
    console.log(at(), "rejected fast:", err.message);
  }

  console.log("empty:", await Promise.all([]));
  console.log("non-promises pass through:", await Promise.all([1, ok(2, 10), "three"]));
}
main();`,
    walkthrough:
      "The first call waits for the slowest promise (300 ms) and returns values in input order, even though 'settings' finished first. The second call starts 300 ms later and rejects at its 100 ms mark, about 400 ms overall, without waiting for the other two. An empty array fulfils immediately, and plain values are treated as already-fulfilled promises.",
    deepDive: [
      {
        heading: "Parallel requests in practice",
        code: `const [user, posts] = await Promise.all([
  fetch("/api/user").then((r) => r.json()),
  fetch("/api/posts").then((r) => r.json()),
]);`,
        paragraphs: ["Destructuring the result array keeps the code readable. Each request starts immediately; the total time is the slowest request."],
      },
      {
        heading: "Writing a Promise.all polyfill",
        code: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = [];
    let remaining = items.length;
    if (remaining === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;                 // keep input order
        if (--remaining === 0) resolve(results);
      }, reject);                           // first rejection wins
    });
  });
}`,
      },
    ],
    mistakes: [
      "Using `Promise.all` when partial results are acceptable; one failure loses everything (use `allSettled`).",
      "Assuming rejection cancels the other requests; use `AbortController` to actually cancel them.",
      "Creating the promises inside a loop with `await`, which makes them sequential before `all` ever sees them.",
    ],
    interview: [
      ["What does Promise.all do?", "Takes an iterable of promises and returns a promise that fulfils with an array of all values (in input order) when all fulfil, or rejects as soon as any one rejects."],
      ["If one of three promises fails after 1 second, when does Promise.all reject?", "Immediately at 1 second, with that error. It does not wait for the others."],
      ["Are results ordered by completion time?", "No. Results are placed by input position, so values[0] always belongs to the first promise even if it finished last."],
    ],
    exercise:
      "Three requests take 3 s, 1 s and 2 s. What do you get with `Promise.all` if all succeed, and when?",
    answer:
      "An array `[r1, r2, r3]` in input order after about 3 seconds (the slowest request).",
  }),

  "nj-async--promise-allsettled": njs({
    intro:
      "`Promise.allSettled(iterable)` waits for every promise to settle, whether it fulfils or rejects, and never rejects itself. It fulfils with an array of result objects in input order: `{ status: \"fulfilled\", value }` or `{ status: \"rejected\", reason }`. It is the safest of the combinators when you want whatever succeeded, such as rendering the widgets that loaded and showing errors for the rest.",
    concepts: [
      "Waits for all inputs to settle; the total time is the slowest input, even if some of the others fail early.",
      "Never rejects. Each entry describes one input's outcome with `status` and either `value` or `reason`.",
      "Ideal for independent work where partial success is useful: dashboards, batch uploads, sending notifications to many users.",
    ],
    snapshot: {
      title: "Promise.allSettled([p1 ✓, p2 ✗, p3 ✓])",
      panes: [
        ["Inputs", ["p1 ✓ 300ms", "p2 ✗ 100ms", "p3 ✓ 200ms"]],
        ["Result (at 300ms)", ["{ fulfilled, value }", "*{ rejected, reason }", "{ fulfilled, value }"]],
      ],
      caption: "Every outcome is reported, in input order, after the slowest input settles. The combined promise itself always fulfils.",
    },
    animation: {
      title: "Collect every outcome",
      nodes: [
        ["p1", "p1", "fulfils"],
        ["p2", "p2", "rejects"],
        ["p3", "p3", "fulfils"],
        ["as", "allSettled", "waits for all"],
        ["out", "Outcomes", "status list"],
      ],
      steps: [
        ["p2", "as", "rejected", "p2 rejects early; allSettled records it and keeps waiting."],
        ["p3", "as", "fulfilled", "p3 fulfils and is recorded."],
        ["p1", "as", "fulfilled", "p1, the slowest, fulfils last."],
        ["as", "out", "3 results", "allSettled fulfils with three status objects in input order."],
      ],
    },
    code: `${helpers}

async function loadDashboard() {
  const widgets = ["profile", "orders", "recommendations"];
  const results = await Promise.allSettled([
    ok({ name: "Asha" }, 30),
    fail("Orders service unavailable", 10),
    ok(["React Basics", "Node Basics"], 20),
  ]);

  results.forEach((result, i) => {
    if (result.status === "fulfilled") console.log("✓", widgets[i], "→", result.value);
    else console.log("✗", widgets[i], "→", result.reason.message);
  });

  const loaded = results.filter((r) => r.status === "fulfilled").length;
  console.log(loaded + "/" + results.length, "widgets loaded");
  console.log("raw entry:", results[1].status, results[1].reason.message);
}
loadDashboard();`,
    walkthrough:
      "The orders request rejects first, but `allSettled` keeps waiting until the profile request settles at 30 ms. Each result is reported in input order with its status, so the dashboard can render two widgets and an error state for the third. The combined promise never rejected, so no `try/catch` was needed.",
    deepDive: [
      {
        heading: "allSettled polyfill",
        code: `const allSettled = (items) =>
  Promise.all(items.map((item) =>
    Promise.resolve(item).then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason }),
    )));`,
        paragraphs: ["Turning every rejection into a fulfilled status object means the outer `Promise.all` can never reject."],
      },
      {
        heading: "all vs allSettled",
        points: [
          "`all`: need every value; fail fast; result is an array of values.",
          "`allSettled`: want every outcome; never fails; result is an array of status objects.",
        ],
      },
    ],
    mistakes: [
      "Forgetting to check `status` and reading `result.value` on a rejected entry (it is `undefined`).",
      "Wrapping `allSettled` in try/catch expecting rejections; check statuses instead.",
    ],
    interview: [
      ["What does Promise.allSettled return?", "A promise that fulfils after all inputs settle, with an array of objects: { status: 'fulfilled', value } or { status: 'rejected', reason }, in input order."],
      ["Can Promise.allSettled reject?", "No (except for a non-iterable argument). It always fulfils once every input has settled."],
      ["When would you use allSettled instead of all?", "When operations are independent and partial success is useful, e.g. loading dashboard widgets or sending a batch of emails."],
    ],
    exercise:
      "From `results`, build an array of only the error messages.",
    answer:
      "`results.filter((r) => r.status === 'rejected').map((r) => r.reason.message)`.",
  }),

  "nj-async--promise-race": njs({
    intro:
      "`Promise.race(iterable)` settles as soon as the first input settles, with that input's outcome. If the fastest promise fulfils, the race fulfils with its value; if the fastest rejects, the race rejects with its error. The most common real use is a timeout: race the actual request against a timer that rejects.",
    concepts: [
      "First settled wins, success or failure. The other promises keep running, but their results are ignored.",
      "Timeout pattern: `Promise.race([fetchData(), rejectAfter(3000)])` rejects if the data takes longer than 3 s.",
      "An empty iterable makes a promise that stays pending forever, so always pass at least one input.",
    ],
    snapshot: {
      title: "Promise.race([…])",
      panes: [
        ["Fastest fulfils", ["p1 ✓ 300ms", "*p2 ✓ 100ms ← wins", "p3 ✗ 200ms", "→ fulfils with v2"]],
        ["Fastest rejects", ["p1 ✓ 300ms", "*p2 ✗ 100ms ← wins", "p3 ✓ 200ms", "→ rejects with e2"]],
      ],
      caption: "Only timing decides. Whatever settles first becomes the race's result, fulfilled or rejected.",
    },
    animation: {
      title: "First to settle wins",
      nodes: [
        ["api", "fetchData", "slow"],
        ["timer", "timeout", "rejects 50ms"],
        ["race", "Promise.race", "first wins"],
        ["out", "Result", "error / data"],
      ],
      steps: [
        ["api", "race", "start", "The data request and the timeout start at the same time."],
        ["timer", "race", "50ms ✗", "The timeout rejects first because the API is slow."],
        ["race", "out", "Timeout", "The race rejects with the timeout error."],
        ["api", "race", "ignored", "The data arrives later, but the race is already settled."],
      ],
    },
    code: `${helpers}

const timeout = (ms) => fail("Request timed out after " + ms + "ms", ms);

async function main() {
  console.log("fastest fulfils:", await Promise.race([ok("p1", 30), ok("p2", 10), fail("p3", 20)]));

  try {
    await Promise.race([ok("p1", 30), fail("p2 failed first", 10), ok("p3", 20)]);
  } catch (err) {
    console.log("fastest rejects:", err.message);
  }

  // Timeout pattern
  async function fetchWithTimeout(delay, limit) {
    try {
      return await Promise.race([ok("data in " + delay + "ms", delay), timeout(limit)]);
    } catch (err) {
      return err.message;
    }
  }
  console.log(await fetchWithTimeout(10, 50));
  console.log(await fetchWithTimeout(80, 50));
}
main();`,
    walkthrough:
      "In the first race p2 fulfils first (10 ms), so the race fulfils with 'p2'. In the second, p2 rejects first, so the race rejects even though the others would succeed. `fetchWithTimeout` returns the data when it is faster than the limit, and the timeout message when it is not.",
    deepDive: [
      {
        heading: "Race does not cancel the loser",
        paragraphs: [
          "The slow request keeps running and still uses bandwidth. Pair race with `AbortController` to actually abort it, or use `AbortSignal.timeout(ms)` with fetch directly.",
        ],
        code: `const res = await fetch(url, { signal: AbortSignal.timeout(3000) });`,
      },
      {
        heading: "race polyfill",
        code: `const race = (items) =>
  new Promise((resolve, reject) => {
    for (const item of items) Promise.resolve(item).then(resolve, reject);
  });`,
        paragraphs: ["Every input calls the same resolve/reject; only the first call has any effect because promises settle once."],
      },
    ],
    mistakes: [
      "Expecting race to return the first successful result; that is `Promise.any`.",
      "Passing an empty array and waiting forever.",
    ],
    interview: [
      ["What does Promise.race do?", "Returns a promise that settles with the outcome of the first input to settle, whether it fulfils or rejects."],
      ["How do you implement a request timeout with race?", "Race the request against a promise that rejects after N ms: Promise.race([request, timeout(N)])."],
      ["Difference between race and any?", "race takes the first settled result (success or failure); any takes the first fulfilled result and only rejects if all reject."],
    ],
    exercise:
      "Three promises: p1 fulfils at 3 s, p2 rejects at 1 s, p3 fulfils at 2 s. What does `Promise.race` give, and when?",
    answer:
      "It rejects at about 1 second with p2's error, because p2 settles first.",
  }),

  "nj-async--promise-any": njs({
    intro:
      "`Promise.any(iterable)` waits for the first promise to fulfil and ignores rejections along the way. It is a success-seeking race. Only if every input rejects does it reject, with an `AggregateError` whose `errors` array holds all the reasons in input order. Use it for redundancy: ask several mirrors or CDNs and use whichever answers successfully first.",
    concepts: [
      "First fulfilled wins. Rejections that arrive earlier are skipped and only collected, not reported on their own.",
      "All rejected → `AggregateError: All promises were rejected`, with `err.errors` listing every reason in input order.",
      "Use cases: fastest successful mirror, first available payment provider, fallback data sources.",
    ],
    snapshot: {
      title: "Promise.any([…])",
      panes: [
        ["Mixed", ["p1 ✗ 100ms (skipped)", "*p2 ✓ 200ms ← wins", "p3 ✓ 300ms", "→ fulfils with v2"]],
        ["All fail", ["p1 ✗", "p2 ✗", "p3 ✗", "*→ AggregateError"]],
      ],
      caption: "Failures are ignored until something succeeds. Only total failure rejects, and then you get every error.",
    },
    animation: {
      title: "First success wins",
      nodes: [
        ["m1", "mirror A", "fails 10ms"],
        ["m2", "mirror B", "ok 20ms"],
        ["m3", "mirror C", "ok 30ms"],
        ["any", "Promise.any", "first ✓"],
        ["out", "Result", "data"],
      ],
      steps: [
        ["m1", "any", "✗ skip", "Mirror A rejects first, but any ignores it and keeps waiting."],
        ["m2", "any", "✓ B", "Mirror B fulfils at 20 ms: the first success."],
        ["any", "out", "data B", "Promise.any fulfils with mirror B's data."],
        ["m3", "any", "ignored", "Mirror C's later result is ignored."],
      ],
    },
    code: `${helpers}

async function main() {
  const fastestMirror = await Promise.any([
    fail("mirror A down", 10),
    ok("file from mirror B", 20),
    ok("file from mirror C", 30),
  ]);
  console.log("any:", fastestMirror);

  try {
    await Promise.any([fail("A down", 10), fail("B down", 30), fail("C down", 20)]);
  } catch (err) {
    console.log(err.name + ":", err.message);
    console.log("errors in input order:", err.errors.map((e) => e.message));
    console.log("is AggregateError:", err instanceof AggregateError);
  }
}
main();`,
    walkthrough:
      "Mirror A fails first, but `any` ignores it and fulfils with mirror B, the first success. When all three mirrors fail, `any` rejects with an `AggregateError`; its `errors` array lists the reasons by input position (A, B, C), not by the order they failed (A, C, B).",
    deepDive: [
      {
        heading: "The four combinators side by side",
        points: [
          "`all`: all must fulfil → values; first rejection → reject.",
          "`allSettled`: wait for all → status objects; never rejects.",
          "`race`: first to settle (either way) decides.",
          "`any`: first to fulfil decides; all reject → AggregateError.",
        ],
      },
      {
        heading: "any polyfill",
        code: `const any = (items) =>
  new Promise((resolve, reject) => {
    const errors = [];
    let pending = items.length;
    if (!pending) return reject(new AggregateError([], "All promises were rejected"));
    items.forEach((item, i) =>
      Promise.resolve(item).then(resolve, (e) => {
        errors[i] = e;
        if (--pending === 0) reject(new AggregateError(errors, "All promises were rejected"));
      }));
  });`,
      },
    ],
    mistakes: [
      "Using `any` when an early failure should stop everything (that is `all`).",
      "Reading `err.message` only and missing the individual reasons in `err.errors`.",
    ],
    interview: [
      ["What does Promise.any do?", "Returns a promise that fulfils with the first fulfilled input's value, ignoring rejections; it rejects with AggregateError only if all inputs reject."],
      ["What is AggregateError?", "An Error subclass that groups several errors; Promise.any uses it, with the individual reasons in its errors array in input order."],
      ["race vs any?", "race settles with the first settled promise even if it rejected; any waits for the first success."],
    ],
    exercise:
      "p1 rejects at 1 s, p2 fulfils at 3 s, p3 rejects at 2 s. What does `Promise.any` give and when?",
    answer:
      "It fulfils with p2's value at about 3 seconds; the two rejections are ignored because a success eventually arrives.",
  }),

  "nj-async--promise-api-interview-questions": njs({
    intro:
      "Interviewers love one scenario: three API calls that take 3 s, 1 s and 2 s, and one of them may fail. What does each Promise API return, and when? This lesson runs that exact scenario through all four combinators, plus output-order puzzles that mix promises, timers and async functions, so you can answer from the mechanism.",
    concepts: [
      "Know the terminology: settled = fulfilled or rejected; resolve/fulfil/success mean the same outcome; reject/failure mean the other.",
      "For every combinator ask two questions: what is the trigger to settle (all, first, first success), and what is the shape of the result (array, status objects, single value, AggregateError)?",
      "For ordering puzzles: synchronous code first, then microtasks (promise callbacks, await continuations), then tasks (timers), draining microtasks after each task.",
    ],
    snapshot: {
      title: "p1 3s ✓, p2 1s ✗, p3 2s ✓",
      panes: [
        ["all", ["*rejects at 1s", "Error from p2"]],
        ["allSettled", ["fulfils at 3s", "3 status objects"]],
        ["race", ["*rejects at 1s", "p2 settled first"]],
        ["any", ["fulfils at 2s", "p3's value"]],
      ],
      caption: "One scenario, four different answers. Scaled down to 300/100/200 ms in the example below.",
    },
    animation: {
      title: "Same inputs, four combinators",
      nodes: [
        ["in", "p1, p2 ✗, p3", "3s/1s/2s"],
        ["all", "all", "1s ✗"],
        ["set", "allSettled", "3s ✓"],
        ["race", "race", "1s ✗"],
        ["any", "any", "2s ✓"],
      ],
      steps: [
        ["in", "all", "fail fast", "all rejects at 1 s because p2 failed."],
        ["in", "race", "first", "race also rejects at 1 s: p2 is simply the first to settle."],
        ["in", "any", "first ✓", "any ignores p2 and fulfils at 2 s with p3."],
        ["in", "set", "everything", "allSettled reports all three outcomes at 3 s."],
      ],
    },
    code: `${helpers}
const start = Date.now();
const at = () => Math.round((Date.now() - start) / 100) * 100 + "ms";
const inputs = () => [ok("P1 success", 300), fail("P2 fail", 100), ok("P3 success", 200)];
const show = (r) => (r instanceof Error ? r.name + ": " + r.message : JSON.stringify(r));

async function run(name, combinator) {
  const t0 = Date.now();
  try {
    const result = await combinator(inputs());
    console.log(name.padEnd(10), "fulfilled after ~" + Math.round((Date.now() - t0) / 100) * 100 + "ms:", show(result));
  } catch (err) {
    console.log(name.padEnd(10), "rejected  after ~" + Math.round((Date.now() - t0) / 100) * 100 + "ms:", show(err));
  }
}

async function main() {
  await run("all", (p) => Promise.all(p));
  await run("allSettled", (p) => Promise.allSettled(p).then((rs) => rs.map((r) => r.status)));
  await run("race", (p) => Promise.race(p));
  await run("any", (p) => Promise.any(p));

  // Output-order puzzle
  const order = [];
  setTimeout(() => order.push("timeout"), 0);
  (async () => { order.push("async start"); await null; order.push("after await"); })();
  Promise.resolve().then(() => order.push("then"));
  order.push("sync end");
  await new Promise((r) => setTimeout(r, 10));
  console.log("puzzle:", order.join(" → "));
}
main();`,
    walkthrough:
      "With the scaled scenario (300/100/200 ms): `all` rejects at ~100 ms with P2's error; `allSettled` fulfils at ~300 ms with three statuses; `race` rejects at ~100 ms since P2 settles first; `any` fulfils at ~200 ms with P3. In the puzzle, 'async start' and 'sync end' are synchronous, the await continuation and the `.then` callback are microtasks in queue order, and the timeout comes last.",
    deepDive: [
      {
        heading: "Quick-fire answers",
        points: [
          "All three succeed with `all` → array of 3 values after the slowest (3 s).",
          "All three fail with `any` → AggregateError after the last failure.",
          "`race` with all succeeding → the fastest value (1 s).",
          "`allSettled` with all failing → three `{ status: 'rejected', reason }` objects; still fulfils.",
        ],
      },
      {
        heading: "Common polyfill question checklist",
        points: [
          "Wrap each item with `Promise.resolve(item)` so plain values work.",
          "Keep results by index, not by completion order.",
          "Handle the empty input case (all/allSettled resolve `[]`, any rejects, race stays pending).",
          "Rely on 'promises settle once' instead of tracking a done flag.",
        ],
      },
    ],
    mistakes: [
      "Saying `race` returns the first success.",
      "Saying `allSettled` rejects when something fails.",
      "Forgetting that `all` results are in input order.",
    ],
    interview: [
      ["Promise.all with p1 (3s ✓), p2 (1s ✗), p3 (2s ✓)?", "Rejects after 1 second with p2's error; the other results are ignored."],
      ["Promise.allSettled in the same scenario?", "Fulfils after 3 seconds with [{status:'fulfilled', value}, {status:'rejected', reason}, {status:'fulfilled', value}]."],
      ["Promise.any if all three reject?", "Rejects with AggregateError: All promises were rejected, after the last rejection; err.errors holds the three reasons in input order."],
    ],
    exercise:
      "Predict: `console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); (async () => { console.log(4); await 0; console.log(5); })(); console.log(6);`",
    answer:
      "1, 4, 6, 3, 5, 2. Sync: 1, 4 (async body before await), 6. Microtasks in queue order: 3, then 5. Task: 2.",
  }),
};
