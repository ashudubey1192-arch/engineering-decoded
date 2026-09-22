import { lesson as L, tsDoc } from "./webLessonSchema.js";
const handbook = (path) => tsDoc(`handbook/2/${path}.html`);
export const typescriptLessons = {
  "foundations--why-typescript": L(
    "TypeScript checks JavaScript programs before execution by describing the values their code expects.",
    [
      "Type annotations help the compiler catch incompatible calls and improve editor navigation. Most type-only syntax is erased when producing JavaScript, so it does not validate external data at runtime.",
      "Adopt types around clear domain contracts rather than adding annotations to every expression. The checker can infer many local values while public boundaries benefit from explicit intent.",
    ],
    `function remaining(total: number, completed: number): number {\n  return Math.max(0, total - completed);\n}\nconsole.log(remaining(5, 2)); // 3\n// @ts-expect-error A string is not a numeric total.\nremaining('5', 2);`,
    [
      [
        "Describe",
        "The function contract accepts two numbers and returns a number.",
        ["total: number", "completed: number", "result: number"],
      ],
      [
        "Check",
        "The compiler flags the string argument before the program is executed.",
        ['Argument: "5"', "Expected: number", "Type error"],
      ],
      [
        "Run JavaScript",
        "After type erasure, JavaScript runs the calculation; no automatic input validator is inserted.",
        ["Type annotations erased", "JavaScript function", "Runtime behavior remains JS"],
      ],
    ],
    "Do not interpret a type assertion or annotation as a runtime conversion. JavaScript callers and network responses can still supply invalid values.",
    'If an API sends "5" as a string, does annotating it number convert it?',
    "No. Validate and explicitly convert it at the boundary. Types describe assumptions; runtime code must establish those assumptions for external data.",
    tsDoc("handbook/typescript-from-scratch.html"),
  ),
  "foundations--compiler-setup": L(
    "A TypeScript project needs compiler settings aligned with its runtime or bundler.",
    [
      "Install TypeScript as a development dependency and commit a tsconfig. strict enables a useful family of checks; noEmit is appropriate when another tool produces JavaScript.",
      "Target controls emitted JavaScript language features, while lib describes available APIs to the checker. Neither installs polyfills. Choose module and resolution settings for the environment that actually loads modules.",
    ],
    `// Terminal in a new practice project:\n// npm install --save-dev typescript\n// npx tsc --noEmit\n\n// tsconfig.json for a modern browser project with a bundler:\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "ESNext",\n    "moduleResolution": "Bundler",\n    "lib": ["ES2022", "DOM"],\n    "strict": true,\n    "noEmit": true\n  },\n  "include": ["src/**/*.ts"]\n}`,
    [
      [
        "Choose environment",
        "This configuration assumes a browser bundler, not direct execution of emitted files in Node.",
        ["Browser runtime", "Bundler loads modules", "DOM library types"],
      ],
      [
        "Check",
        "The compiler reads included source files and reports type errors without writing JavaScript.",
        ["src/**/*.ts", "strict checks", "noEmit"],
      ],
      [
        "Build separately",
        "The bundler still needs a separate build command to create deployable assets.",
        ["Type check", "Bundler build", "Browser assets"],
      ],
    ],
    "Do not copy Bundler resolution into every Node project. Declaring DOM APIs does not make document exist in a server runtime.",
    "Why run a type-check command even if the dev server already runs TypeScript files?",
    "Many dev tools transpile without performing full type checking. A separate compiler pass checks cross-file contracts before release.",
    tsDoc("tsconfig/"),
  ),
  "foundations--primitive-types": L(
    "Primitive annotations describe ordinary JavaScript values without changing their runtime representation.",
    [
      "Use lowercase string, number, and boolean rather than boxed String, Number, and Boolean types. number includes integers and floating-point values; an integer-only domain needs runtime validation.",
      "With strict null checking, null and undefined are separate possibilities that must be modeled explicitly. Prefer a union for intentional absence instead of suppressing the checker.",
    ],
    `let title: string = 'TypeScript';\nlet minutes: number = 20;\nlet completed: boolean = false;\nlet note: string | null = null;\nnote = 'Review primitive types';\nconsole.log(title, minutes, completed, note);\n// @ts-expect-error A number cannot be assigned to a string.\ntitle = 42;`,
    [
      [
        "Annotate",
        "The declarations establish the permitted value categories for later assignments.",
        ["title: string", "minutes: number", "completed: boolean"],
      ],
      [
        "Model absence",
        "note explicitly permits either a string or null.",
        ["note: string | null", "Initial null", "Later string"],
      ],
      [
        "Reject mismatch",
        "Assigning a number to title violates its declared contract.",
        ["title = 42", "number ≠ string", "Compiler diagnostic"],
      ],
    ],
    "A number annotation does not guarantee finite, positive, or integer values. These are additional domain constraints requiring runtime checks.",
    "Can minutes hold NaN or 2.5 under the number type?",
    "Yes. Use Number.isFinite, Number.isInteger, and range checks where those restrictions are required.",
    handbook("everyday-types"),
  ),
  "foundations--arrays-and-tuples": L(
    "Arrays describe repeated element types; tuples describe a fixed positional structure.",
    [
      "string[] and Array<string> describe arrays of strings. A tuple such as [string, number] gives different meanings and types to its positions.",
      "readonly prevents mutation through that typed reference, but it does not freeze the runtime object or necessarily make nested objects immutable. Named tuple labels improve readability without becoming object property names.",
    ],
    `const topics: string[] = ['HTML', 'CSS'];\nconst entry: readonly [title: string, minutes: number] = ['TypeScript', 25];\nconst [title, minutes] = entry;\nconsole.log(title, minutes);\n// @ts-expect-error Position one must be a number.\nconst invalid: [string, number] = ['TypeScript', '25'];\n// @ts-expect-error Readonly tuples cannot be assigned through this reference.\nentry[1] = 30;`,
    [
      [
        "Repeat",
        "The topics array can contain any number of string entries.",
        ["string[]", "Index 0: HTML", "Index 1: CSS"],
      ],
      [
        "Position",
        "The tuple reserves position zero for a title and position one for a duration.",
        ["Tuple length: 2", "[0]: string", "[1]: number"],
      ],
      [
        "Protect reference",
        "The readonly annotation rejects assignment through entry during checking.",
        ["entry[1] = 30", "Readonly position", "Compile-time rejection"],
      ],
    ],
    "Do not use a tuple when callers are likely to forget what several positions mean; an object with named fields may be clearer.",
    "Would readonly [string, number] automatically call Object.freeze at runtime?",
    "No. Readonly is a type-system restriction on that reference. Runtime immutability requires a separate implementation choice.",
    handbook("objects"),
  ),
  "foundations--type-inference": L(
    "Type inference derives useful types from values and context so code does not need redundant annotations.",
    [
      "A const primitive can retain a literal type, while a mutable let binding commonly widens to its primitive type. Context also supplies callback parameter types.",
      "Use explicit annotations where they clarify a public contract or prevent an undesired inference. as const preserves literal and readonly information for literal expressions, but is not a runtime freeze.",
    ],
    `let status = 'draft'; // string\nconst fixedStatus = 'draft'; // literal 'draft'\nconst config = { mode: 'compact', columns: 2 } as const;\nconst lengths = ['HTML', 'CSS'].map(title => title.length); // number[]\nconsole.log(status, fixedStatus, config, lengths);`,
    [
      [
        "Infer mutable value",
        "status is allowed to receive other strings because it is a mutable string binding.",
        ["let status", 'Initial "draft"', "Inferred string"],
      ],
      [
        "Preserve literal",
        "The const primitive and const assertion preserve more specific values.",
        ['fixedStatus: "draft"', 'mode: "compact"', "columns: 2"],
      ],
      [
        "Use context",
        "The array element type tells the checker that title is a string inside map.",
        ["string[] input", "title: string", "lengths: number[]"],
      ],
    ],
    "Do not force broad any types when inference is already useful. An empty array or complex branch may need an intentional annotation.",
    'Why can status = "published" succeed while config.mode = "wide" fails?',
    "status is inferred as mutable string. config uses a const assertion, making mode readonly with the specific literal type compact.",
    handbook("everyday-types"),
  ),
  "modeling--type-aliases": L(
    "A type alias gives a reusable name to a type expression without creating a new runtime object.",
    [
      "Aliases can name object shapes, unions, tuples, and other compositions. They are structurally checked: compatible shapes usually fit regardless of the alias name.",
      "Use domain names to communicate meaning, but do not assume type UserId = string creates a distinct nominal identity from other strings. Stronger distinctions need an explicit modeling pattern.",
    ],
    `type LessonId = string;\ntype Lesson = { id: LessonId; title: string; minutes: number };\ntype LessonList = readonly Lesson[];\nconst lessons: LessonList = [{ id: 'html', title: 'HTML', minutes: 20 }];\nfunction total(items: LessonList): number {\n  return items.reduce((sum, item) => sum + item.minutes, 0);\n}\nconsole.log(total(lessons));`,
    [
      [
        "Name shape",
        "Lesson defines the fields that each value must provide.",
        ["id: string", "title: string", "minutes: number"],
      ],
      [
        "Compose",
        "LessonList reuses that shape inside a readonly array contract.",
        ["Lesson", "readonly array", "LessonList"],
      ],
      [
        "Consume",
        "The function can read minutes safely from every typed item.",
        ["items: LessonList", "Reduce durations", "number result"],
      ],
    ],
    "A type alias is erased at runtime and cannot be used as a constructor or validator. Names alone do not create nominally distinct types.",
    "Can you call new Lesson() after declaring this alias?",
    "No. Lesson exists only in the type system. Create an object or a real factory function to produce runtime values.",
    handbook("everyday-types"),
  ),
  "modeling--interfaces": L(
    "Interfaces describe object contracts that values and classes can implement structurally.",
    [
      "An interface declares required and optional members. It can extend other interfaces to compose compatible object contracts.",
      "Interfaces can participate in declaration merging, which is useful for intentional extension but can surprise teams with duplicate global names. Keep application declarations in modules.",
    ],
    `interface Identified { id: string }\ninterface Lesson extends Identified {\n  title: string;\n  summary?: string;\n}\nfunction label(lesson: Lesson): string {\n  return lesson.title + (lesson.summary ? ': ' + lesson.summary : '');\n}\nconsole.log(label({ id: 'html', title: 'HTML' }));`,
    [
      [
        "Base contract",
        "Identified supplies the ID requirement.",
        ["Identified", "id: string", "Reusable member"],
      ],
      [
        "Extend",
        "Lesson adds title and an optional summary while retaining id.",
        ["Base id", "Required title", "Optional summary"],
      ],
      [
        "Check value",
        "The object supplies every required field, so it satisfies the interface without a special constructor.",
        ["id present", "title present", "Shape accepted"],
      ],
    ],
    "implements or an interface annotation does not inject fields at runtime. The actual object must still provide the values.",
    "What type do you need to consider when reading lesson.summary?",
    "It may be string or undefined. Narrow or provide a fallback before using string-only operations.",
    handbook("objects"),
  ),
  "modeling--unions": L(
    "A union describes a value that may belong to one of several alternatives.",
    [
      "Code can use only operations valid for every current alternative until it narrows the value. typeof, equality, and discriminant checks can establish a more specific branch.",
      "Unions model actual variation better than unrelated optional properties when the states have distinct shapes. Keep the alternatives meaningful and avoid adding any, which defeats checking.",
    ],
    `function formatId(id: string | number): string {\n  if (typeof id === 'number') return id.toFixed(0);\n  return id.toUpperCase();\n}\nconsole.log(formatId(7)); // '7'\nconsole.log(formatId('html')); // 'HTML'`,
    [
      [
        "Start broad",
        "At entry, id might be a string or a number.",
        ["id", "string | number", "Only shared operations"],
      ],
      [
        "Narrow number",
        "The typeof check proves the first branch has a number.",
        ["typeof id === number", "id: number", "toFixed allowed"],
      ],
      [
        "Remaining branch",
        "After the number branch returns, the remaining possibility is string.",
        ["Number path exited", "id: string", "toUpperCase allowed"],
      ],
    ],
    "Do not assert away a union just to call a method. Prove the relevant case with a runtime check.",
    "Why is id.toUpperCase() unsafe before the conditional?",
    "A number has no such method. The union requires code to handle all possible inputs or narrow to the string alternative first.",
    handbook("everyday-types"),
  ),
  "modeling--intersections": L(
    "An intersection requires a value to satisfy multiple contracts at the same time.",
    [
      "Use & to combine compatible object capabilities such as identity and timestamps. The resulting value must contain all required members.",
      "Conflicting member types can make a property impossible, such as string & number becoming never. Intersections are constraints, not an instruction to merge runtime objects.",
    ],
    `type Identified = { id: string };\ntype Timestamped = { createdAt: Date };\ntype Lesson = Identified & Timestamped & { title: string };\nconst lesson: Lesson = {\n  id: 'css', title: 'CSS', createdAt: new Date('2026-01-01T00:00:00Z')\n};\nconsole.log(lesson.id, lesson.createdAt.toISOString());`,
    [
      [
        "Collect contracts",
        "The type combines identity, timestamp, and title requirements.",
        ["Identified", "Timestamped", "Title shape"],
      ],
      [
        "Require all",
        "A valid value must satisfy every part rather than choosing one alternative.",
        ["id required", "createdAt required", "title required"],
      ],
      [
        "Use capabilities",
        "Callers can access both identity and Date methods because both contracts hold.",
        ["lesson.id", "lesson.createdAt", "Combined access"],
      ],
    ],
    "Do not confuse union alternatives with intersection requirements. A & B does not mean either A or B.",
    "What happens to { value:string } & { value:number }?",
    "The value property would have to satisfy both string and number, yielding an impossible never property. Resolve the conflicting model instead of casting around it.",
    handbook("objects"),
  ),
  "modeling--literal-types": L(
    "Literal types restrict a value to specific strings, numbers, or booleans that represent valid choices.",
    [
      "A union of literals can model a small closed set such as draft or published. This catches misspellings and makes exhaustive handling possible.",
      "const assertions preserve literal information in object and array expressions. Use literals for stable domain choices, not for data that is naturally unrestricted.",
    ],
    `type Status = 'draft' | 'published' | 'archived';\nfunction canEdit(status: Status): boolean {\n  return status === 'draft';\n}\nconsole.log(canEdit('draft')); // true\n// @ts-expect-error Misspelled status is outside the allowed set.\ncanEdit('publised');`,
    [
      [
        "Define set",
        "The domain permits exactly three status strings.",
        ["draft", "published", "archived"],
      ],
      [
        "Check call",
        "The correct literal belongs to the union and is accepted.",
        ["Argument: draft", "Member of Status", "Call allowed"],
      ],
      [
        "Reject typo",
        "The misspelled value belongs to none of the alternatives.",
        ["Argument: publised", "No matching literal", "Compile-time error"],
      ],
    ],
    "A literal type does not validate a string received from a server. Check external values before treating them as Status.",
    "How would you add a scheduled status safely?",
    "Extend the union, update every relevant decision, and use exhaustive handling where all statuses need a branch. Add runtime validation for the new value too.",
    handbook("everyday-types"),
  ),
  "functions--function-types": L(
    "A function type describes the arguments a callable accepts and the result it returns.",
    [
      "Use function types for callbacks and injected dependencies. Parameter names aid readability, while their types and the return type establish compatibility.",
      "A callback returning void means the caller ignores its result, not necessarily that the implementation cannot return one. Do not mistake a return-type annotation for runtime enforcement.",
    ],
    `type Formatter = (title: string, minutes: number) => string;\nconst format: Formatter = (title, minutes) => title + ' · ' + minutes + ' min';\nfunction renderLabel(formatter: Formatter): string {\n  return formatter('Generics', 25);\n}\nconsole.log(renderLabel(format));`,
    [
      [
        "Define callable",
        "Formatter requires two inputs and a string result.",
        ["title: string", "minutes: number", "returns string"],
      ],
      [
        "Infer implementation",
        "The assigned function receives contextual parameter types from Formatter.",
        ["Context: Formatter", "Typed parameters", "String expression"],
      ],
      [
        "Inject",
        "renderLabel can call any compatible formatter without knowing its implementation.",
        ["Compatible callback", "Call with lesson data", "Rendered label"],
      ],
    ],
    "Do not use the broad Function type when you know the signature. It loses useful argument and result checking.",
    "What should happen if a formatter returns a number instead?",
    "It is incompatible with this string-returning contract. Return a string or change the public contract intentionally.",
    handbook("functions"),
  ),
  "functions--optional-parameters": L(
    "Optional and default parameters describe which arguments a caller may omit.",
    [
      "A parameter marked ? includes undefined inside the function. A default initializer provides a value when the caller omits the argument or passes undefined.",
      "Avoid optional callback parameters unless the caller may actually omit them. Marking every callback argument optional forces consumers to handle undefined even when your implementation always provides it.",
    ],
    `function greet(name: string, prefix = 'Hello'): string {\n  return prefix + ', ' + name;\n}\nfunction note(text?: string): string {\n  return text?.trim() || 'No note';\n}\nconsole.log(greet('Ada')); // Hello, Ada\nconsole.log(greet('Ada', undefined)); // Hello, Ada\nconsole.log(note()); // No note`,
    [
      [
        "Omit",
        "A missing prefix triggers its default initializer.",
        ["greet(Ada)", "prefix undefined", "Use Hello"],
      ],
      [
        "Narrow optional",
        "The optional text parameter requires handling undefined before string operations.",
        ["text?: string", "string | undefined", "Optional access"],
      ],
      [
        "Return fallback",
        "The note function also treats an empty trimmed string as no note by explicit policy.",
        ["Missing or blank", "Fallback condition", "No note"],
      ],
    ],
    "Defaults do not apply to null. With strict null checking, null must be explicitly allowed if it is a valid input.",
    'Does greet("Ada", "") use the default Hello?',
    "No. The empty string is supplied and is not undefined, so the result is comma-space followed by Ada.",
    handbook("functions"),
  ),
  "functions--overloads": L(
    "Overloads describe distinct call signatures when the return type depends on the accepted input form.",
    [
      "Declare public overload signatures followed by one compatible implementation. Callers see the overload signatures, not arbitrary combinations allowed only by the implementation signature.",
      "Prefer a union parameter when it expresses the relationship clearly. Overloads are useful for correlated input and output types, but too many signatures make APIs hard to use and maintain.",
    ],
    `function normalize(value: string): string;\nfunction normalize(value: string[]): string[];\nfunction normalize(value: string | string[]): string | string[] {\n  return Array.isArray(value)\n    ? value.map(item => item.trim())\n    : value.trim();\n}\nconst one = normalize(' CSS '); // string\nconst many = normalize([' HTML ', ' CSS ']); // string[]\nconsole.log(one, many);`,
    [
      [
        "Choose signature",
        "A string argument matches the string-to-string overload.",
        ["Input: string", "Overload one", "Return type: string"],
      ],
      [
        "Alternative call",
        "An array argument matches the array-to-array overload.",
        ["Input: string[]", "Overload two", "Return type: string[]"],
      ],
      [
        "Implement once",
        "The runtime implementation branches on the actual input and performs the appropriate transformation.",
        ["Array.isArray", "Map or trim", "Correct runtime result"],
      ],
    ],
    "The implementation signature is not an extra public overload. A string | string[] variable may need its own overload or narrowing before a call.",
    "Why is one known to be a string rather than string | string[]?",
    "The public overload selected by its argument correlates a string input with a string output. The broad implementation handles both cases internally.",
    handbook("functions"),
  ),
  "functions--rest-parameters": L(
    "Rest parameters collect a variable number of arguments into a typed array or tuple.",
    [
      "A rest parameter must be last. An array rest type allows any number of matching values, while a tuple rest type can describe a precise argument list.",
      "When spreading an array into fixed parameters, the checker needs evidence of the required length and positions. A tuple annotation or const assertion can preserve that information.",
    ],
    `function total(...minutes: number[]): number {\n  return minutes.reduce((sum, value) => sum + value, 0);\n}\nfunction label(title: string, duration: number): string {\n  return title + ': ' + duration;\n}\nconst args = ['TypeScript', 30] as const;\nconsole.log(total(10, 20, 30)); // 60\nconsole.log(label(...args));`,
    [
      [
        "Collect",
        "The rest parameter gathers three numeric arguments into one number array.",
        ["10,20,30 arguments", "minutes:number[]", "[10,20,30]"],
      ],
      [
        "Accumulate",
        "The function reduces the collected values to sixty.",
        ["Start 0", "Add values", "Return 60"],
      ],
      [
        "Spread tuple",
        "The readonly tuple proves the spread supplies a string followed by a number.",
        ["args tuple", "Position types known", "label call accepted"],
      ],
    ],
    "A general (string | number)[] does not prove it contains exactly the two arguments label requires. Avoid casting an arbitrary array into a tuple.",
    "What does total() return with no arguments?",
    "It returns zero because the rest array is empty and reduce has an explicit zero initial value.",
    handbook("functions"),
  ),
  "functions--this-types": L(
    "An explicit this parameter describes the receiver a normal function requires when called.",
    [
      "The special this parameter exists only for checking and is erased from JavaScript output. It helps detect unbound calls to receiver-dependent functions.",
      "Arrow functions capture lexical this and do not use an explicit receiver parameter. When callbacks need object state, bind the function or use a closure with clear ownership.",
    ],
    `type Planner = { title: string };\nfunction describe(this: Planner, suffix: string): string {\n  return this.title + suffix;\n}\nconst planner = { title: 'Study desk', describe };\nconsole.log(planner.describe('!'));\nconst bound = describe.bind(planner);\nconsole.log(bound('?'));\n// @ts-expect-error No Planner receiver is supplied.\ndescribe('!');`,
    [
      [
        "Declare receiver",
        "The function requires a Planner as this in addition to its ordinary suffix argument.",
        ["this: Planner", "suffix: string", "Receiver contract"],
      ],
      [
        "Call as method",
        "The dotted call supplies planner as the receiver.",
        ["planner.describe", "this = planner", "Study desk!"],
      ],
      [
        "Bind callback",
        "bind creates a callable whose receiver requirement is already satisfied.",
        ["describe.bind(planner)", "Bound function", "Safe later call"],
      ],
    ],
    "Do not count this as a real runtime argument. Passing planner as the first ordinary argument does not set the receiver.",
    'Why is describe(planner, "!") not the correct standalone call?',
    'The this parameter is erased and not part of the ordinary argument list. Use describe.call(planner, "!") or a bound function.',
    handbook("functions"),
  ),
  "generics--generic-functions": L(
    "A generic function preserves a relationship between input and output types across many callers.",
    [
      "A type parameter represents a caller-specific type rather than an unrestricted escape hatch. Inference often chooses the parameter from the argument.",
      "The implementation can only use operations valid under the parameter’s constraints. Avoid any when the real requirement is to preserve the input type.",
    ],
    `function first<T>(items: readonly T[]): T | undefined {\n  return items[0];\n}\nconst title = first(['HTML', 'CSS']); // string | undefined\nconst id = first([1, 2]); // number | undefined\nconsole.log(title?.toUpperCase(), id);`,
    [
      [
        "Infer T",
        "The string array makes T a string for the first call.",
        ["Input: string[]", "T = string", "Result: string | undefined"],
      ],
      [
        "Reuse",
        "The number array creates a different instantiation of the same function contract.",
        ["Input: number[]", "T = number", "Result: number | undefined"],
      ],
      [
        "Handle absence",
        "The function models an empty input explicitly instead of promising an element always exists.",
        ["Empty array possible", "undefined possible", "Caller must handle it"],
      ],
    ],
    "A generic does not guarantee a nonempty array. Avoid claiming a T return when the implementation can produce undefined.",
    "What type and value result from first<number>([])?",
    "The static type is number | undefined and the runtime value is undefined. The explicit type argument does not create an element.",
    handbook("generics"),
  ),
  "generics--constraints": L(
    "A generic constraint states the minimum capability the implementation needs while retaining the caller’s more specific type.",
    [
      "extends in a type parameter is a constraint, not necessarily class inheritance. A structural constraint can require a field or method.",
      "Use the narrowest useful requirement. Requiring an entire application object when only an ID is needed reduces reuse and makes the API harder to satisfy.",
    ],
    `function withLabel<T extends { id: string }>(value: T): T & { label: string } {\n  return { ...value, label: 'Item ' + value.id };\n}\nconst lesson = withLabel({ id: 'css', minutes: 20 });\nconsole.log(lesson.minutes, lesson.label);\n// @ts-expect-error The constraint requires id.\nwithLabel({ minutes: 20 });`,
    [
      [
        "Require capability",
        "The constraint guarantees that value.id exists and is a string.",
        ["T extends shape", "id:string required", "Safe ID access"],
      ],
      [
        "Preserve specifics",
        "Inference retains the extra minutes field from the caller’s object.",
        ["Caller shape", "id + minutes", "T retains both"],
      ],
      [
        "Extend result",
        "The returned intersection adds a label while preserving the original fields.",
        ["Original T", "label:string", "Combined result"],
      ],
    ],
    "Do not use a constraint as a reason to manufacture an arbitrary T from scratch. T may have extra required fields you do not know.",
    "Does the returned value still expose minutes to the caller?",
    "Yes. T preserves the input’s specific shape and the result adds label rather than reducing the value to only its constraint.",
    handbook("generics"),
  ),
  "generics--generic-interfaces": L(
    "A generic interface describes a reusable container or service whose member types depend on a chosen parameter.",
    [
      "The type parameter belongs to the interface instance, so all relevant members share the same choice. This keeps writes and reads consistent.",
      "Decide whether the generic should live on the whole object or on an individual method. A store of Lesson values is different from a utility method that accepts a new type on every call.",
    ],
    `interface Repository<T> {\n  save(value: T): void;\n  list(): readonly T[];\n}\nfunction createRepository<T>(): Repository<T> {\n  const values: T[] = [];\n  return { save: value => { values.push(value); }, list: () => [...values] };\n}\nconst titles = createRepository<string>();\ntitles.save('Generics');\nconsole.log(titles.list());`,
    [
      [
        "Choose parameter",
        "Creating a string repository fixes T to string for that repository.",
        ["Repository<T>", "T = string", "Repository<string>"],
      ],
      [
        "Write consistently",
        "save accepts only values compatible with the selected type.",
        ["save(value:string)", "Store Generics", "Typed collection"],
      ],
      [
        "Read consistently",
        "list exposes a readonly array of the same element type.",
        ["Internal string[]", "Snapshot copy", "readonly string[]"],
      ],
    ],
    "A readonly return type does not deep-freeze objects inside a repository. Design copying and mutation ownership separately.",
    "Can titles.save(42) type-check?",
    "No. This repository is fixed to strings. Create a number repository or a deliberate union repository if both are valid.",
    handbook("generics"),
  ),
  "generics--generic-classes": L(
    "Generic classes bind an instance’s fields and methods to a selected element type.",
    [
      "A class type parameter can connect storage, method arguments, and return values. The instance retains this contract across calls.",
      "Static members belong to the class itself rather than one type-parameter instantiation, so they cannot use the instance type parameter as if it were a shared runtime value.",
    ],
    `class Queue<T> {\n  private values: T[] = [];\n  enqueue(value: T): void { this.values.push(value); }\n  dequeue(): T | undefined { return this.values.shift(); }\n}\nconst queue = new Queue<string>();\nqueue.enqueue('HTML');\nconsole.log(queue.dequeue()); // HTML\nconsole.log(queue.dequeue()); // undefined`,
    [
      [
        "Instantiate",
        "The string queue uses a string array internally and string arguments for enqueue.",
        ["Queue<string>", "values:string[]", "enqueue(string)"],
      ],
      [
        "Enqueue",
        "The item is added to the end of the instance’s collection.",
        ["Empty queue", "Add HTML", "[HTML]"],
      ],
      [
        "Dequeue",
        "Removing from an empty queue is modeled with undefined in the return type.",
        ["First: HTML", "Queue empty", "Next: undefined"],
      ],
    ],
    "TypeScript private is primarily a compile-time access restriction; JavaScript # fields provide runtime private names. Choose the mechanism intentionally.",
    "Why does dequeue return T | undefined instead of T?",
    "The queue may be empty. The union forces callers to handle that state instead of assuming a value exists.",
    handbook("generics"),
  ),
  "generics--default-type-parameters": L(
    "Default type parameters make a common generic choice optional while preserving an explicit override.",
    [
      "A default is used when a type argument is omitted and inference does not supply a different choice. Required parameters must precede optional defaulted ones.",
      "Choose a default that reflects real usage, not any for convenience. unknown can be appropriate when the caller must prove the shape before using it.",
    ],
    `interface ApiResponse<T = unknown> {\n  data: T;\n  status: number;\n}\nconst raw: ApiResponse = { data: { title: 'HTML' }, status: 200 };\nconst typed: ApiResponse<{ title: string }> = { data: { title: 'CSS' }, status: 200 };\nconsole.log(typed.data.title);\n// @ts-expect-error Unknown data must be narrowed before property access.\nconsole.log(raw.data.title);`,
    [
      [
        "Omit argument",
        "Without a supplied type parameter, data is unknown.",
        ["ApiResponse", "Default T: unknown", "Validate before use"],
      ],
      [
        "Specialize",
        "The explicit object type describes the expected payload for a known contract.",
        ["ApiResponse<{title:string}>", "data.title:string", "Property access allowed"],
      ],
      [
        "Separate trust",
        "The annotation still does not validate a real HTTP payload; that must happen before constructing a trusted response.",
        ["Network value", "Runtime validation", "Typed response"],
      ],
    ],
    "Do not default external payloads to any, which permits unchecked access. A default type is not a default runtime value.",
    "Does ApiResponse create a data object when none is provided?",
    "No. It is only a type declaration. Required runtime fields must be supplied by actual code.",
    handbook("generics"),
  ),
  "narrowing--type-guards": L(
    "Type guards use runtime evidence to narrow a broad static type within a control-flow branch.",
    [
      "Built-in checks such as typeof and Array.isArray are recognized by the checker. A user-defined predicate can describe a validated domain shape.",
      "Predicate signatures are promises made by the author. Check every property your predicate claims, including null and object shape, because an incorrect guard can make unsafe code appear valid.",
    ],
    `type Lesson = { title: string };\nfunction isLesson(value: unknown): value is Lesson {\n  return typeof value === 'object' && value !== null\n    && 'title' in value && typeof value.title === 'string';\n}\nconst input: unknown = { title: 'Narrowing' };\nif (isLesson(input)) console.log(input.title.toUpperCase());`,
    [
      [
        "Start unknown",
        "The input cannot safely be treated as a lesson until its shape is checked.",
        ["input: unknown", "No property assumptions", "Guard needed"],
      ],
      [
        "Inspect",
        "The guard proves object-ness, excludes null, and checks a string title.",
        ["Object and non-null", "title exists", "title is string"],
      ],
      [
        "Narrow",
        "Inside the true branch, the checker allows Lesson operations.",
        ["Predicate true", "input: Lesson", "toUpperCase safe"],
      ],
    ],
    "Do not return true after checking only that a value is an object if the predicate claims additional fields. The compiler trusts your predicate contract.",
    "What should isLesson({title:42}) return?",
    "False. The field exists but has the wrong runtime type, so it must not enter the Lesson branch.",
    handbook("narrowing"),
  ),
  "narrowing--discriminated-unions": L(
    "A discriminated union models distinct states with a shared literal field that identifies each alternative.",
    [
      "Use a tag such as status or kind whose literal value differs across variants. Checking the tag reveals the fields guaranteed in that state.",
      "This prevents impossible combinations created by loosely related optional fields, such as simultaneously claiming loading and success without data. Model only states that the application can actually occupy.",
    ],
    `type LoadState =\n  | { status: 'loading' }\n  | { status: 'success'; titles: string[] }\n  | { status: 'error'; message: string };\nfunction describe(state: LoadState): string {\n  switch (state.status) {\n    case 'loading': return 'Loading lessons';\n    case 'success': return state.titles.join(', ');\n    case 'error': return state.message;\n  }\n}\nconsole.log(describe({ status: 'success', titles: ['HTML'] }));`,
    [
      [
        "Model alternatives",
        "Each state contains only the data relevant to that state.",
        ["loading: no payload", "success: titles", "error: message"],
      ],
      [
        "Inspect tag",
        "The switch identifies which alternative is present.",
        ["state.status", "success branch", "Narrowed state"],
      ],
      [
        "Use guaranteed field",
        "titles is required in the success alternative, so no optional-field guesswork is needed.",
        ["status: success", "titles:string[]", "Join titles"],
      ],
    ],
    "Do not replace the model with status:string and every payload optional. That loses the relationship between state and available data.",
    'Can {status:"success"} satisfy LoadState without titles?',
    "No. The success variant requires titles. A discriminated union makes that missing payload a type error.",
    handbook("narrowing"),
  ),
  "narrowing--assertion-functions": L(
    "An assertion function stops execution when a condition is false and narrows the type when it returns.",
    [
      "Use asserts value is Type for a runtime validator that throws on invalid input. Unlike a boolean guard, successful continuation itself provides the narrowing evidence.",
      "The implementation must truly enforce the claimed condition. Assertions are suitable for required invariants, while a boolean guard or result type may be better for expected user-input failures.",
    ],
    `function assertString(value: unknown): asserts value is string {\n  if (typeof value !== 'string') throw new Error('Expected text');\n}\nfunction uppercase(input: unknown): string {\n  assertString(input);\n  return input.toUpperCase();\n}\nconsole.log(uppercase('typescript'));`,
    [
      [
        "Receive",
        "The function accepts unknown so it makes no unchecked assumption about the input.",
        ["input: unknown", "Runtime value", "Validation boundary"],
      ],
      [
        "Assert",
        "Non-string input throws; returning proves the value is a string under the declared contract.",
        ["typeof check", "Throw or return", "String invariant"],
      ],
      [
        "Continue",
        "Code after the assertion can call string methods without a cast.",
        ["input: string", "toUpperCase", "TYPESCRIPT"],
      ],
    ],
    "An assertion signature with an empty body is unsound. Do not use assertions to bypass expected validation and error recovery.",
    "What happens for uppercase(42)?",
    "The assertion throws Expected text before the string method runs. Callers must handle that failure according to the application contract.",
    handbook("narrowing"),
  ),
  "narrowing--unknown-and-never": L(
    "unknown represents an unproven value; never represents a value or path that cannot exist under the current type model.",
    [
      "unknown accepts any input but requires narrowing before unsafe operations. It is useful at JSON, message, and plugin boundaries where trust has not been established.",
      "never appears after exhaustive narrowing or as the return type of a function that never returns normally. It differs from void, which describes an ignored or absent useful result.",
    ],
    `function fail(message: string): never { throw new Error(message); }\nfunction lengthOf(input: unknown): number {\n  if (typeof input === 'string') return input.length;\n  return fail('Expected a string');\n}\nconsole.log(lengthOf('HTML')); // 4`,
    [
      [
        "Unknown boundary",
        "The function receives a value without permission to access string members.",
        ["input: unknown", "Unproven shape", "Check required"],
      ],
      [
        "Prove case",
        "The string branch narrows input and returns its length.",
        ["typeof string", "input:string", "Return number"],
      ],
      [
        "Impossible return",
        "The failure branch throws, so it contributes no normal return value.",
        ["Invalid input", "fail():never", "No normal continuation"],
      ],
    ],
    "Do not replace unknown with any simply to silence errors. never is not a general empty placeholder for missing data; use null or undefined when those are real values.",
    "Why can a never-returning branch fit inside a number-returning function?",
    "It never produces a conflicting normal value. Every successful return still produces a number.",
    handbook("narrowing"),
  ),
  "narrowing--exhaustiveness": L(
    "Exhaustive handling makes newly added union cases visible as compile-time work instead of silent fallthrough.",
    [
      "After all union alternatives are handled, the remaining value should be never. Assigning it to never or passing it to assertNever checks that claim.",
      "This protects closed domain models as they evolve. Runtime validation is still needed before untrusted strings become members of the closed union.",
    ],
    `type Status = 'draft' | 'published';\nfunction assertNever(value: never): never {\n  throw new Error('Unhandled status: ' + value);\n}\nfunction label(status: Status): string {\n  switch (status) {\n    case 'draft': return 'Editing';\n    case 'published': return 'Live';\n    default: return assertNever(status);\n  }\n}\nconsole.log(label('draft'));`,
    [
      [
        "Enumerate",
        "Status defines two allowed alternatives that need display labels.",
        ["draft", "published", "Closed union"],
      ],
      [
        "Handle",
        "Each case returns, removing that alternative from the remaining path.",
        ["draft → Editing", "published → Live", "No cases remain"],
      ],
      [
        "Check remainder",
        "The default path accepts only never; adding another status makes the call fail checking until handled.",
        ["Remaining type: never", "Add archived later", "Compiler requests handling"],
      ],
    ],
    "A default branch returning a generic label can hide forgotten cases. Use a never check when every alternative deserves explicit behavior.",
    "Add archived to Status without changing label. What should happen?",
    "The assertNever call becomes a type error because status can still be archived in the default branch. Add the corresponding case.",
    handbook("narrowing"),
  ),
  "advanced--keyof-and-typeof": L(
    "keyof extracts allowed property names, while typeof in a type position captures the static type of an existing value.",
    [
      "Use keyof to keep key parameters synchronized with an object shape. Type-position typeof is different from the runtime typeof operator that returns strings such as number.",
      "These operators reduce duplication when configuration objects are the source of truth. They do not inspect arbitrary runtime data or create a runtime list of keys by themselves.",
    ],
    `const durations = { html: 20, css: 30, javascript: 40 };\ntype Durations = typeof durations;\ntype Topic = keyof Durations;\nfunction duration(topic: Topic): number { return durations[topic]; }\nconsole.log(duration('css')); // 30\n// @ts-expect-error vue is not a key in this configuration.\nduration('vue');`,
    [
      [
        "Capture shape",
        "typeof durations in a type alias describes the object’s known properties.",
        ["Runtime object", "Type-position typeof", "Durations shape"],
      ],
      [
        "Extract keys",
        "keyof produces the union of its property names.",
        ["Durations", "keyof", "html | css | javascript"],
      ],
      [
        "Constrain lookup",
        "The parameter can only select keys present in that shape.",
        ["topic: Topic", "Safe index", "number result"],
      ],
    ],
    "Do not confuse type operators with runtime reflection. A server response cannot be validated merely by declaring typeof a sample object.",
    "If a typescript property is added to durations, must Topic be manually edited?",
    "No. Topic is derived from the object type and updates automatically. Runtime data still needs its own validation.",
    handbook("keyof-types"),
  ),
  "advanced--indexed-access": L(
    "Indexed access types retrieve a member type from another type without repeating its declaration.",
    [
      "T[K] represents the property type at key K. ArrayType[number] retrieves an array element type. A union of keys produces a union of corresponding property types.",
      "Combine indexed access with generic key constraints to preserve the relationship between a selected key and its returned value.",
    ],
    `type Lesson = { title: string; minutes: number; tags: string[] };\ntype Duration = Lesson['minutes'];\ntype Tag = Lesson['tags'][number];\nfunction get<T, K extends keyof T>(value: T, key: K): T[K] {\n  return value[key];\n}\nconst minutes = get({ title: 'Grid', minutes: 30 }, 'minutes');\nconsole.log(minutes); // inferred number`,
    [
      [
        "Select member",
        "Lesson[minutes] reuses the number type declared on the model.",
        ["Lesson", "Key: minutes", "Type: number"],
      ],
      [
        "Select element",
        "Indexing the tags array type with number yields its element type.",
        ["Lesson[tags]", "string[]", "[number] → string"],
      ],
      [
        "Preserve relation",
        "K is inferred as minutes, so the generic result is specifically number.",
        ["K = minutes", "T[K]", "number result"],
      ],
    ],
    "Do not broaden key to any string when only known keys are valid. A key constraint prevents unsupported indexing.",
    'What is Lesson["title" | "minutes"]?',
    "It is string | number because either selected property type is possible.",
    handbook("indexed-access-types"),
  ),
  "advanced--mapped-types": L(
    "Mapped types transform a set of property keys into a related object type.",
    [
      "Iterate over keyof T to preserve names while changing modifiers or member types. This underlies utilities such as Partial and Readonly.",
      "Optionality and readonly modifiers affect the static contract only. A mapped type does not copy an object, add missing properties, or freeze it at runtime.",
    ],
    `type Editable<T> = { -readonly [K in keyof T]: T[K] };\ntype Flags<T> = { [K in keyof T]: boolean };\ntype Settings = { readonly captions: string; readonly theme: string };\nconst enabled: Flags<Settings> = { captions: true, theme: false };\nconst draft: Editable<Settings> = { captions: 'en', theme: 'dark' };\ndraft.theme = 'light';\nconsole.log(enabled, draft);`,
    [
      [
        "Read keys",
        "The source shape supplies captions and theme.",
        ["keyof Settings", "captions", "theme"],
      ],
      [
        "Transform members",
        "Flags retains the names but maps each value type to boolean.",
        ["[K in keys]", "Each value → boolean", "Flags shape"],
      ],
      [
        "Change modifier",
        "Editable removes readonly while keeping the original string member types.",
        ["Readonly source", "-readonly modifier", "Writable strings"],
      ],
    ],
    "Do not assume mapped types recursively transform nested objects. The simple examples here affect only one object level.",
    "Would Readonly<{meta:{title:string}}> make meta.title readonly too?",
    "No. It makes the meta property readonly, but the nested object’s title remains mutable through its own type unless separately transformed.",
    handbook("mapped-types"),
  ),
  "advanced--conditional-types": L(
    "Conditional types select a type result based on whether another type satisfies a relationship.",
    [
      "The syntax T extends U ? X : Y is evaluated by the checker, not as a runtime if statement. infer can capture a type within the matched structure.",
      "A conditional over a naked type parameter distributes across union members. Wrapping both sides in tuples can prevent distribution when the whole union should be tested together.",
    ],
    `type ElementOf<T> = T extends readonly (infer Item)[] ? Item : T;\ntype A = ElementOf<string[]>; // string\ntype B = ElementOf<number>; // number\ntype C = ElementOf<string[] | boolean>; // string | boolean\nconst title: A = 'Conditional types';\nconsole.log(title);`,
    [
      [
        "Test structure",
        "The checker asks whether T has an array structure.",
        ["T = string[]", "Matches readonly Item[]", "Infer Item = string"],
      ],
      [
        "Choose branch",
        "A nonarray number uses the fallback T branch.",
        ["T = number", "No array match", "Result = number"],
      ],
      [
        "Distribute",
        "For a union, each member is evaluated and the results are united.",
        ["string[] → string", "boolean → boolean", "string | boolean"],
      ],
    ],
    "Do not expect a conditional type to branch over actual values at runtime. Complex recursive types can become difficult to understand and slow to check.",
    "What does ElementOf<readonly number[]> produce?",
    "It produces number because the pattern accepts readonly arrays and infers their element type.",
    handbook("conditional-types"),
  ),
  "advanced--template-literal-types": L(
    "Template literal types construct string patterns from literal parts and unions.",
    [
      "A template can combine a fixed prefix with allowed keys, producing a precise set of event or property names. Union positions expand into combinations.",
      "These types are useful for naming conventions but do not validate arbitrary external strings automatically. Large cross-products can become unwieldy, so keep the domain bounded.",
    ],
    "type Topic = 'html' | 'css';\ntype EventName = `${Topic}:completed`;\nfunction logEvent(name: EventName): void { console.log(name); }\nlogEvent('html:completed');\n// @ts-expect-error Not one of the generated event names.\nlogEvent('vue:completed');",
    [
      [
        "Choose keys",
        "The Topic union supplies two possible prefixes.",
        ["html", "css", "Topic union"],
      ],
      [
        "Construct names",
        "The template appends the same suffix to each prefix.",
        ["html + :completed", "css + :completed", "Two event names"],
      ],
      [
        "Check caller",
        "A call must use one of those generated strings.",
        ["html:completed accepted", "vue:completed rejected", "Convention enforced"],
      ],
    ],
    "Do not confuse a template literal type with a runtime template string. The type generates no event dispatcher or string parser.",
    "How many combinations result from two topics and three action literals?",
    "Six combinations, assuming each topic can pair with every action. Use a more precise union if some combinations are invalid.",
    handbook("template-literal-types"),
  ),
  "ecosystem--declaration-files": L(
    "Declaration files describe the type surface of JavaScript that exists elsewhere.",
    [
      "A .d.ts file contains declarations, not executable implementations. Libraries can ship declarations or publish companion types so consumers get checking and editor assistance.",
      "Declarations must match the real runtime export names and behavior. Claiming a function exists does not install a package or create its implementation.",
    ],
    `// FILE: duration.d.ts — describes an existing duration.js module\nexport declare function formatMinutes(value: number): string;\nexport interface FormatOptions { compact?: boolean }\n\n// FILE: consumer.ts\n// import { formatMinutes } from './duration.js';\n// console.log(formatMinutes(30));\n// Supply the real duration.js implementation before running.`,
    [
      [
        "Describe",
        "The declaration records the public callable signature.",
        ["formatMinutes", "number input", "string output"],
      ],
      [
        "Check consumer",
        "The compiler uses that signature to verify calls in TypeScript source.",
        ["Consumer call", "Declaration lookup", "Argument checking"],
      ],
      [
        "Run implementation",
        "At runtime the module loader still needs the real JavaScript file.",
        ["Emitted import", "duration.js required", "Actual function executes"],
      ],
    ],
    "A broad declare module stub can turn a missing contract into any and hide errors. Keep declarations accurate and test them against the implementation.",
    "Will creating duration.d.ts make a missing duration.js import work at runtime?",
    "No. Declarations only inform tooling. The runtime module must exist and export the promised function.",
    tsDoc("handbook/declaration-files/introduction.html"),
  ),
  "ecosystem--module-resolution": L(
    "Module resolution tells TypeScript how to find the files and declarations named by imports.",
    [
      "Resolution settings should model the runtime or bundler. Node-oriented module modes account for package module type and import/require behavior; bundler mode models a different loading environment.",
      "Compiler path aliases do not automatically rewrite runtime import paths. Your bundler, runtime, or package exports must understand the same mapping.",
    ],
    `// tsconfig.json for a project run by modern Node:\n{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "NodeNext",\n    "moduleResolution": "NodeNext",\n    "strict": true,\n    "outDir": "dist"\n  },\n  "include": ["src/**/*.ts"]\n}\n// With package.json "type": "module", a source import can use:\n// import { total } from './total.js';\n// TypeScript resolves the source .ts while preserving the emitted .js path.`,
    [
      [
        "Read environment",
        "The module mode and package metadata establish how imports are interpreted.",
        ["NodeNext mode", "package.json type", "ESM or CJS context"],
      ],
      [
        "Resolve source",
        "The checker maps a runtime-oriented import to the appropriate source or declaration file.",
        ["./total.js import", "Source lookup", "total.ts types"],
      ],
      [
        "Preserve runtime path",
        "The output must still name a file the runtime can load.",
        ["Emitted import", "./total.js", "Node loads JS"],
      ],
    ],
    "A project can type-check while failing to load a path alias at runtime. Do not assume compiler paths alone configure Node.",
    "Why might an import work in a bundler but fail when emitted JavaScript runs directly in Node?",
    "The environments can differ in extension rules, aliases, and package resolution. Align compiler settings and emitted paths with the actual loader.",
    tsDoc("handbook/modules/reference.html"),
  ),
  "ecosystem--project-references": L(
    "Project references divide a larger TypeScript codebase into explicit buildable units.",
    [
      "A referenced project uses composite and produces declarations so downstream projects can consume its type surface. A solution configuration lists project relationships.",
      "Build mode follows the graph and can avoid rebuilding unchanged work. References do not replace runtime package resolution or automatically enforce every architectural boundary.",
    ],
    `// packages/core/tsconfig.json\n{ "compilerOptions": { "composite": true, "declaration": true, "outDir": "dist" }, "include": ["src"] }\n\n// packages/app/tsconfig.json\n{ "compilerOptions": { "composite": true, "outDir": "dist" }, "references": [{ "path": "../core" }], "include": ["src"] }\n\n// Root tsconfig.json\n{ "files": [], "references": [{ "path": "packages/core" }, { "path": "packages/app" }] }\n// Build: npx tsc -b`,
    [
      [
        "Define units",
        "Core and app have separate configurations and outputs.",
        ["Core project", "App project", "Independent boundaries"],
      ],
      [
        "Declare dependency",
        "The app reference tells build mode that core must be available first.",
        ["App → Core", "Build graph", "Dependency order"],
      ],
      [
        "Build graph",
        "tsc -b builds required units and uses build information for later incremental work.",
        ["Build core", "Consume declarations", "Build app"],
      ],
    ],
    "Do not point every package at every other package. Cyclic or overly connected boundaries undermine the value of a project graph.",
    "Does a project reference automatically make an arbitrary import alias work in production?",
    "No. Runtime packaging and module resolution still need to agree with the import path. References primarily coordinate type checking and builds.",
    tsDoc("handbook/project-references.html"),
  ),
  "ecosystem--javascript-migration": L(
    "TypeScript migration can proceed incrementally while keeping the existing JavaScript application working.",
    [
      "allowJs includes JavaScript files, and checkJs adds diagnostics for them. JSDoc can describe contracts before renaming files to .ts.",
      "Start at high-value boundaries and pure functions, fix meaningful errors, then expand coverage. Track temporary any usage so it does not become permanent unchecked infrastructure.",
    ],
    `// Existing JavaScript file with // @ts-check enabled:\n// @ts-check\n/**\n * @param {number} total\n * @param {number} done\n * @returns {number}\n */\nexport function remaining(total, done) {\n  return Math.max(0, total - done);\n}\n// tsconfig can enable allowJs, checkJs, and noEmit for gradual checking.`,
    [
      [
        "Check existing code",
        "JavaScript remains executable while JSDoc gives the checker a useful contract.",
        ["Existing .js", "JSDoc annotations", "Editor diagnostics"],
      ],
      [
        "Stabilize boundary",
        "Fix incompatible callers and ambiguous data shapes before spreading annotations everywhere.",
        ["Function contract", "Caller fixes", "Reliable boundary"],
      ],
      [
        "Convert gradually",
        "Rename selected files and replace JSDoc types with TypeScript syntax as tooling permits.",
        ["Stable module", ".js → .ts", "Incremental migration"],
      ],
    ],
    "Do not rename the whole codebase and suppress every error with any. That creates work without gaining much reliability.",
    "Which module would be a good first migration candidate?",
    "A pure, well-tested module with clear inputs and outputs provides quick feedback. Network boundaries are also valuable once runtime validation is explicit.",
    tsDoc("handbook/migrating-from-javascript.html"),
  ),
  "ecosystem--library-typing": L(
    "A library’s type declarations are part of its public API and should support realistic consumer usage.",
    [
      "Export stable domain types and precise function signatures. Inferred implementation details can accidentally leak into declarations, so review generated .d.ts output.",
      "Test the package as a consumer would install and import it, including the intended module formats and package exports. Type compatibility and runtime loading must both work.",
    ],
    `// src/index.ts\nexport interface Lesson { id: string; title: string }\nexport function findLesson(lessons: readonly Lesson[], id: string): Lesson | undefined {\n  return lessons.find(lesson => lesson.id === id);\n}\n// Generate declarations using a build tsconfig with:\n// "declaration": true, "outDir": "dist"\n// Package metadata must point consumers to the real JS and declaration outputs.`,
    [
      [
        "Design API",
        "The function accepts readonly input and explicitly models a missing result.",
        ["readonly Lesson[]", "id:string", "Lesson | undefined"],
      ],
      [
        "Emit contract",
        "Declaration generation exposes the public interface without the function body.",
        ["Source types", ".d.ts output", "Consumer contract"],
      ],
      [
        "Consume package",
        "A sample consumer verifies both type resolution and runtime import behavior.",
        ["Installed package", "Type check", "Runtime call"],
      ],
    ],
    "Do not advertise types that differ from runtime behavior or expose private build paths consumers cannot resolve.",
    "Why is Lesson | undefined a better return contract than Lesson here?",
    "A lookup can fail. Modeling absence forces callers to handle it instead of trusting an assertion that the implementation cannot guarantee.",
    tsDoc("handbook/declaration-files/publishing.html"),
  ),
  "production--strict-configuration": L(
    "Strict checking makes assumptions about missing values and callable contracts visible during development.",
    [
      "strict enables a family of checks such as noImplicitAny and strictNullChecks. Additional flags such as noUncheckedIndexedAccess and exactOptionalPropertyTypes address separate risks and are not implied by strict.",
      "Adopt flags with an understanding of the codebase and fix real assumptions rather than silencing diagnostics. Keep type checking in continuous integration even if development transpilation is fast.",
    ],
    `// Relevant compilerOptions:\n// "strict": true,\n// "noUncheckedIndexedAccess": true,\n// "exactOptionalPropertyTypes": true\n\nconst titles: string[] = ['HTML'];\nconst first = titles[0]; // string | undefined with indexed-access checking\nif (first !== undefined) console.log(first.toUpperCase());`,
    [
      [
        "Enable checks",
        "The configuration chooses explicit policies for implicit types, nullability, and index access.",
        ["strict", "Indexed access check", "Exact optional properties"],
      ],
      [
        "Expose uncertainty",
        "An array access may be out of bounds even when its element type is string.",
        ["titles[index]", "Possible missing item", "string | undefined"],
      ],
      [
        "Prove before use",
        "The conditional removes undefined before a string method call.",
        ["Check !== undefined", "first:string", "Safe method call"],
      ],
    ],
    "Non-null assertions can make a strict project look clean while preserving runtime bugs. Use them only when an external invariant is actually guaranteed.",
    "Does strict alone enable noUncheckedIndexedAccess?",
    "No. Enable it separately when you want indexed reads to reflect potentially missing values.",
    tsDoc("tsconfig/"),
  ),
  "production--error-design": L(
    "Typed error models make expected failures part of the function contract instead of hidden control flow.",
    [
      "A result union can distinguish success from expected validation failure. Exceptional infrastructure failures may still use thrown errors, but callers should know which channel to handle.",
      "Use stable error codes for programmatic decisions and human-readable messages for explanation. Avoid exposing raw internal exceptions as public API data.",
    ],
    `type Result<T> = { ok: true; value: T } | { ok: false; code: 'INVALID_DURATION'; message: string };\nfunction parseDuration(text: string): Result<number> {\n  const value = Number(text);\n  if (!text.trim() || !Number.isFinite(value) || value < 0) {\n    return { ok: false, code: 'INVALID_DURATION', message: 'Enter a nonnegative number' };\n  }\n  return { ok: true, value };\n}\nconst result = parseDuration('20');\nconsole.log(result.ok ? result.value : result.message);`,
    [
      [
        "Parse",
        "The function treats invalid user input as an expected alternative.",
        ["Input text", "Validate duration", "Success or failure"],
      ],
      [
        "Discriminate",
        "The ok field determines which payload exists.",
        ["ok:true → value", "ok:false → code + message", "No impossible mix"],
      ],
      [
        "Recover",
        "The caller can display a correction without relying on exception text parsing.",
        ["Check result.ok", "Use typed payload", "Continue or correct"],
      ],
    ],
    "Do not return a success object containing an undefined value to represent failure. Keep the result alternatives distinct and complete.",
    "How should a UI distinguish invalid input from a server outage?",
    "Model separate failure categories or channels and provide different recovery actions. Do not collapse every failure into one ambiguous message.",
    handbook("narrowing"),
  ),
  "production--runtime-validation": L(
    "Runtime validation turns external unknown values into domain values whose static types can be trusted.",
    [
      "JSON parsing verifies syntax, not your schema. Start with unknown, check required fields and domain constraints, then return a typed value or an explicit failure.",
      "A schema library can centralize complex rules, but a small manual parser is useful for understanding the boundary. Keep validation and type definitions aligned as the contract evolves.",
    ],
    `type Lesson = { title: string; minutes: number };\nfunction parseLesson(value: unknown): Lesson {\n  if (typeof value !== 'object' || value === null\n      || !('title' in value) || typeof value.title !== 'string'\n      || !('minutes' in value) || typeof value.minutes !== 'number'\n      || !Number.isFinite(value.minutes) || value.minutes < 0) {\n    throw new Error('Invalid lesson payload');\n  }\n  return { title: value.title, minutes: value.minutes };\n}\nconst lesson = parseLesson(JSON.parse('{"title":"Grid","minutes":30}'));\nconsole.log(lesson.minutes);`,
    [
      [
        "Untrusted input",
        "The parsed JSON value may have any shape even if the request was successful.",
        ["JSON response", "unknown value", "No schema guarantee"],
      ],
      [
        "Validate",
        "The parser checks object shape, field types, and a nonnegative finite duration.",
        ["Object + fields", "string + number", "Domain constraints"],
      ],
      [
        "Construct domain value",
        "The returned object contains only the validated fields and satisfies Lesson.",
        ["Validated title", "Validated minutes", "Trusted Lesson"],
      ],
    ],
    "Do not replace this boundary with value as Lesson. Assertions do not inspect data or reject invalid payloads.",
    'Why check Number.isFinite after typeof minutes === "number"?',
    "NaN and Infinity are numbers in JavaScript but are not meaningful finite durations. Domain validity is stricter than the primitive type.",
    handbook("narrowing"),
  ),
  "production--testing": L(
    "A TypeScript test strategy checks both runtime behavior and the intended static API contract.",
    [
      "Runtime tests catch incorrect calculations and effects that types cannot prove. Type checks catch incompatible usage before execution. Both are necessary for important boundaries.",
      "Use @ts-expect-error for deliberate negative type cases because it reports an error if the expected diagnostic disappears. A transpile-only test runner may execute tests without checking these comments.",
    ],
    `// TYPE CHECK FIXTURE: run with tsc --noEmit --strict\nfunction double(value: number): number { return value * 2; }\nconst valid: number = double(3);\n// @ts-expect-error Strings are outside the public contract.\ndouble('3');\n\n// Runtime assertion for this small example:\nif (valid !== 6) throw new Error('Expected double(3) to equal 6');`,
    [
      [
        "Check valid use",
        "The positive case verifies that numeric input produces a number-compatible result.",
        ["double(3)", "Result type:number", "Assignment accepted"],
      ],
      [
        "Check invalid use",
        "The negative case must remain rejected; the directive becomes stale if the API accidentally broadens.",
        ['double("3")', "Expected diagnostic", "Regression protection"],
      ],
      [
        "Run behavior",
        "The runtime assertion independently checks that the implementation multiplies correctly.",
        ["Execute function", "Actual value:6", "Behavior assertion"],
      ],
    ],
    "Do not assume running Vitest or another transpiling runner also runs tsc. Keep a separate type-check command in the verification workflow.",
    "Would types catch an implementation that returns value * 3 instead?",
    "No. The return type is still number. A runtime test with a concrete expected result catches that behavioral mistake.",
    tsDoc("handbook/release-notes/typescript-3-9.html"),
  ),
  "production--architecture-practices": L(
    "TypeScript architecture is strongest when types follow domain boundaries and runtime trust is explicit.",
    [
      "Separate external transport data from validated domain models. Keep pure domain operations independent of browser, database, or framework details when practical.",
      "Use explicit interfaces at meaningful boundaries, preserve precise types through adapters, and avoid a global collection of any-shaped objects. Types should clarify ownership rather than add layers without purpose.",
    ],
    `type Lesson = { id: string; minutes: number };\ninterface LessonRepository {\n  find(id: string): Promise<Lesson | undefined>;\n}\nasync function plannedMinutes(repository: LessonRepository, id: string): Promise<number> {\n  const lesson = await repository.find(id);\n  if (!lesson) throw new Error('Lesson not found');\n  return lesson.minutes;\n}\n// An HTTP adapter validates its JSON before returning Lesson.\n// A test adapter can return a known in-memory Lesson.`,
    [
      [
        "Boundary",
        "The application depends on a repository contract instead of a particular HTTP client.",
        ["Application operation", "LessonRepository", "Adapter implementation"],
      ],
      [
        "Validate adapter",
        "An external adapter establishes the domain shape before data crosses the boundary.",
        ["Remote JSON", "Runtime parser", "Lesson or missing"],
      ],
      [
        "Use domain",
        "The operation handles absence and then works with a known duration.",
        ["Await find", "Handle undefined", "Return minutes"],
      ],
    ],
    "Do not share raw API payload types everywhere if the transport and domain evolve independently. Avoid interfaces that simply mirror every implementation detail.",
    "Build a typed lesson planner with an API parser, state union, and tests. What should each layer guarantee?",
    "The parser validates unknown input, the domain models valid lessons, the state union represents loading and failure explicitly, and tests cover both runtime outcomes and rejected type usage.",
    handbook("objects"),
  ),
};
