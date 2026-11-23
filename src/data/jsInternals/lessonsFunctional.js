// higher-order functions, map, filter, reduce.
import { njs } from "./schema.js";

const users = `const users = [
  { firstName: "Asha", lastName: "Verma", age: 26 },
  { firstName: "Ravi", lastName: "Kumar", age: 75 },
  { firstName: "Meera", lastName: "Nair", age: 50 },
  { firstName: "Kabir", lastName: "Malhotra", age: 26 },
];`;

export const functionalLessons = {
  "nj-functional--higher-order-functions-and-functional-programming": njs({
    intro:
      "A higher-order function is a function that takes another function as an argument, returns a function, or both. Higher-order functions are the backbone of functional programming in JavaScript: instead of rewriting the same loop for every calculation, you write the loop once and pass in the part that changes (the logic) as a function. That keeps code reusable, modular and easy to test.",
    concepts: [
      "Higher-order function (HOF): takes a function as input and/or returns a function. The function passed in is a callback. `setTimeout`, `addEventListener`, `map`, `filter` and `reduce` are all HOFs.",
      "Functional programming separates 'what to compute' (small pure functions such as `area`, `circumference`) from 'how to iterate' (one generic function such as `calculate`).",
      "DRY and single responsibility: duplicated loops are a sign that the varying logic should be a parameter. Each small function does one job and is reused.",
    ],
    snapshot: {
      title: "One HOF, many logics",
      panes: [
        ["Logic (callbacks)", ["area: πr²", "circumference: 2πr", "diameter: 2r"]],
        ["calculate(radius, logic)", ["*for each r:", "  output.push(logic(r))", "return output"]],
        ["Results", ["area → 3.14, 12.57 …", "circ → 6.28, 12.57 …", "diam → 2, 4, 6"]],
      ],
      caption: "The loop lives in one place. Swapping the callback changes what is computed without touching the iteration.",
    },
    animation: {
      title: "Passing logic into a reusable loop",
      nodes: [
        ["radii", "radius []", "[1, 2, 3]"],
        ["hof", "calculate()", "higher-order"],
        ["logic", "logic(r)", "callback"],
        ["out", "output []", "results"],
      ],
      steps: [
        ["radii", "hof", "input", "calculate receives the radius array and a logic function."],
        ["hof", "logic", "r = 1", "For each radius it calls the logic callback."],
        ["logic", "out", "push", "The callback's return value is pushed into the output array."],
        ["hof", "logic", "swap", "Passing diameter instead of area reuses the same loop for new logic."],
      ],
    },
    code: `const radius = [1, 2, 3];

// Repetitive version: three loops that differ only in one line.
function calculateAreaRepetitive(list) {
  const output = [];
  for (let i = 0; i < list.length; i++) output.push(Math.PI * list[i] * list[i]);
  return output;
}

// Functional version: the loop once, the logic as a parameter.
const area = (r) => Math.PI * r * r;
const circumference = (r) => 2 * Math.PI * r;
const diameter = (r) => 2 * r;

function calculate(list, logic) {        // higher-order function
  const output = [];
  for (let i = 0; i < list.length; i++) output.push(logic(list[i]));
  return output;
}

const round = (n) => Math.round(n * 100) / 100;
console.log("area         :", calculate(radius, area).map(round));
console.log("circumference:", calculate(radius, circumference).map(round));
console.log("diameter     :", calculate(radius, diameter));
console.log("same as built-in map:", JSON.stringify(calculate(radius, diameter)) === JSON.stringify(radius.map(diameter)));
console.log("repetitive matches:", calculateAreaRepetitive(radius).map(round).join() === calculate(radius, area).map(round).join());`,
    walkthrough:
      "`calculate` is the higher-order function: it owns the loop and accepts `logic` as a callback. Area, circumference and diameter are tiny pure functions. Results match the repetitive version, and `calculate` behaves exactly like the built-in `Array.prototype.map`, which is a higher-order function too.",
    deepDive: [
      {
        heading: "Functions that return functions",
        paragraphs: ["A HOF can also produce functions. This is how you build configurable helpers."],
        code: `const multiplyBy = (factor) => (n) => n * factor;
const triple = multiplyBy(3);
triple(5); // 15`,
      },
      {
        heading: "Pure functions",
        points: [
          "Same input → same output.",
          "No side effects: does not mutate arguments or global state.",
          "Easy to test, cache (memoize) and run in any order.",
          "`area` is pure; a function that pushes into a global array is not.",
        ],
      },
      {
        heading: "Built-in higher-order functions",
        points: [
          "Arrays: `map`, `filter`, `reduce`, `forEach`, `find`, `some`, `every`, `sort` (comparator), `flatMap`.",
          "Timers and events: `setTimeout`, `setInterval`, `addEventListener`.",
          "Promises: `then`, `catch`, `finally`.",
        ],
      },
    ],
    mistakes: [
      "Copy-pasting loops with one changed line instead of extracting the changing part as a function.",
      "Writing callbacks with side effects (mutating outer arrays) inside `map`, which defeats the point.",
    ],
    interview: [
      ["What is a higher-order function?", "A function that takes one or more functions as arguments, or returns a function. Examples: map, filter, reduce, setTimeout, addEventListener."],
      ["What is functional programming?", "A style that builds programs from small pure functions and higher-order functions, favouring immutability and composition over shared mutable state and repeated loops."],
      ["Why are higher-order functions useful?", "They remove duplication by separating iteration or control flow from the logic, making code reusable, composable and easier to test."],
    ],
    exercise:
      "Write a HOF `repeat(n, action)` that calls `action(i)` for i from 0 to n-1, and use it to build `[0, 1, 4, 9]`.",
    answer:
      "`function repeat(n, action) { for (let i = 0; i < n; i++) action(i); }` then `const out = []; repeat(4, (i) => out.push(i * i));`.",
  }),

  "nj-functional--building-a-custom-array-method": njs({
    intro:
      "Once you can write a higher-order function, you can add your own methods to arrays. Putting a function on `Array.prototype` makes it available on every array, with `this` pointing to the array it was called on. Writing your own `myMap` (a polyfill) is a favourite interview task because it checks HOFs, `this`, callbacks and the exact contract of the built-in.",
    concepts: [
      "`Array.prototype` is the object every array inherits from. A function assigned there can be called as `[1, 2].myMap(fn)`, with `this` set to that array.",
      "A faithful polyfill follows the built-in contract: call the callback with `(element, index, array)`, support a `thisArg`, skip holes in sparse arrays, never mutate the original, and return a new array.",
      "Use regular functions for prototype methods. An arrow function would not receive the array as `this`.",
    ],
    snapshot: {
      title: "radius.calculate(area)",
      panes: [
        ["Array.prototype", ["map (built-in)", "*calculate (ours)", "myMap (polyfill)"]],
        ["radius (instance)", ["[ 1, 2, 3 ]", "→ inherits prototype"]],
        ["Inside calculate", ["this → radius", "logic → area", "returns new array"]],
      ],
      caption: "Because calculate lives on the prototype, every array has it, and this refers to the array on the left of the dot.",
    },
    animation: {
      title: "How [1,2,3].myMap(fn) finds the method",
      nodes: [
        ["arr", "[1, 2, 3]", "instance"],
        ["proto", "Array.prototype", "myMap"],
        ["call", "myMap call", "this = arr"],
        ["cb", "callback", "(el, i, arr)"],
        ["res", "new array", "result"],
      ],
      steps: [
        ["arr", "proto", "lookup", "The array has no own myMap, so lookup continues to Array.prototype."],
        ["proto", "call", "invoke", "myMap is called with this set to the array on the left of the dot."],
        ["call", "cb", "each", "For every index it calls the callback with element, index and array."],
        ["cb", "res", "push", "Each return value goes into a brand-new array."],
        ["res", "arr", "unchanged", "The original array is never modified."],
      ],
    },
    code: `const radius = [1, 2, 3];
const diameter = (r) => 2 * r;

// Method version of the higher-order function from the previous lesson.
Array.prototype.calculate = function (logic) {
  const output = [];
  for (let i = 0; i < this.length; i++) output.push(logic(this[i]));
  return output;
};
console.log("calculate:", radius.calculate(diameter));

// A polyfill that follows the real map contract.
Array.prototype.myMap = function (callback, thisArg) {
  if (typeof callback !== "function") throw new TypeError(callback + " is not a function");
  const result = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) result[i] = callback.call(thisArg, this[i], i, this); // skip holes
  }
  return result;
};

console.log("myMap:", [10, 20, 30].myMap((n, i) => n + i));
console.log("thisArg:", [1, 2].myMap(function (n) { return n * this.factor; }, { factor: 5 }));
const sparse = [1, , 3];
console.log("holes kept:", sparse.myMap((n) => n * 2).length, 1 in sparse.myMap((n) => n * 2));
try { [1].myMap(null); } catch (e) { console.log(e.name + ":", e.message); }

delete Array.prototype.calculate;   // clean up: don't ship prototype changes
delete Array.prototype.myMap;`,
    walkthrough:
      "`calculate` on the prototype gives every array the method, with `this` as the array. `myMap` passes element, index and array, honours `thisArg` (`this.factor` is 5), keeps holes as holes (length 3, index 1 missing), and throws a TypeError for a non-function, matching the built-in. The prototype is cleaned up at the end.",
    deepDive: [
      {
        heading: "filter and reduce polyfills",
        code: `Array.prototype.myFilter = function (cb, thisArg) {
  const out = [];
  for (let i = 0; i < this.length; i++) {
    if (i in this && cb.call(thisArg, this[i], i, this)) out.push(this[i]);
  }
  return out;
};

Array.prototype.myReduce = function (cb, initial) {
  let i = 0, acc = initial;
  if (arguments.length < 2) {
    while (i < this.length && !(i in this)) i++;
    if (i >= this.length) throw new TypeError("Reduce of empty array with no initial value");
    acc = this[i++];
  }
  for (; i < this.length; i++) if (i in this) acc = cb(acc, this[i], i, this);
  return acc;
};`,
      },
      {
        heading: "Should you extend built-in prototypes?",
        points: [
          "In apps and libraries: no. Name clashes with future standard methods have broken real websites (the reason `Array.prototype.flatten` became `flat`).",
          "Polyfills that implement a standard method only when it is missing are the accepted exception: `if (!Array.prototype.at) { … }`.",
          "In interviews: yes, it is the standard way to show you understand the contract.",
        ],
      },
    ],
    mistakes: [
      "Using an arrow function for a prototype method, so `this` is not the array.",
      "Mutating `this` inside a map polyfill instead of returning a new array.",
      "Forgetting the index and array arguments, which breaks callbacks like `(n, i) => n + i`.",
    ],
    interview: [
      ["Write a polyfill for Array.prototype.map.", "Define `Array.prototype.myMap = function (cb, thisArg) { const res = new Array(this.length); for (let i = 0; i < this.length; i++) if (i in this) res[i] = cb.call(thisArg, this[i], i, this); return res; }`."],
      ["Why use a regular function, not an arrow, for prototype methods?", "Because the method needs `this` to be the array it was called on; arrows ignore the call-site and take `this` from the surrounding scope."],
      ["What is a polyfill?", "Code that implements a standard feature in environments that lack it, usually guarded so it only runs when the native version is missing."],
    ],
    exercise:
      "Write `Array.prototype.mySome(cb)` that returns true as soon as the callback returns truthy for any element.",
    answer:
      "`Array.prototype.mySome = function (cb, thisArg) { for (let i = 0; i < this.length; i++) { if (i in this && cb.call(thisArg, this[i], i, this)) return true; } return false; };`",
  }),

  "nj-functional--map": njs({
    intro:
      "`map` transforms an array: it calls a function on every element and returns a new array of the same length containing each result. The original array is untouched. Use it whenever every input should produce exactly one output, such as doubling numbers, converting to binary, or turning user objects into display names.",
    concepts: [
      "`array.map(fn)` returns a new array where `result[i] = fn(array[i], i, array)`. Length in = length out.",
      "The transformation is the callback. It can be a named function (`double`), an anonymous function, or an arrow: `arr.map((x) => x.toString(2))`.",
      "`map` is for producing values. If you only want side effects (logging, pushing elsewhere), use `forEach`; if you want fewer elements, use `filter`.",
    ],
    snapshot: {
      title: "arr.map(double)",
      panes: [
        ["arr (unchanged)", ["5", "1", "3", "2", "6"]],
        ["callback", ["double(x) = x * 2"]],
        ["output (new)", ["*10", "2", "6", "4", "12"]],
      ],
      caption: "One output per input, in the same order. arr still holds [5, 1, 3, 2, 6] afterwards.",
    },
    animation: {
      title: "Transforming element by element",
      nodes: [
        ["arr", "arr", "[5, 1, 3, 2, 6]"],
        ["map", "map()", "iterates"],
        ["fn", "double", "x * 2"],
        ["out", "output", "new array"],
      ],
      steps: [
        ["arr", "map", "5", "map takes the first element, 5."],
        ["map", "fn", "double(5)", "It calls the callback with the element, its index and the array."],
        ["fn", "out", "10", "The returned 10 becomes output[0]."],
        ["map", "out", "…12", "The same happens for every element until output has five values."],
        ["arr", "arr", "unchanged", "The original array is never modified."],
      ],
    },
    code: `const arr = [5, 1, 3, 2, 6];

function double(x) { return x * 2; }
console.log("double:", arr.map(double));
console.log("triple:", arr.map(function triple(x) { return x * 3; }));
console.log("binary:", arr.map((x) => x.toString(2)));
console.log("original:", arr);

// map on objects
${users}
console.log("full names:", users.map((user) => user.firstName + " " + user.lastName));

// index and a common pitfall
console.log("with index:", ["a", "b", "c"].map((letter, i) => i + ":" + letter));
console.log("parseInt pitfall:", ["1", "7", "11"].map(parseInt));
console.log("fixed:", ["1", "7", "11"].map((s) => parseInt(s, 10)));`,
    walkthrough:
      "Each `map` call returns a new five-element array; `arr` itself is unchanged. Mapping users produces display names. The index is the second callback argument. The `parseInt` pitfall happens because `map` passes `(value, index)` and `parseInt` treats the index as the radix: `parseInt('7', 1)` is NaN and `parseInt('11', 2)` is 3.",
    deepDive: [
      {
        heading: "map vs forEach",
        points: [
          "`map` returns a new array; `forEach` returns `undefined`.",
          "Chainable: `arr.map(...).filter(...)` works, `forEach` cannot be chained.",
          "If you ignore map's return value, you wanted `forEach`.",
        ],
      },
      {
        heading: "Returning objects from arrow callbacks",
        code: `users.map((u) => ({ name: u.firstName, adult: u.age >= 18 }));`,
        paragraphs: ["Wrap the object literal in parentheses; otherwise the braces are read as a function body and the result is `undefined`."],
      },
    ],
    mistakes: [
      "Using `map` only for side effects and discarding the array.",
      "Passing functions with optional second parameters (like `parseInt`) directly.",
      "Forgetting to `return` inside a block-bodied callback, producing an array of `undefined`.",
    ],
    interview: [
      ["What does map return?", "A new array of the same length, where each element is the callback's return value for the corresponding element. The original array is not mutated."],
      ["Why does ['1','7','11'].map(parseInt) return [1, NaN, 3]?", "map calls parseInt(value, index, array); the index becomes the radix: parseInt('1', 0) = 1, parseInt('7', 1) = NaN, parseInt('11', 2) = 3."],
      ["Difference between map and forEach?", "map returns a new transformed array and is chainable; forEach just runs the callback for side effects and returns undefined."],
    ],
    exercise:
      "From `users`, produce `[\"ASHA (26)\", \"RAVI (75)\", ...]` with a single `map`.",
    answer:
      "`users.map((u) => u.firstName.toUpperCase() + \" (\" + u.age + \")\")`.",
  }),

  "nj-functional--filter": njs({
    intro:
      "`filter` selects elements: it calls a predicate function (one that returns true or false) for each element and returns a new array containing only the elements for which it returned a truthy value. The output can be shorter than the input, but the elements themselves are not transformed. Use it for 'only the odd numbers', 'users under 30', 'products in stock'.",
    concepts: [
      "`array.filter(predicate)` keeps `array[i]` when `predicate(array[i], i, array)` is truthy. Order is preserved; elements are the same values (same object references).",
      "The predicate is the logic: `isOdd`, `(x) => x > 4`, `(user) => user.age < 30`. Any truthy return counts as keep.",
      "`filter` always returns an array, possibly empty. To get just the first match, use `find`; to check existence, use `some`.",
    ],
    snapshot: {
      title: "arr.filter(isOdd)",
      panes: [
        ["arr", ["5 ✓", "1 ✓", "3 ✓", "2 ✗", "6 ✗"]],
        ["predicate", ["isOdd(x)", "x % 2 === 1"]],
        ["output", ["*5", "*1", "*3"]],
      ],
      caption: "Only the elements whose predicate returned true are copied to the new array, in their original order.",
    },
    animation: {
      title: "Keep or drop",
      nodes: [
        ["arr", "arr", "[5, 1, 3, 2, 6]"],
        ["pred", "isOdd", "true / false"],
        ["keep", "kept", "output"],
        ["drop", "dropped", "ignored"],
      ],
      steps: [
        ["arr", "pred", "5", "filter passes 5 to the predicate, which returns true."],
        ["pred", "keep", "keep 5", "Because the result is truthy, 5 is added to the output."],
        ["arr", "pred", "2", "Later 2 is tested and the predicate returns false."],
        ["pred", "drop", "drop 2", "2 is skipped; it does not appear in the output."],
        ["keep", "keep", "[5, 1, 3]", "The final array has only the odd numbers, in order."],
      ],
    },
    code: `const arr = [5, 1, 3, 2, 6];

function isOdd(x) { return x % 2 === 1; }
console.log("odd:", arr.filter(isOdd));
console.log("even:", arr.filter((x) => x % 2 === 0));
console.log("greater than 4:", arr.filter((x) => x > 4));

${users}
console.log("under 30:", users.filter((u) => u.age < 30).map((u) => u.firstName));

// filter keeps references, not copies
const young = users.filter((u) => u.age < 30);
console.log("same object?", young[0] === users[0]);

// related methods
console.log("find:", users.find((u) => u.age > 40).firstName);
console.log("some over 70?", users.some((u) => u.age > 70));
console.log("remove falsy:", [0, "a", "", null, "b", undefined].filter(Boolean));`,
    walkthrough:
      "`isOdd` keeps 5, 1 and 3. Arrow predicates select even numbers and numbers greater than 4. On objects, `filter` picks the users under 30 and `map` extracts their names. The filtered array contains the same objects as the original (a shallow selection). `find` returns the first match, `some` answers yes/no, and `filter(Boolean)` drops falsy values.",
    deepDive: [
      {
        heading: "Predicates that read well",
        code: `const isAdult = (u) => u.age >= 18;
const byCity = (city) => (u) => u.city === city;   // predicate factory
users.filter(isAdult).filter(byCity("Pune"));`,
        paragraphs: ["Naming predicates turns filtering into readable sentences, and predicate factories make them configurable."],
      },
      {
        heading: "Removing duplicates",
        code: `const unique = [3, 1, 3, 2, 1].filter((x, i, all) => all.indexOf(x) === i);
// [3, 1, 2]  (for large arrays prefer [...new Set(arr)])`,
      },
    ],
    mistakes: [
      "Using `filter(...)[0]` instead of `find`, which scans the whole array.",
      "Mutating the objects inside a filtered array and being surprised the originals changed (they are the same objects).",
    ],
    interview: [
      ["What does filter do?", "Returns a new array with only the elements for which the callback returns a truthy value; the original array is unchanged."],
      ["filter vs find?", "filter returns all matches as an array (possibly empty); find returns the first matching element or undefined and stops early."],
      ["What does arr.filter(Boolean) do?", "Passes each element to the Boolean function, keeping only truthy values, which removes 0, '', null, undefined, NaN and false."],
    ],
    exercise:
      "Get the first names of users whose last name has more than 5 letters.",
    answer:
      "`users.filter((u) => u.lastName.length > 5).map((u) => u.firstName)` → `[\"Kabir\"]` (Malhotra has 8 letters; Verma, Kumar and Nair have 5 or fewer).",
  }),

  "nj-functional--reduce": njs({
    intro:
      "`reduce` boils an array down to a single value: a sum, a maximum, an object of counts, or even a new array. It walks the elements while carrying an accumulator. The callback receives the accumulator and the current element and returns the new accumulator. The second argument to `reduce` is the initial value of the accumulator.",
    concepts: [
      "`array.reduce((acc, curr, index, array) => newAcc, initialValue)`. The return value of each call becomes `acc` for the next; the final `acc` is the result.",
      "The initial value matters. Without it, the first element becomes the accumulator and iteration starts at index 1; on an empty array that throws a TypeError.",
      "Anything you can build with a loop and a running variable can be a reduce: sum, max, grouping into an object, flattening, even map and filter.",
    ],
    snapshot: {
      title: "arr.reduce((acc, curr) => acc + curr, 0)",
      panes: [
        ["curr", ["5", "1", "3", "2", "6"]],
        ["acc before", ["0", "5", "6", "9", "11"]],
        ["acc after", ["5", "6", "9", "11", "*17"]],
      ],
      caption: "Each row is one callback call. The final accumulator, 17, is what reduce returns.",
    },
    animation: {
      title: "Carrying an accumulator",
      nodes: [
        ["init", "initial", "acc = 0"],
        ["cb", "callback", "acc + curr"],
        ["arr", "arr", "[5, 1, 3, 2, 6]"],
        ["res", "result", "17"],
      ],
      steps: [
        ["init", "cb", "acc 0", "reduce starts with the initial value 0 as the accumulator."],
        ["arr", "cb", "curr 5", "The first element 5 is passed in; the callback returns 5."],
        ["cb", "cb", "acc 5 → 6", "That return becomes acc for the next element, 1, giving 6."],
        ["arr", "cb", "… 6", "The same happens for 3, 2 and 6."],
        ["cb", "res", "17", "After the last element, the accumulator 17 is returned."],
      ],
    },
    code: `const arr = [5, 1, 3, 2, 6];

// Loop version
let sum = 0;
for (let i = 0; i < arr.length; i++) sum += arr[i];

// reduce version
const total = arr.reduce((acc, curr) => acc + curr, 0);
console.log("sum:", sum, total);

const max = arr.reduce((acc, curr) => (curr > acc ? curr : acc), -Infinity);
console.log("max:", max);

${users}

// Group into an object (integer-like keys print in ascending order)
const countByAge = users.reduce((acc, user) => {
  acc[user.age] = (acc[user.age] ?? 0) + 1;
  return acc;
}, {});
console.log("count by age:", countByAge);

// map + filter in one pass
const youngNames = users.reduce((acc, u) => (u.age < 30 ? [...acc, u.firstName] : acc), []);
console.log("under 30:", youngNames);

try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.name + ":", e.message); }`,
    walkthrough:
      "The loop and `reduce` both sum to 17. The max reducer keeps the bigger of `acc` and `curr`, giving 6. Grouping returns an object keyed by age (two people are 26); integer-like keys are always listed in ascending order. The last reducer does filter and map in one pass. Reducing an empty array without an initial value throws a TypeError.",
    deepDive: [
      {
        heading: "Always pass an initial value",
        points: [
          "It makes the accumulator's type explicit (0, '', {}, []).",
          "It makes empty arrays safe.",
          "It avoids bugs where the first element is an object and you try `acc + curr.price`.",
        ],
        code: `const cart = [{ price: 10 }, { price: 5 }];
cart.reduce((acc, item) => acc + item.price, 0);  // 15
cart.reduce((acc, item) => acc + item.price);     // "[object Object]5"`,
      },
      {
        heading: "reduceRight and Object.groupBy",
        paragraphs: [
          "`reduceRight` walks from the last element to the first. For grouping, modern runtimes also offer `Object.groupBy(users, (u) => u.age)`, which returns arrays of items per key.",
        ],
      },
    ],
    mistakes: [
      "Forgetting to `return acc` from a block-bodied reducer, so the accumulator becomes `undefined`.",
      "Writing unreadable reducers for things `map`/`filter`/`Math.max` express more clearly.",
    ],
    interview: [
      ["How does reduce work?", "It calls the callback for each element with (accumulator, current, index, array). The callback's return value becomes the next accumulator, and the final accumulator is returned."],
      ["What happens if you omit the initial value?", "The first element becomes the initial accumulator and iteration starts at index 1; on an empty array, reduce throws TypeError: Reduce of empty array with no initial value."],
      ["Find the max of an array with reduce.", "`arr.reduce((acc, curr) => (curr > acc ? curr : acc), -Infinity)` or `arr.reduce((a, b) => Math.max(a, b))`."],
    ],
    exercise:
      "With `reduce`, build `{ Asha: 'Verma', Ravi: 'Kumar', ... }` from `users`.",
    answer:
      "`users.reduce((acc, u) => { acc[u.firstName] = u.lastName; return acc; }, {})`.",
  }),

  "nj-functional--chaining-map-filter-and-reduce": njs({
    intro:
      "Because `map` and `filter` return arrays, you can chain them: filter the users you want, then map them to the field you need, then reduce to a single value. Chaining reads like a pipeline of small steps. It is the style used in most modern JavaScript code, and the same tasks can always be rewritten as a single `reduce` when performance or a single pass matters.",
    concepts: [
      "Each method returns a new array, so the next method is called on that result: `users.filter(isYoung).map(getName)`.",
      "Order matters: filter first to shrink the data, then map; reduce usually comes last because it returns a non-array value.",
      "A chain creates intermediate arrays. For hot paths with huge data, a single `reduce` or a `for...of` loop does it in one pass.",
    ],
    snapshot: {
      title: "users.filter(age < 30).map(firstName)",
      panes: [
        ["users", ["Asha 26", "Ravi 75", "Meera 50", "Kabir 26"]],
        ["after filter", ["*Asha 26", "*Kabir 26"]],
        ["after map", ["'Asha'", "'Kabir'"]],
      ],
      caption: "Every step produces a new array. The final array contains only first names of users under 30.",
    },
    animation: {
      title: "A data pipeline",
      nodes: [
        ["src", "users", "4 objects"],
        ["f", "filter", "age < 30"],
        ["m", "map", "firstName"],
        ["r", "reduce", "join / count"],
        ["out", "result", "value"],
      ],
      steps: [
        ["src", "f", "4 users", "All four users enter the filter step."],
        ["f", "m", "2 users", "Only users under 30 continue to map."],
        ["m", "r", "names", "map turns each user into a first name."],
        ["r", "out", "result", "reduce (or join) combines the names into one value."],
      ],
    },
    code: `${users}

// filter → map
const youngNames = users.filter((u) => u.age < 30).map((u) => u.firstName);
console.log("under 30:", youngNames);

// map → reduce: total age and average
const totalAge = users.map((u) => u.age).reduce((acc, age) => acc + age, 0);
console.log("average age:", totalAge / users.length);

// filter → map → reduce: initials of users aged 40+
const initials = users
  .filter((u) => u.age >= 40)
  .map((u) => u.firstName[0] + u.lastName[0])
  .reduce((acc, pair) => acc + (acc ? "," : "") + pair, "");
console.log("40+ initials:", initials);

// The same as the first chain, in one reduce pass
const youngNamesOnePass = users.reduce((acc, u) => {
  if (u.age < 30) acc.push(u.firstName);
  return acc;
}, []);
console.log("one pass:", youngNamesOnePass);`,
    walkthrough:
      "The first chain keeps Asha and Kabir and maps them to names. The second maps to ages and reduces to 177, averaging 44.25. The third filters to Ravi and Meera, maps to initials and reduces to 'RK,MN'. The single `reduce` gives the same names as the first chain without creating an intermediate array.",
    deepDive: [
      {
        heading: "Formatting long chains",
        paragraphs: [
          "Put each method on its own line and name non-trivial callbacks. A chain should read top to bottom like a recipe.",
        ],
        code: `const isActive = (u) => u.active;
const toLabel = (u) => \`\${u.name} <\${u.email}>\`;
const labels = users.filter(isActive).map(toLabel).join("\\n");`,
      },
      {
        heading: "When chaining is not ideal",
        points: [
          "Huge arrays in hot loops: each step allocates a new array.",
          "Early exit needed: chains cannot stop midway; use `find`, `some` or a loop.",
          "Lazy pipelines: iterator helpers (`values().filter().map().take(5)`) process items one by one in modern runtimes.",
        ],
      },
    ],
    mistakes: [
      "Mapping before filtering, doing wasted work on elements that are later discarded.",
      "Calling `forEach` in the middle of a chain; it returns undefined and breaks it.",
    ],
    interview: [
      ["Get first names of users under 30 using filter and map.", "`users.filter((u) => u.age < 30).map((u) => u.firstName)`."],
      ["Do the same with only reduce.", "`users.reduce((acc, u) => (u.age < 30 ? (acc.push(u.firstName), acc) : acc), [])`."],
      ["Why can you chain map and filter but not forEach?", "map and filter return new arrays, so the next array method can be called on the result; forEach returns undefined."],
    ],
    exercise:
      "Return the sum of the doubled even numbers in `[5, 1, 3, 2, 6]` with a chain.",
    answer:
      "`[5, 1, 3, 2, 6].filter((x) => x % 2 === 0).map((x) => x * 2).reduce((a, b) => a + b, 0)` → 16 (2 and 6 doubled are 4 and 12).",
  }),
};
