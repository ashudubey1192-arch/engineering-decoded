import { lesson as L, mdn } from "./webLessonSchema.js";
const js = (path) => mdn(`Web/JavaScript/${path}`);
const api = (path) => mdn(`Web/API/${path}`);
export const javascriptLessons = {
  "foundations--values-and-types": L(
    "JavaScript values have runtime types, and understanding those types prevents accidental coercion.",
    [
      "Primitive types include string, number, bigint, boolean, undefined, symbol, and null. Objects hold properties and are compared by identity rather than by their visible contents.",
      "typeof is useful but has historical exceptions: typeof null is object and arrays also report object. Use Array.isArray for arrays and explicit null checks when absence matters.",
    ],
    `const title = 'JavaScript';\nconst minutes = 20;\nconst complete = false;\nconsole.log(typeof title, typeof minutes, typeof complete);\nconsole.log(typeof null); // 'object' — historical behavior\nconsole.log(Array.isArray([title])); // true\nconsole.log({ id: 1 } === { id: 1 }); // false`,
    [
      [
        "Classify",
        "The first three values have string, number, and boolean types respectively.",
        ["title: string", "minutes: number", "complete: boolean"],
      ],
      [
        "Handle exceptions",
        "The null and array checks require more than a simple typeof comparison.",
        ["null → object", "Array.isArray → true", "Explicit checks"],
      ],
      [
        "Compare identity",
        "The two object expressions allocate different objects, even though their properties match.",
        ["Object A: id=1", "Object B: id=1", "A === B: false"],
      ],
    ],
    "Do not confuse missing values with all falsy values. Zero, false, and an empty string can be valid domain data.",
    "What does typeof undefined return, and does [1] === [1] evaluate to true?",
    "typeof undefined returns the string undefined. The arrays are distinct objects, so strict equality is false.",
    js("Guide/Data_structures"),
  ),
  "foundations--variables": L(
    "Variables bind names to values; declaration choice determines reassignment and scope behavior.",
    [
      "Use const when the binding will not be reassigned and let when reassignment is needed. Both are block-scoped and cannot be accessed before initialization in their temporal dead zone.",
      "const protects the binding, not the contents of an object. var is function-scoped and has different hoisting behavior, so prefer block-scoped declarations for clearer local reasoning.",
    ],
    `const lesson = { title: 'Variables', completed: false };\nlesson.completed = true; // object mutation is allowed\nlet remaining = 3;\nremaining -= 1;\nif (remaining > 0) {\n  const message = 'Keep going';\n  console.log(message);\n}\nconsole.log(remaining); // 2`,
    [
      [
        "Bind",
        "The lesson binding points to an object, while remaining starts with a number.",
        ["lesson → object", "remaining = 3", "Bindings created"],
      ],
      [
        "Update",
        "A property mutation changes the object; a reassignment changes the value held by remaining.",
        ["completed: true", "remaining: 2", "Different operations"],
      ],
      [
        "Scope",
        "message exists only inside the conditional block.",
        ["Enter block", "message initialized", "Leave block: name unavailable"],
      ],
    ],
    "Do not interpret const as deep immutability. Avoid shadowing important names in nested blocks when it makes the data flow unclear.",
    'Would lesson = {} be allowed? Would lesson.title = "Scope" be allowed?',
    "Reassigning lesson is forbidden because it is const. Mutating its title property is allowed unless the object has separately been made non-writable.",
    js("Reference/Statements/const"),
  ),
  "foundations--operators": L(
    "Operators combine, compare, and choose values, sometimes with implicit conversion.",
    [
      "Prefer strict equality when you want comparison without loose coercion. The plus operator can concatenate strings, so validate or convert input before arithmetic.",
      "Nullish coalescing uses a fallback only for null or undefined. Logical OR also replaces other falsy values such as zero and an empty string. Optional chaining safely stops a property access at a nullish receiver.",
    ],
    `const input = '4';\nconsole.log(input + 1); // '41'\nconsole.log(Number(input) + 1); // 5\nconst completed = 0;\nconsole.log(completed || 10); // 10\nconsole.log(completed ?? 10); // 0\nconst profile = null;\nconsole.log(profile?.name ?? 'Guest'); // Guest`,
    [
      [
        "Coerce",
        "A string operand makes plus concatenate; explicit numeric conversion changes the operation.",
        ['"4" + 1 → "41"', 'Number("4") → 4', "4 + 1 → 5"],
      ],
      [
        "Choose fallback",
        "Zero is falsy but not nullish, so OR and nullish coalescing produce different results.",
        ["completed: 0", "|| → 10", "?? → 0"],
      ],
      [
        "Read safely",
        "Optional chaining stops at the null profile and the nullish fallback supplies a label.",
        ["profile: null", "?.name → undefined", "Fallback: Guest"],
      ],
    ],
    "Do not use OR defaults when zero is meaningful. Optional chaining can conceal a broken required invariant if used indiscriminately.",
    "Which fallback operator preserves a valid empty search string: logical OR or nullish coalescing?",
    "Use ?? when only null or undefined should trigger the default. An empty string remains unchanged, while || would replace it.",
    js("Guide/Expressions_and_operators"),
  ),
  "foundations--control-flow": L(
    "Control flow determines which operations run and how often they repeat.",
    [
      "Use if for conditional branches, switch for discrete alternatives, and loops for repeated work. Choose conditions that express domain intent rather than relying on accidental truthiness.",
      "break exits a loop, continue skips to its next iteration, and return exits a function. Keep termination conditions visible so loops cannot run indefinitely by mistake.",
    ],
    `const minutes = [10, 0, 15];\nlet total = 0;\nfor (const value of minutes) {\n  if (value === 0) continue;\n  total += value;\n}\nif (total >= 20) console.log('Goal reached');\nelse console.log('Keep practicing');\nconsole.log(total); // 25`,
    [
      [
        "First item",
        "Ten is nonzero, so it contributes to the total.",
        ["value: 10", "total: 0 + 10", "total = 10"],
      ],
      [
        "Skip",
        "Zero hits continue and skips the addition for that iteration.",
        ["value: 0", "continue", "total stays 10"],
      ],
      [
        "Finish",
        "Fifteen raises the total to 25, so the goal branch runs.",
        ["value: 15", "total = 25", "Goal reached"],
      ],
    ],
    "Do not confuse return with break in a function containing a loop. Return ends the whole function, not just the current iteration.",
    "Replace continue with break. What total will be printed?",
    "The loop stops at zero, so fifteen is never processed and the total is ten. The Keep practicing branch runs.",
    js("Guide/Loops_and_iteration"),
  ),
  "foundations--functions": L(
    "Functions give a calculation or operation a name, inputs, and an explicit output contract.",
    [
      "Parameters receive arguments, and return provides the result to the caller. A function with no executed return statement produces undefined.",
      "Keep pure calculations separate from side effects where practical. Default parameters apply to missing or undefined arguments, not null. Arrow functions have lexical this rather than their own receiver.",
    ],
    `function remaining(total, completed = 0) {\n  return Math.max(0, total - completed);\n}\nconst format = count => count + ' lessons left';\nconsole.log(format(remaining(5, 2))); // 3 lessons left\nconsole.log(remaining(5)); // 5`,
    [
      [
        "Call",
        "The caller supplies total five and completed two.",
        ["total = 5", "completed = 2", "Enter function"],
      ],
      [
        "Calculate",
        "The subtraction gives three and Math.max prevents a negative result.",
        ["5 - 2 = 3", "Clamp at zero", "Return 3"],
      ],
      [
        "Compose",
        "The formatter receives the returned number and creates the display string.",
        ["3", "format(3)", "3 lessons left"],
      ],
    ],
    "Logging a value is not the same as returning it. Validate domain inputs if negative or nonnumeric values would violate the function contract.",
    "What does remaining(3, 8) return, and why?",
    "It returns zero because the raw difference is negative and Math.max clamps it. Decide whether clamping or rejecting invalid completion counts best fits the domain.",
    js("Guide/Functions"),
  ),
  "data--objects": L(
    "Objects group related properties and methods behind a shared identity.",
    [
      "Use dot access for known property names and bracket access for computed keys. Reading a missing property returns undefined; Object.hasOwn distinguishes own properties from inherited ones.",
      "Assigning an object to another variable shares the same object reference. A shallow spread creates a new outer object but still shares nested objects.",
    ],
    `const lesson = { id: 7, title: 'Objects', meta: { minutes: 20 } };\nconst alias = lesson;\nalias.title = 'Object identity';\nconst copy = { ...lesson };\ncopy.meta.minutes = 30;\nconsole.log(lesson.title); // Object identity\nconsole.log(lesson.meta.minutes); // 30\nconsole.log(Object.hasOwn(lesson, 'id')); // true`,
    [
      [
        "Alias",
        "lesson and alias both point to the same outer object.",
        ["lesson", "Shared object", "alias"],
      ],
      [
        "Shallow copy",
        "Spread creates a new outer object while its meta property still points to the original nested object.",
        ["Original outer object", "Shared meta", "Copied outer object"],
      ],
      [
        "Mutate nested",
        "Changing copy.meta.minutes is visible through lesson.meta too.",
        ["Shared meta.minutes", "Assigned 30", "Both observe 30"],
      ],
    ],
    "Do not assume spread performs a deep clone. Choose explicit nested copying or a suitable structured clone when the data and requirements permit.",
    "How can you change minutes in a new copy without changing the original?",
    "Create { ...lesson, meta: { ...lesson.meta, minutes: 40 } }. Both the changed outer path and nested object receive new identities.",
    js("Guide/Working_with_objects"),
  ),
  "data--arrays": L(
    "Arrays represent ordered collections and provide transformations for selecting and deriving data.",
    [
      "map creates a transformed array, filter selects matching items, and reduce accumulates a result. Choose the operation that states your intent rather than mutating external variables unnecessarily.",
      "Methods such as push, splice, and sort mutate the array. Transformation methods usually create a new array but do not automatically clone the objects inside it.",
    ],
    `const lessons = [\n  { title: 'HTML', minutes: 10, done: true },\n  { title: 'CSS', minutes: 20, done: false },\n  { title: 'JS', minutes: 30, done: false }\n];\nconst pending = lessons.filter(item => !item.done);\nconst names = pending.map(item => item.title);\nconst total = pending.reduce((sum, item) => sum + item.minutes, 0);\nconsole.log(names, total); // ['CSS', 'JS'], 50`,
    [
      [
        "Select",
        "filter keeps the two unfinished lessons and leaves the source array intact.",
        ["3 source lessons", "done === false", "CSS + JS"],
      ],
      [
        "Project",
        "map reads each remaining title to produce a new string array.",
        ["Pending objects", "Read title", "[CSS, JS]"],
      ],
      [
        "Accumulate",
        "reduce starts at zero and adds twenty then thirty.",
        ["Accumulator: 0", "0 + 20", "20 + 30 = 50"],
      ],
    ],
    "Do not use map only for side effects or forget an initial reduce value when an array may be empty.",
    "If all lessons are complete, what are names and total?",
    "names is an empty array and total is zero. The explicit initial accumulator makes reduce safe for an empty pending list.",
    js("Reference/Global_Objects/Array"),
  ),
  "data--maps-and-sets": L(
    "Map models key-value associations and Set models unique membership.",
    [
      "Map accepts keys of any type and preserves insertion order. Its size and iteration APIs differ from plain object properties.",
      "Set removes duplicate primitive values and compares objects by identity. Two separate objects with the same ID remain different set entries unless you store the ID itself.",
    ],
    `const titles = new Map([[7, 'HTML'], [8, 'CSS']]);\nconst completed = new Set([7, 7, 8]);\nconsole.log(titles.get(7)); // HTML\nconsole.log(completed.size); // 2\ncompleted.delete(8);\nconsole.log(completed.has(8)); // false`,
    [
      [
        "Associate",
        "The map stores numeric IDs as keys rather than converting them to object property strings.",
        ["Key 7", "Map lookup", "HTML"],
      ],
      [
        "Deduplicate",
        "Adding seven twice leaves a single membership entry for that value.",
        ["Input: 7,7,8", "Unique membership", "Size: 2"],
      ],
      [
        "Remove",
        "Deleting eight leaves only seven in the set.",
        ["Before: {7,8}", "delete(8)", "After: {7}"],
      ],
    ],
    "Do not use map[key] to access a Map entry; use get and set. A Set of objects does not deduplicate by an id field automatically.",
    "What is new Set([{id:1}, {id:1}]).size?",
    "It is two because the objects have different identities. Store IDs or explicitly compare a chosen key when logical deduplication is required.",
    js("Guide/Keyed_collections"),
  ),
  "data--destructuring": L(
    "Destructuring extracts selected values from arrays or objects into local bindings.",
    [
      "Object patterns select by property name and can rename bindings. Array patterns select by position. Rest syntax gathers remaining properties or elements into a new outer collection.",
      "Defaults apply only when the extracted value is undefined. Destructuring nested data requires the intermediate structure to exist unless you provide a default.",
    ],
    `const lesson = { title: 'Destructuring', minutes: 0, level: 'beginner' };\nconst { title: heading, minutes = 10, ...details } = lesson;\nconst [first, ...rest] = ['HTML', 'CSS', 'JS'];\nconsole.log(heading, minutes); // Destructuring, 0\nconsole.log(details, first, rest);`,
    [
      [
        "Select names",
        "title is read into a new local binding named heading.",
        ["lesson.title", "Rename binding", "heading"],
      ],
      [
        "Apply default",
        "minutes is zero, not undefined, so the default ten is not used.",
        ["minutes: 0", "Undefined check: false", "Result: 0"],
      ],
      [
        "Collect rest",
        "The array pattern extracts HTML and collects the later items into a new array.",
        ["[HTML, CSS, JS]", "first: HTML", "rest: [CSS, JS]"],
      ],
    ],
    "A destructuring assignment does not create a live link to future primitive property changes. Nested objects can still be shared references.",
    "If minutes were null, would the default ten apply?",
    "No. Destructuring defaults only replace undefined. Use an explicit nullish fallback if null should also mean missing.",
    js("Reference/Operators/Destructuring"),
  ),
  "data--immutability": L(
    "Immutable updates create a new changed path while preserving the previous state for comparison or reuse.",
    [
      "Copy the arrays and objects along the path you change. Unchanged branches may be shared safely when code respects the no-mutation convention.",
      "Immutability is a design discipline, not a property of const. Object.freeze is shallow by default, and deep copying everything can be wasteful or unsuitable for certain values.",
    ],
    `const before = [{ id: 1, done: false }, { id: 2, done: false }];\nconst after = before.map(item =>\n  item.id === 1 ? { ...item, done: true } : item\n);\nconsole.log(before[0].done, after[0].done); // false, true\nconsole.log(before === after); // false\nconsole.log(before[1] === after[1]); // true`,
    [
      [
        "Preserve",
        "The original array remains a valid snapshot of unfinished lessons.",
        ["before array", "Item 1: false", "Item 2: false"],
      ],
      [
        "Copy changed path",
        "map creates a new array and the spread creates a new object only for item one.",
        ["New array", "New item 1", "Shared item 2"],
      ],
      [
        "Compare",
        "The changed objects have new identities while the unchanged item remains shared.",
        ["before !== after", "item1 identity changed", "item2 identity retained"],
      ],
    ],
    "Copying the array and then mutating a shared item still changes the old state. Clone the changed nested path too.",
    "Why can sharing item two be safe here?",
    "Its data did not change and the update discipline avoids mutating it later. Structural sharing saves copying while retaining previous-state integrity.",
    js("Reference/Operators/Spread_syntax"),
  ),
  "language--scope-and-closures": L(
    "A closure retains access to bindings from the lexical scope where a function was created.",
    [
      "Scope follows source nesting, not the place a function is later called. Returned functions can continue using local state after the outer function has returned.",
      "Each invocation can create independent private state. Closures retain reachable values, so long-lived callbacks can also keep large objects alive unintentionally.",
    ],
    `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst first = createCounter();\nconst second = createCounter();\nconsole.log(first(), first(), second()); // 1, 2, 1`,
    [
      [
        "Create scope",
        "Calling createCounter allocates a count binding for that invocation.",
        ["Call A", "count A = 0", "Return closure A"],
      ],
      [
        "Retain",
        "Calling first twice updates the same retained count binding.",
        ["first()", "count A: 1 → 2", "Results: 1,2"],
      ],
      [
        "Separate",
        "The second factory call owns a different binding, so its first result is one.",
        ["Call B", "count B = 0", "second() → 1"],
      ],
    ],
    "Do not assume closures capture a frozen value; they access bindings whose values can change. Clean up callbacks that no longer need their captured data.",
    "What does calling second() again return, and does it affect first?",
    "It returns two and leaves first’s count unchanged. The closures were created by different outer invocations.",
    js("Guide/Closures"),
  ),
  "language--this-keyword": L(
    "For ordinary functions, this usually depends on how the function is called rather than where it was defined.",
    [
      "A method call object.method() supplies object as the receiver. Extracting the method into a standalone variable loses that call-site relationship.",
      "bind creates a function with a fixed receiver. Arrow functions capture this from their surrounding scope and cannot be rebound in the same way. Prefer explicit parameters when they make ownership clearer.",
    ],
    `const planner = {\n  title: 'Study desk',\n  describe() { return this.title; }\n};\nconsole.log(planner.describe()); // Study desk\nconst describe = planner.describe.bind(planner);\nconsole.log(describe()); // Study desk`,
    [
      [
        "Method call",
        "The object before the dot is the receiver used by describe.",
        ["planner.describe()", "this = planner", "Read title"],
      ],
      [
        "Bind",
        "bind creates a new callable that remembers planner as its receiver.",
        ["Original function", "bind(planner)", "Bound function"],
      ],
      [
        "Call later",
        "The bound function works without a dotted call because the receiver is already fixed.",
        ["describe()", "Bound receiver", "Study desk"],
      ],
    ],
    "Passing an unbound method as a callback can lose this. An arrow used as an object property does not automatically receive that object as this.",
    "Why might const fn = planner.describe; fn() fail in a module?",
    "The standalone call has undefined this in strict mode, so reading this.title fails. Bind the method or wrap the call as () => planner.describe().",
    js("Reference/Operators/this"),
  ),
  "language--prototypes": L(
    "Property lookup can follow an object’s prototype chain when the property is not found on the object itself.",
    [
      "A prototype supplies shared behavior without copying it onto every instance. Own properties can shadow inherited properties with the same name.",
      "Object.create sets the prototype of a new object. Avoid modifying built-in prototypes because unrelated code shares those behaviors and may rely on their standard shape.",
    ],
    `const methods = { describe() { return 'Lesson: ' + this.title; } };\nconst lesson = Object.create(methods);\nlesson.title = 'Prototypes';\nconsole.log(lesson.describe()); // Lesson: Prototypes\nconsole.log(Object.hasOwn(lesson, 'describe')); // false\nconsole.log(Object.hasOwn(lesson, 'title')); // true`,
    [
      [
        "Own lookup",
        "The lesson object contains title but no own describe property.",
        ["lesson", "title found", "describe missing locally"],
      ],
      [
        "Follow chain",
        "Lookup continues to methods and finds describe there.",
        ["lesson prototype", "methods object", "describe found"],
      ],
      [
        "Call receiver",
        "Calling through lesson still sets this to lesson, so the inherited method reads its title.",
        ["lesson.describe()", "this = lesson", "Lesson: Prototypes"],
      ],
    ],
    "Inherited properties can appear in for...in iteration. Use Object.keys or own-property checks when the task requires only local data.",
    "What happens if lesson.describe is assigned a new function?",
    "The new own property shadows the prototype method for that object. Other objects sharing methods continue using the original method.",
    js("Guide/Inheritance_and_the_prototype_chain"),
  ),
  "language--classes": L(
    "Classes provide structured syntax for constructing objects and sharing methods through prototypes.",
    [
      "The constructor initializes each instance, while ordinary methods are shared on the prototype. Private fields beginning with # enforce access restrictions at runtime.",
      "Use inheritance when the subtype relationship is meaningful. Composition often keeps independent responsibilities easier to combine and test than deep class hierarchies.",
    ],
    `class StudySession {\n  #minutes = 0;\n  add(minutes) {\n    if (!Number.isFinite(minutes) || minutes < 0) throw new Error('Invalid minutes');\n    this.#minutes += minutes;\n  }\n  get total() { return this.#minutes; }\n}\nconst session = new StudySession();\nsession.add(15);\nconsole.log(session.total); // 15`,
    [
      [
        "Construct",
        "A new instance starts with its own private counter at zero.",
        ["new StudySession", "#minutes = 0", "Instance created"],
      ],
      [
        "Validate",
        "The public method rejects invalid input before changing state.",
        ["add(15)", "Finite and nonnegative", "Mutation allowed"],
      ],
      [
        "Expose result",
        "The getter reads the private field without exposing a public writable counter.",
        ["#minutes = 15", "get total", "Caller sees 15"],
      ],
    ],
    "Class syntax does not make method callbacks automatically bound. Do not use inheritance merely to share a small helper function.",
    "What happens when add(-5) is called, and does the total change?",
    "It throws before mutation, so the previous total remains intact. The method preserves its nonnegative-duration invariant.",
    js("Guide/Using_classes"),
  ),
  "language--modules": L(
    "Modules make dependencies explicit through exports and imports instead of shared global variables.",
    [
      "Named exports expose specific bindings and imports refer to those names. Browser modules use module scope, strict mode, and URL-based loading rules.",
      "A module is normally evaluated once per module instance in a given graph. Serve browser modules over HTTP during development and keep file paths aligned with the runtime or bundler.",
    ],
    `// FILE: math.js\nexport function remaining(total, done) { return Math.max(0, total - done); }\n\n// FILE: app.js\nimport { remaining } from './math.js';\nconsole.log(remaining(5, 2)); // 3\n\n// HTML entry: <script type="module" src="./app.js"></script>`,
    [
      [
        "Export",
        "math.js explicitly exposes remaining as part of its public module API.",
        ["math.js", "Named export", "remaining"],
      ],
      [
        "Resolve",
        "app.js names the dependency and requests the relative module URL.",
        ["app.js import", "./math.js", "Dependency graph"],
      ],
      [
        "Evaluate",
        "The dependency becomes available before the importer calls the function.",
        ["Module loaded", "remaining(5,2)", "Result: 3"],
      ],
    ],
    "Do not expect exported values to appear on window. Circular dependencies can expose initialization-order problems and deserve careful design.",
    "What must change if remaining is renamed to countRemaining in the exporting file?",
    "Update the import name and call, or export/import with an alias. Named imports must match an actual exported binding.",
    js("Guide/Modules"),
  ),
  "browser--dom-manipulation": L(
    "DOM APIs let JavaScript create, update, and remove document nodes.",
    [
      "Query only after the relevant markup exists and handle a missing element intentionally. createElement creates structure; textContent inserts plain text without interpreting it as markup.",
      "Prefer small targeted updates and keep data state separate from accidental DOM details. Repeated full subtree replacement can lose focus, selection, or event listeners.",
    ],
    `// HTML prerequisite: <ul id="lessons"></ul>\nconst list = document.querySelector('#lessons');\nif (!list) throw new Error('Missing lessons list');\nconst item = document.createElement('li');\nitem.textContent = 'Practice DOM updates';\nlist.append(item);`,
    [
      [
        "Find",
        "The selector locates the intended list or the explicit guard reports a setup problem.",
        ["#lessons query", "Element or null", "Guard required"],
      ],
      [
        "Create",
        "The new list item exists in memory and receives safe text content.",
        ["createElement(li)", "Set textContent", "Detached node"],
      ],
      [
        "Attach",
        "Appending connects the node to the live DOM, so it becomes part of the rendered list.",
        ["Detached li", "list.append", "Visible list item"],
      ],
    ],
    "Do not concatenate untrusted strings into innerHTML. Replacing a whole container can also discard user state in its descendants.",
    "How would you remove the item after creating it?",
    "Call item.remove(). Keep the reference or identify the intended node carefully so you do not remove unrelated content.",
    api("Document_Object_Model/Introduction"),
  ),
  "browser--events": L(
    "Events notify code about user actions and browser activity through a propagation path.",
    [
      "addEventListener registers a callback. target identifies the originating element, while currentTarget identifies the element whose listener is running.",
      "Many events bubble to ancestors, enabling delegation for dynamic lists. preventDefault cancels a cancelable default action; stopPropagation controls propagation and is a different operation.",
    ],
    `// HTML: <ul id="lessons"><li><button data-id="7">Complete</button></li></ul>\nconst list = document.querySelector('#lessons');\nlist.addEventListener('click', event => {\n  if (!(event.target instanceof Element)) return;\n  const button = event.target.closest('button[data-id]');\n  if (!button || !list.contains(button)) return;\n  console.log('Complete lesson', button.dataset.id);\n});`,
    [
      [
        "Originate",
        "A click may originate on the button or a nested icon inside it.",
        ["Click target", "Nearest matching button", "Lesson ID"],
      ],
      [
        "Bubble",
        "The event reaches the list listener, which handles all matching child buttons.",
        ["Button", "li ancestor", "ul listener"],
      ],
      [
        "Delegate",
        "The listener reads the button data and can also handle buttons added later.",
        ["One listener", "Dynamic descendants", "Action for ID 7"],
      ],
    ],
    "Do not confuse target with currentTarget. Avoid stopping propagation everywhere; it can break unrelated delegated behavior.",
    "Why use closest instead of checking event.target.tagName only?",
    "The click can land on a child inside the button. closest finds the containing actionable button while the containment check keeps the lookup within the list.",
    api("EventTarget/addEventListener"),
  ),
  "browser--forms": L(
    "Form scripts should build on native submission, validation, and named controls.",
    [
      "Listen for submit on the form rather than only click on the button so keyboard submission follows the same path. FormData reads successful named controls.",
      "Prevent the default only when the script supplies the intended behavior. Preserve entered values and expose validation or request failures instead of silently discarding them.",
    ],
    `// HTML: <form id="plan"><label>Topic <input name="topic" required></label><button>Save</button></form><p id="status" role="status"></p>\nconst form = document.querySelector('#plan');\nconst status = document.querySelector('#status');\nform.addEventListener('submit', event => {\n  event.preventDefault();\n  const data = new FormData(form);\n  const topic = String(data.get('topic') ?? '').trim();\n  status.textContent = topic ? 'Draft saved locally: ' + topic : 'Enter a topic';\n});`,
    [
      [
        "Submit",
        "A valid native form submission reaches the same handler whether initiated by keyboard or button.",
        ["User submits", "Native constraints", "submit event"],
      ],
      [
        "Read",
        "FormData uses the input name as the key and the script normalizes the text.",
        ["name: topic", "FormData.get", "Trim string"],
      ],
      [
        "Report",
        "The status region communicates the local demonstration result without navigating.",
        ["Normalized topic", "Update status text", "User receives feedback"],
      ],
    ],
    "This example only displays local feedback; it does not persist to a server. Do not announce a remote save as successful before the request succeeds.",
    "What changes if the input has an ID but no name?",
    "FormData does not include it under topic. IDs identify DOM elements; names define serialized form keys.",
    api("FormData"),
  ),
  "browser--storage": L(
    "Browser storage can preserve small client preferences, but reading and writing can fail.",
    [
      "localStorage stores strings per origin and persists beyond a tab session. sessionStorage has a tab-session lifetime. JSON serialization is needed for structured values.",
      "Stored data is not automatically trusted or private. Handle malformed data, schema changes, unavailable storage, and quota errors. Avoid sensitive credentials in script-readable storage.",
    ],
    `const key = 'study-preferences-v1';\nfunction readPreferences() {\n  try {\n    const value = JSON.parse(localStorage.getItem(key) ?? 'null');\n    return value?.theme === 'dark' ? { theme: 'dark' } : { theme: 'light' };\n  } catch { return { theme: 'light' }; }\n}\ntry { localStorage.setItem(key, JSON.stringify({ theme: 'dark' })); }\ncatch { /* Keep an in-memory preference if storage is unavailable. */ }\nconsole.log(readPreferences());`,
    [
      [
        "Serialize",
        "The object is encoded as a string before storage.",
        ["{theme:dark}", "JSON.stringify", "Stored string"],
      ],
      [
        "Read",
        "A later load parses the stored value but does not yet assume its shape is valid.",
        ["getItem", "JSON.parse", "Untrusted value"],
      ],
      [
        "Validate",
        "Only an allowed theme is accepted; invalid or unavailable data falls back safely.",
        ["Check theme", "dark or light", "Usable preference"],
      ],
    ],
    "Do not assume storage always succeeds or that JSON.parse validates your schema. Large synchronous storage operations can also block interaction.",
    "Why include v1 in the storage key?",
    "It makes a format boundary explicit. Future versions can migrate or ignore older data instead of interpreting a changed schema accidentally.",
    api("Web_Storage_API"),
  ),
  "browser--observers": L(
    "Observer APIs report changes without requiring constant polling from application code.",
    [
      "IntersectionObserver reports intersection changes, ResizeObserver reports element size changes, and MutationObserver reports configured DOM mutations. Choose the API matching the signal you need.",
      "Observers hold callbacks and targets until released. Disconnect them when a feature is removed, and avoid feedback loops such as resizing an element repeatedly from its resize callback.",
    ],
    `// HTML: <section id="practice">Practice exercise</section>\nconst target = document.querySelector('#practice');\nconst observer = new IntersectionObserver(entries => {\n  for (const entry of entries) {\n    if (entry.isIntersecting) {\n      console.log('Practice is in view');\n      observer.unobserve(entry.target);\n    }\n  }\n});\nif (target) observer.observe(target);\n// Feature cleanup: observer.disconnect();`,
    [
      [
        "Subscribe",
        "The observer starts tracking the practice section rather than checking every scroll event manually.",
        ["Target element", "observe(target)", "Subscription active"],
      ],
      [
        "Notify",
        "The callback receives intersection entries when observed conditions change.",
        ["Intersection change", "Entry.isIntersecting", "Visible threshold reached"],
      ],
      [
        "Release",
        "After the first relevant view, unobserve stops tracking this target.",
        ["Log once", "unobserve(target)", "No repeated tracking"],
      ],
    ],
    "Intersection is not proof that a person read the content. Handle unavailable APIs according to your browser support needs and clean up observers.",
    "Which observer should detect that a card’s container became wider?",
    "ResizeObserver fits element-size changes. IntersectionObserver answers visibility relative to a root, not precise layout sizing.",
    api("Intersection_Observer_API"),
  ),
  "async--event-loop": L(
    "The event loop coordinates synchronous JavaScript, queued tasks, and microtasks.",
    [
      "Synchronous code runs on the current call stack. Promise reactions are microtasks and run after the current synchronous work finishes at a microtask checkpoint.",
      "Timers schedule future tasks after a minimum delay, not an exact execution time. Long synchronous work blocks interaction, and an endlessly replenished microtask queue can also delay other work.",
    ],
    `console.log('A');\nsetTimeout(() => console.log('D'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('B');\n// Output: A, B, C, D`,
    [
      [
        "Run stack",
        "The current script logs A, schedules callbacks, then logs B without pausing for either callback.",
        ["Call stack: script", "Output: A, B", "Callbacks queued"],
      ],
      [
        "Drain microtasks",
        "The resolved promise reaction runs after the current script finishes.",
        ["Stack empty", "Promise microtask", "Output adds C"],
      ],
      [
        "Next task",
        "The timer callback can run in a later task, adding D.",
        ["Timer task ready", "Callback executes", "Output: A,B,C,D"],
      ],
    ],
    "A zero-millisecond timer is not immediate. Do not use a chain of promises to assume the browser will get a chance to paint between every step.",
    "Move the Promise.resolve line before setTimeout. Does the output order change?",
    "No. The current synchronous logs still run first, the promise reaction runs at the microtask checkpoint, and the timer runs later.",
    js("Reference/Execution_model"),
  ),
  "async--promises": L(
    "A promise represents the eventual fulfillment or rejection of an asynchronous operation.",
    [
      "then returns a new promise. Returning a value fulfills the next stage; throwing rejects it; returning another promise makes the chain wait for that promise.",
      "catch handles rejection and can recover by returning a value or preserve failure by throwing. finally is for cleanup and normally passes the previous result through unless it throws or rejects.",
    ],
    `Promise.resolve(3)\n  .then(count => count * 2)\n  .then(count => {\n    if (count < 5) throw new Error('Too few');\n    return count + 1;\n  })\n  .then(value => console.log(value)) // 7\n  .catch(error => console.error(error.message));`,
    [
      [
        "Fulfill",
        "The initial promise fulfills with three and schedules its reaction.",
        ["Promise resolved", "Value: 3", "First then"],
      ],
      [
        "Transform",
        "Returning six becomes the value for the next stage.",
        ["3 × 2", "Return 6", "Next promise fulfills"],
      ],
      [
        "Continue",
        "The condition passes and the following stage receives seven.",
        ["6 ≥ 5", "Return 7", "Log 7"],
      ],
    ],
    "Forgetting to return a nested promise breaks the chain’s timing and error propagation. Avoid constructing a new Promise around an API that already returns one.",
    "What happens if the initial value becomes one?",
    "The doubled value is two, so the second handler throws. The success logger is skipped and catch logs Too few.",
    js("Guide/Using_promises"),
  ),
  "async--async-and-await": L(
    "async and await express promise-based control flow with ordinary-looking sequencing and error handling.",
    [
      "An async function always returns a promise. await pauses that function’s continuation while allowing other work to run; it does not block the entire JavaScript thread.",
      "Start independent operations together when appropriate and await Promise.all for their results. Sequential awaits are correct when later work depends on earlier output.",
    ],
    `async function loadSummary() {\n  const titlePromise = Promise.resolve('JavaScript');\n  const countPromise = Promise.resolve(12);\n  const [title, count] = await Promise.all([titlePromise, countPromise]);\n  return title + ': ' + count + ' lessons';\n}\nloadSummary().then(console.log).catch(console.error);`,
    [
      [
        "Start",
        "Both independent promise-producing operations begin before waiting for either result.",
        ["Title operation", "Count operation", "Both in flight"],
      ],
      [
        "Join",
        "Promise.all fulfills with results in input order when both succeed, or rejects when one rejects.",
        ["Wait for both", "[title, count]", "Ordered results"],
      ],
      [
        "Return",
        "The async function returns a fulfilled promise containing the formatted summary.",
        ["Build string", "Async return", "Caller logs summary"],
      ],
    ],
    "Do not use await inside forEach expecting the outer function to wait. Use for...of for sequential work or map with Promise.all for intentional concurrency.",
    "If the count operation rejects, does the formatted summary return?",
    "No. Promise.all rejects and the async function rejects unless it catches the error. The caller’s catch handles that failure.",
    js("Reference/Statements/async_function"),
  ),
  "async--fetch-api": L(
    "fetch retrieves a response, but application code must interpret status, body, and failure modes.",
    [
      "fetch usually rejects for network-level failures, not ordinary HTTP error statuses. Check response.ok or the specific status before treating the response as success.",
      "Body readers such as json are asynchronous and can fail. Validate the resulting data shape before using it as domain data, and model loading, empty, and error states in the UI.",
    ],
    `async function getLessons() {\n  const response = await fetch('/api/lessons');\n  if (!response.ok) throw new Error('HTTP ' + response.status);\n  const data = await response.json();\n  if (!Array.isArray(data)) throw new Error('Expected a lesson array');\n  return data;\n}\n// Requires a server endpoint returning a JSON array.\ngetLessons().then(console.log).catch(error => console.error(error.message));`,
    [
      [
        "Request",
        "The relative URL targets the current origin’s API route.",
        ["GET /api/lessons", "Network request", "Response headers"],
      ],
      [
        "Check status",
        "A 500 response is still a response, so the explicit status check converts it into an application failure.",
        ["response.ok?", "False → throw", "True → read body"],
      ],
      [
        "Parse and validate",
        "JSON parsing produces a JavaScript value, then the shape check confirms it is an array.",
        ["JSON body", "Parsed value", "Array validation"],
      ],
    ],
    "Do not assume valid JSON has the expected fields or that a 404 automatically rejects fetch. A response body cannot be freely reread after consumption.",
    "What happens when the endpoint returns valid JSON containing an object instead of an array?",
    "Parsing succeeds but the explicit array check throws. Add item-level checks too when the application requires particular lesson properties.",
    api("Fetch_API/Using_Fetch"),
  ),
  "async--abortcontroller": L(
    "AbortController lets cooperating asynchronous APIs stop work that is no longer relevant.",
    [
      "Pass the controller signal to fetch and call abort when the user leaves or a newer request replaces the old one. An aborted signal stays aborted and should not be reused for new work.",
      "Cancellation is distinct from a genuine failure. For race-prone interfaces, also guard result application so an obsolete response cannot overwrite newer state.",
    ],
    `let current;\nasync function search(query) {\n  current?.abort();\n  const controller = new AbortController();\n  current = controller;\n  try {\n    const response = await fetch('/api/search?q=' + encodeURIComponent(query), { signal: controller.signal });\n    if (!response.ok) throw new Error('Search failed');\n    const results = await response.json();\n    if (!controller.signal.aborted) console.log(results);\n  } catch (error) {\n    if (!controller.signal.aborted) console.error(error);\n  }\n}\n// Call search from a debounced input handler; API endpoint required.`,
    [
      [
        "Start first",
        "A controller owns the current request and its cancellation signal.",
        ["Query: c", "Controller A", "Request A"],
      ],
      [
        "Replace",
        "A newer query aborts A and creates a fresh controller for B.",
        ["Query: css", "Abort A", "Start B"],
      ],
      [
        "Apply latest",
        "Only a non-aborted request applies its result, while expected cancellation stays quiet.",
        ["A ignored", "B succeeds", "Current results"],
      ],
    ],
    "Abort does not undo server-side mutations already performed. Use cancellation for obsolete work, not as a transaction rollback mechanism.",
    "Why create a new controller for every search?",
    "Once aborted, a signal cannot be reset. A fresh request needs a fresh non-aborted signal.",
    api("AbortController"),
  ),
  "patterns--functional-programming": L(
    "Functional techniques express transformations through inputs and outputs while limiting hidden mutation.",
    [
      "A pure function gives the same output for the same inputs and has no externally visible side effects. This makes isolated reasoning and tests straightforward.",
      "Use map, filter, and small functions when they clarify a transformation. Keep I/O at explicit boundaries instead of pretending all application work can be pure.",
    ],
    `const isPending = lesson => !lesson.done;\nconst toMinutes = lesson => lesson.minutes;\nconst sum = (left, right) => left + right;\nfunction pendingMinutes(lessons) {\n  return lessons.filter(isPending).map(toMinutes).reduce(sum, 0);\n}\nconsole.log(pendingMinutes([{ done: false, minutes: 15 }, { done: true, minutes: 20 }])); // 15`,
    [
      [
        "Select",
        "The pending predicate removes completed lessons without changing the source.",
        ["Lesson objects", "filter(isPending)", "Pending objects"],
      ],
      [
        "Project",
        "The mapper extracts the numeric duration from each remaining object.",
        ["Pending objects", "map(toMinutes)", "Durations"],
      ],
      [
        "Reduce",
        "The reducer combines the durations into one total starting from zero.",
        ["Durations", "reduce(sum,0)", "Total: 15"],
      ],
    ],
    "Do not overcompose tiny functions until a simple calculation becomes hard to follow. Pure-looking functions can still mutate nested inputs if you let them.",
    "What input should produce zero, and why is that useful to test?",
    "An empty list or a list of only completed lessons should produce zero. These boundary cases verify the accumulator and filtering contract.",
    js("Reference/Global_Objects/Array/reduce"),
  ),
  "patterns--composition": L(
    "Composition builds larger behavior by connecting smaller functions with compatible contracts.",
    [
      "Each stage should accept the previous stage’s output and return the next value. Keep data shapes and error behavior explicit so a pipeline is easy to inspect.",
      "Composition works for plain calculations, services, and components. It does not require a generic helper when direct function calls would be clearer.",
    ],
    `const trim = value => value.trim();\nconst lower = value => value.toLowerCase();\nconst slug = value => value.replace(/\\s+/g, '-');\nconst pipe = (...steps) => input => steps.reduce((value, step) => step(value), input);\nconst toSlug = pipe(trim, lower, slug);\nconsole.log(toSlug('  CSS Grid  ')); // css-grid`,
    [
      [
        "Normalize edges",
        "The first stage removes surrounding whitespace.",
        ['"  CSS Grid  "', "trim", '"CSS Grid"'],
      ],
      [
        "Normalize case",
        "The second stage converts letters to lowercase.",
        ['"CSS Grid"', "lower", '"css grid"'],
      ],
      [
        "Transform separator",
        "The final stage replaces whitespace runs with hyphens.",
        ['"css grid"', "slug", '"css-grid"'],
      ],
    ],
    "This simple slug helper does not define a complete Unicode or URL policy. Do not silently assume every stage handles arbitrary input types.",
    "What happens if a stage returns a number before lower runs?",
    "lower expects a string and will fail. Keep stage contracts compatible or validate and convert at the boundary.",
    js("Guide/Functions"),
  ),
  "patterns--factory-pattern": L(
    "A factory function creates objects with a defined public API and configurable behavior.",
    [
      "Factories can use closures for private state and return only the operations callers need. Each invocation can own a separate configuration and state lifetime.",
      "Inject dependencies such as a clock or persistence function when they would otherwise be hidden globals. This makes behavior easier to substitute in tests.",
    ],
    `function createPlanner(initial = []) {\n  const items = [...initial];\n  return {\n    add(title) { items.push(title); },\n    list() { return [...items]; }\n  };\n}\nconst planner = createPlanner(['HTML']);\nplanner.add('CSS');\nconst snapshot = planner.list();\nsnapshot.push('External change');\nconsole.log(planner.list()); // ['HTML', 'CSS']`,
    [
      [
        "Create",
        "The factory copies the initial array and retains it in a private closure.",
        ["Initial array", "Copied items", "Private state"],
      ],
      [
        "Expose actions",
        "The caller can add an item through the returned API.",
        ["planner.add", "Push CSS internally", "State: HTML,CSS"],
      ],
      [
        "Protect container",
        "list returns a new array, so pushing to that snapshot does not change the private array.",
        ["Snapshot copy", "External push", "Private list unchanged"],
      ],
    ],
    "A copied array is only a shallow boundary. If items are mutable objects, returning them still exposes their nested state.",
    "Would a second createPlanner() share this planner’s items?",
    "No. Each call creates its own closure and copied array. Sharing should be an explicit choice rather than an accidental module variable.",
    js("Guide/Closures"),
  ),
  "patterns--pub-sub": L(
    "Publish-subscribe lets producers announce events without directly naming every consumer.",
    [
      "Subscribers register handlers for a topic and receive published payloads. This reduces direct coupling but makes the overall flow less visible, so use clear event names and contracts.",
      "Return an unsubscribe function and call it during cleanup. Decide whether handler errors should stop publication, be isolated, or be reported; there is no universal default.",
    ],
    `function createTopic() {\n  const listeners = new Set();\n  return {\n    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },\n    publish(value) { for (const fn of [...listeners]) fn(value); }\n  };\n}\nconst completed = createTopic();\nconst unsubscribe = completed.subscribe(id => console.log('Completed', id));\ncompleted.publish(7);\nunsubscribe();\ncompleted.publish(8); // no listener output`,
    [
      [
        "Subscribe",
        "The handler is stored in the topic’s listener set.",
        ["Consumer handler", "Set.add", "Active subscription"],
      ],
      [
        "Publish",
        "The topic calls a snapshot of registered listeners with lesson ID seven.",
        ["Event payload: 7", "Listener snapshot", "Consumer notified"],
      ],
      [
        "Unsubscribe",
        "The returned cleanup function removes the handler before the next publication.",
        ["Cleanup called", "Listener removed", "ID 8 not observed"],
      ],
    ],
    "This synchronous example lets a thrown handler stop later handlers. Document that policy or add deliberate isolation; do not hide failures accidentally.",
    "Why publish over a copied listener array?",
    "It gives the current dispatch a stable snapshot when handlers subscribe or unsubscribe during notification. Later dispatches see the changed set.",
    js("Reference/Global_Objects/Set"),
  ),
  "patterns--error-handling": L(
    "Error handling should preserve useful context and give the caller a deliberate recovery path.",
    [
      "Throw Error objects for exceptional failures and catch where you can recover, translate, or report them. A catch that silently returns a success-shaped value can conceal a broken operation.",
      "finally runs for cleanup whether the operation succeeds or fails. Avoid returning from finally because it can replace the original result or error.",
    ],
    `function parseMinutes(text) {\n  const value = Number(text);\n  if (!text.trim() || !Number.isFinite(value) || value < 0) {\n    throw new Error('Minutes must be a nonnegative number');\n  }\n  return value;\n}\ntry { console.log(parseMinutes('15')); }\ncatch (error) { console.error(error.message); }`,
    [
      [
        "Validate",
        "The function checks empty input, non-finite conversion, and negative values.",
        ["Input text", "Validation rules", "Accept or throw"],
      ],
      [
        "Success",
        "A valid string becomes a numeric duration returned to the caller.",
        ['"15"', "Number conversion", "Return 15"],
      ],
      [
        "Failure",
        "An invalid value throws and control jumps to the nearest matching catch.",
        ["Invalid value", "Error object", "Caller handles message"],
      ],
    ],
    "Do not catch an error merely to log and continue as if nothing failed. Keep user-facing messages useful without exposing sensitive internals.",
    "Why check text.trim() before accepting Number(text)?",
    "Number of an empty or whitespace-only string is zero. The explicit check distinguishes an omitted value from an intentional zero.",
    js("Guide/Control_flow_and_error_handling"),
  ),
  "quality--debugging": L(
    "Debugging narrows the gap between expected behavior and the first incorrect state transition.",
    [
      "Start with a small reproducible input and a precise expected result. Breakpoints, watch expressions, and call stacks show what the program actually does.",
      "Inspect types and intermediate values rather than adding speculative fixes. After correcting the cause, add a focused regression check for the behavior that failed.",
    ],
    `function addMinutes(current, input) {\n  // Bug: input from an HTML field is a string.\n  // return current + input;\n  const minutes = Number(input);\n  if (!Number.isFinite(minutes)) throw new Error('Invalid duration');\n  return current + minutes;\n}\nconsole.log(addMinutes(10, '5')); // 15, not '105'`,
    [
      [
        "Reproduce",
        "Use the smallest input that shows the issue: a number plus a string from a field.",
        ["current: 10", 'input: "5"', 'Wrong result: "105"'],
      ],
      [
        "Inspect",
        "A breakpoint reveals that the operands have different runtime types.",
        ["typeof current: number", "typeof input: string", "Concatenation cause"],
      ],
      [
        "Correct",
        "Explicit conversion and validation make the intended arithmetic operation clear.",
        ['Number("5")', "10 + 5", "Correct result: 15"],
      ],
    ],
    "Do not patch the displayed string while leaving the data type wrong. That symptom-level fix may fail on the next calculation.",
    'Which cases should accompany the regression check for 10 and "5"?',
    "Include zero, invalid text, and the domain policy for empty or negative values. Validate those policies explicitly instead of assuming conversion defines them.",
    mdn("Learn_web_development/Core/Scripting/Debugging_JavaScript"),
  ),
  "quality--unit-testing": L(
    "Unit tests verify a focused behavior with controlled inputs and observable outputs.",
    [
      "Test the public contract rather than local variable names or implementation order. Include representative success cases and meaningful boundaries.",
      "Pure functions are easy to test because they need little environment setup. Use a test runner that reports independent cases and failures clearly.",
    ],
    `// FILE: remaining.test.js — run with node --test remaining.test.js\nimport test from 'node:test';\nimport assert from 'node:assert/strict';\nfunction remaining(total, done) { return Math.max(0, total - done); }\ntest('returns unfinished count', () => {\n  assert.equal(remaining(5, 2), 3);\n});\ntest('never returns a negative count', () => {\n  assert.equal(remaining(2, 5), 0);\n});`,
    [
      [
        "Arrange",
        "Each case chooses inputs that express a specific part of the contract.",
        ["total:5", "done:2", "Expected:3"],
      ],
      [
        "Act",
        "The test calls the same function that the application relies on.",
        ["remaining(5,2)", "Calculation", "Actual result"],
      ],
      [
        "Assert",
        "Strict equality compares the result with the expectation and reports a failure if they differ.",
        ["Actual:3", "Expected:3", "Case passes"],
      ],
    ],
    "Do not copy the implementation into an expected-value formula that can repeat the same bug. Prefer concrete examples with independently understood outcomes.",
    "What test would cover an already completed plan?",
    "Assert that remaining(5,5) is zero. Also decide whether invalid totals should be rejected or normalized and test that separate contract.",
    "https://nodejs.org/api/test.html",
  ),
  "quality--integration-testing": L(
    "Integration tests verify that collaborating pieces honor their boundaries together.",
    [
      "A useful integration test exercises a real sequence across modules while controlling expensive or nondeterministic external dependencies. Choose the boundary from the risk you want to verify.",
      "Assert a user-visible or domain-visible outcome, not just that one mock was called. A fully mocked path may prove wiring but cannot establish that a real protocol or database contract works.",
    ],
    `// Node ESM example; run with node --test\nimport test from 'node:test';\nimport assert from 'node:assert/strict';\nasync function loadTitles(fetcher) {\n  const response = await fetcher('/api/lessons');\n  if (!response.ok) throw new Error('Load failed');\n  return (await response.json()).map(item => item.title);\n}\ntest('loads and maps API data', async () => {\n  const fetcher = async () => ({ ok: true, json: async () => [{ title: 'Grid' }] });\n  assert.deepEqual(await loadTitles(fetcher), ['Grid']);\n});`,
    [
      [
        "Boundary",
        "The fake controls the network boundary while the loader’s status, parsing, and mapping logic remain real.",
        ["Controlled response", "Real loader", "Real transformation"],
      ],
      [
        "Execute",
        "The loader reads the API-shaped array and extracts titles.",
        ["JSON array", "map title", "[Grid]"],
      ],
      [
        "Verify outcome",
        "The assertion checks the final domain result, not merely whether fetcher ran.",
        ["Expected titles", "Actual titles", "Contract comparison"],
      ],
    ],
    "This controlled test does not prove the live endpoint returns that shape. Add a real boundary test where compatibility risk justifies it.",
    "What failure scenario should this integration test add?",
    "Return ok:false and assert rejection. Also cover malformed payloads if the loader owns runtime validation.",
    "https://nodejs.org/api/test.html",
  ),
  "quality--linting": L(
    "Linting catches selected source-level mistakes and enforces agreed code conventions before runtime.",
    [
      "A linter parses code and applies configured rules. Rules such as no-undef catch unknown identifiers, while formatting tools focus on presentation rather than program behavior.",
      "Configure the actual execution environment and file types. Suppressions should explain a legitimate exception rather than hide a bug or a mismatched environment.",
    ],
    `// eslint.config.js — project must have ESLint installed\nexport default [{\n  files: ['src/**/*.js'],\n  languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },\n  rules: { 'no-undef': 'error', 'no-unreachable': 'error' }\n}];\n// Run: npx eslint src\n// Add browser or Node globals only for files that use that environment.`,
    [
      [
        "Parse",
        "The linter reads JavaScript using the configured language and module settings.",
        ["Source file", "Parser", "Syntax tree"],
      ],
      [
        "Apply rules",
        "Rules inspect the tree for errors such as a name with no declaration.",
        ["Identifier use", "Scope lookup", "Unknown name reported"],
      ],
      [
        "Integrate",
        "The command exits unsuccessfully on configured errors so automation can stop a faulty change.",
        ["Lint command", "Error report", "Fix before merge"],
      ],
    ],
    "A lint pass does not prove runtime correctness. Do not globally disable a useful rule because one file needs an environment-specific declaration.",
    "If document is reported as undefined in browser code, what should you inspect?",
    "Check the browser globals configuration and file matching first. If the file truly runs on a server, using document may be a real architectural error.",
    "https://eslint.org/docs/latest/use/configure/configuration-files",
  ),
  "quality--documentation": L(
    "Useful documentation records a function’s contract, assumptions, and examples rather than restating every line.",
    [
      "Document inputs, outputs, side effects, and failure behavior that callers need. Explain surprising decisions and domain constraints close to the code that enforces them.",
      "JSDoc can provide editor guidance and optionally participate in JavaScript type checking. Keep examples executable where practical so they do not drift from the implementation.",
    ],
    `/**\n * Convert minutes to whole study blocks, rounding down.\n * @param {number} minutes Nonnegative available time.\n * @param {number} blockSize Positive minutes per block.\n * @returns {number} Complete blocks that fit.\n */\nfunction blocks(minutes, blockSize) {\n  if (!Number.isFinite(minutes) || minutes < 0 || !Number.isFinite(blockSize) || blockSize <= 0) {\n    throw new Error('Invalid duration');\n  }\n  return Math.floor(minutes / blockSize);\n}\nconsole.log(blocks(50, 20)); // 2`,
    [
      [
        "State contract",
        "The comment tells callers that partial blocks do not count and the inputs must be valid durations.",
        ["Nonnegative minutes", "Positive block size", "Round down"],
      ],
      [
        "Enforce",
        "Runtime checks preserve the documented preconditions.",
        ["Validate inputs", "Reject invalid values", "Proceed safely"],
      ],
      [
        "Demonstrate",
        "Fifty minutes contains two full twenty-minute blocks, leaving ten minutes unused.",
        ["50 ÷ 20 = 2.5", "Floor", "2 complete blocks"],
      ],
    ],
    "Do not let comments promise validation that the function never performs. Avoid comments that merely translate syntax into English.",
    "What important behavior should be documented if this function starts rounding up?",
    "Explain that the result now includes a partial block and update examples and tests. Rounding policy is part of the public contract.",
    "https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html",
  ),
  "advanced--iterators-and-generators": L(
    "Iterators expose values one at a time, and generators provide concise syntax for producing that sequence.",
    [
      "An iterator returns objects with value and done. An iterable supplies Symbol.iterator so for...of and spread can request an iterator.",
      "A generator pauses at yield and resumes on the next request. This supports lazy sequences without building every value in memory, but consuming an unbounded generator with spread will never finish.",
    ],
    `function* lessonIds(limit) {\n  for (let id = 1; id <= limit; id++) yield id;\n}\nconst iterator = lessonIds(3);\nconsole.log(iterator.next()); // { value: 1, done: false }\nconsole.log(iterator.next()); // { value: 2, done: false }\nconsole.log([...lessonIds(3)]); // [1, 2, 3]`,
    [
      [
        "Create",
        "Calling the generator creates an iterator without running the whole loop.",
        ["lessonIds(3)", "Generator object", "Paused before body"],
      ],
      [
        "Resume",
        "next runs until yield produces one value, then pauses with local state retained.",
        ["next()", "yield 1", "Paused with id=1"],
      ],
      [
        "Consume",
        "Spread repeatedly requests values until done becomes true.",
        ["Request 1,2,3", "Loop ends", "Array [1,2,3]"],
      ],
    ],
    "An iterator is stateful and may already be partly consumed. Do not assume iterating the same generator object starts it over.",
    "After reading two values from iterator, what does [...iterator] contain?",
    "It contains only three because the earlier values were already consumed. Call lessonIds again for a fresh sequence.",
    js("Guide/Iterators_and_generators"),
  ),
  "advanced--proxy-and-reflect": L(
    "Proxy intercepts selected object operations, while Reflect performs their standard counterparts explicitly.",
    [
      "Traps such as get and set can add validation or observation around an object. Use Reflect to preserve normal receiver and property behavior when forwarding an operation.",
      "Proxies must obey language invariants and can complicate identity, debugging, and interactions with built-in objects. Prefer a plain function or class when interception is unnecessary.",
    ],
    `const target = { minutes: 0 };\nconst session = new Proxy(target, {\n  set(object, key, value, receiver) {\n    if (key === 'minutes' && (!Number.isFinite(value) || value < 0)) {\n      throw new Error('Invalid minutes');\n    }\n    return Reflect.set(object, key, value, receiver);\n  }\n});\nsession.minutes = 20;\nconsole.log(target.minutes); // 20`,
    [
      [
        "Intercept",
        "Assigning through the proxy invokes the set trap.",
        ["session.minutes = 20", "set trap", "Validation entry"],
      ],
      [
        "Validate",
        "The trap checks the duration before forwarding the write.",
        ["Finite?", "Nonnegative?", "Allowed value"],
      ],
      [
        "Forward",
        "Reflect.set performs the normal assignment and returns its success result.",
        ["Reflect.set", "target.minutes = 20", "Write succeeds"],
      ],
    ],
    "Writing directly to target bypasses the proxy validation. Do not expose both references when the proxy is intended as an enforcement boundary.",
    "What happens for session.minutes = -1?",
    "The trap throws before forwarding, leaving the existing target value unchanged. Direct target mutation would bypass that check.",
    js("Reference/Global_Objects/Proxy"),
  ),
  "advanced--web-workers": L(
    "Web Workers move suitable computation off the main UI thread and communicate through messages.",
    [
      "Workers have their own execution context and cannot directly manipulate the document DOM. Messages are usually structured-cloned, with transferable objects available for some data types.",
      "Keep payload sizes and worker startup costs in mind. Move work that is expensive enough to justify the boundary, handle errors, and terminate workers when their lifetime ends.",
    ],
    `// FILE: total-worker.js\nself.onmessage = event => {\n  const total = event.data.reduce((sum, value) => sum + value, 0);\n  self.postMessage(total);\n};\n\n// FILE: main.js — browser module served over HTTP\nconst worker = new Worker(new URL('./total-worker.js', import.meta.url), { type: 'module' });\nworker.onmessage = event => {\n  console.log(event.data); // 60\n  worker.terminate();\n};\nworker.onerror = error => { console.error(error.message); worker.terminate(); };\nworker.postMessage([10, 20, 30]);`,
    [
      [
        "Send",
        "The main thread sends serializable input rather than a DOM node or function.",
        ["Main thread", "Message: [10,20,30]", "Worker context"],
      ],
      [
        "Compute",
        "The worker sums the values in its own execution context.",
        ["Worker loop", "10 + 20 + 30", "Result: 60"],
      ],
      [
        "Return",
        "A message delivers the result and the one-shot worker is released.",
        ["postMessage(60)", "Main callback", "terminate()"],
      ],
    ],
    "This tiny sum is educational, not a performance justification. Transferring data and starting a worker can cost more than a small calculation.",
    "Can the worker call document.querySelector to update the page?",
    "No. Send a result to the main thread and update the DOM there. The worker does not have the window document.",
    api("Web_Workers_API/Using_web_workers"),
  ),
  "advanced--memory-management": L(
    "JavaScript reclaims unreachable objects, but reachable objects can remain in memory long after they are useful.",
    [
      "Garbage collection follows reachability rather than whether you conceptually finished using a value. Global collections, timers, and listeners can retain closures and their captured data.",
      "Tie resource lifetimes to feature lifetimes. WeakMap can associate metadata without keeping keys alive by itself, but it is not a substitute for cleaning up active subscriptions.",
    ],
    `function trackClicks(button) {\n  let count = 0;\n  const onClick = () => { count++; console.log(count); };\n  button.addEventListener('click', onClick);\n  return () => button.removeEventListener('click', onClick);\n}\n// const dispose = trackClicks(button);\n// Call dispose() when this feature is removed.`,
    [
      [
        "Retain",
        "The event target retains the listener, which retains the count binding through its closure.",
        ["Button", "Listener function", "Captured count"],
      ],
      [
        "Use",
        "Clicks update the same retained state while the feature is active.",
        ["Click event", "count increments", "Listener still needed"],
      ],
      [
        "Release",
        "The cleanup removes the subscription so it no longer keeps that callback alive through the target.",
        ["dispose()", "removeEventListener", "Unneeded references can expire"],
      ],
    ],
    "Removing a DOM node is not always sufficient if other references retain it. Do not assume setting one local variable to null removes every reference.",
    "Why must removeEventListener receive the same function reference?",
    "Listeners are identified partly by the registered callback identity. A newly created arrow function is a different object and does not remove the original.",
    js("Guide/Memory_management"),
  ),
  "advanced--performance": L(
    "Performance work should reduce measured user-visible delay rather than optimize code by appearance.",
    [
      "Measure realistic inputs with browser performance tools. Separate algorithmic cost, DOM work, network delay, and scheduling so the remedy targets the actual bottleneck.",
      "Batch DOM reads before writes to avoid repeated forced layouts. For large computation, improve the algorithm, split work, or use a worker when the overhead is justified.",
    ],
    `// Browser example; .card elements must exist\nconst cards = [...document.querySelectorAll('.card')];\nconst widths = cards.map(card => card.getBoundingClientRect().width);\nconst widest = Math.max(0, ...widths);\nfor (const card of cards) card.style.minHeight = widest / 2 + 'px';\n// All measurements happen before the style writes.`,
    [
      [
        "Measure",
        "The first pass reads geometry without interleaving style changes.",
        ["Read card A", "Read card B", "Collect widths"],
      ],
      [
        "Calculate",
        "A pure calculation finds the target dimension from the measured data.",
        ["Widths array", "Maximum width", "Target height"],
      ],
      [
        "Write",
        "The second pass applies style changes together, avoiding a read after each individual write.",
        ["Write A", "Write B", "Browser updates layout"],
      ],
    ],
    "Do not trust one microbenchmark as proof of whole-page improvement. This example assumes a manageable card count; very large collections need different strategies.",
    "Why can alternating a style write and a geometry read be expensive?",
    "The geometry read may force the browser to synchronize layout after each write. Grouping reads and writes reduces that repeated work.",
    mdn("Web/Performance/Guides"),
  ),
};
