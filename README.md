# Engineering Decoded

## Java trees and networks

The Java course at `/learn/backend/java` includes 24 lessons in three sections:
trees, graph networks, and Java networking projects. Start at
`/learn/backend/java/trees-in-java--model`. Each lesson includes a correctness
invariant, complexity, a three-step visual trace, a complete Java 21 program,
expected output, edge cases, an interview exercise with a revealed answer, and
a project application. Selected tree and graph lessons also show SVG node diagrams.
TCP and HTTP demos use local loopback fixtures; the browser does not execute Java.

Content and code live in `src/data/javaNetworkLessons.js` and
`src/data/javaNetworkPrograms.js`. Run `npm run generate:java-networks` to create
the route wrappers. Run `npm run check:java-networks` with a JDK 21+ on PATH to
render all routes, compile each example against Java 21 APIs, compare output,
and check algorithm boundary cases. The validator creates temporary source/class
files and briefly binds loopback ports for the TCP and HTTP examples.

A standard React + Vite + JavaScript project using JSX and plain CSS.

## Folder structure

```text
src/
  components/
    home/                 # Learning-module catalogue
    learning/             # Shared module, course, and article layouts
    layout/               # Shared site header
    registry.js           # Automatically discovers every module and course
    frontend/
      jsx/Frontend.jsx
      css/Frontend.css
      react/
        jsx/              # Course.jsx + every React article JSX
        css/              # Course.css + matching article CSS
    backend/
      jsx/Backend.jsx
      css/Backend.css
      java/
        jsx/              # Course.jsx + every Java article JSX
        css/              # Course.css + matching article CSS
    devops/
      jsx/DevOpsAndPlatformEngineering.jsx
      css/DevOpsAndPlatformEngineering.css
      docker/
        jsx/              # Course.jsx + every Docker article JSX
        css/              # Course.css + matching article CSS
    ...                   # Same pattern for every catalog module
    articles/
      registry.js         # Automatically discovers every article page
  data/
    catalog.js            # Modules, courses, and article structure
  styles/
    global.css            # Global styles only
  App.jsx                 # Route composition
  main.jsx                # React entry point
scripts/
  scaffold-course-files.mjs # Generates missing JSX/CSS pairs from catalog.js
```

Every technology keeps JSX and CSS in separate folders. Add a track to
`catalog.js`, then run `node scripts/scaffold-course-files.mjs`. It creates the
module, course, and six editable article pairs without overwriting existing content.

## Commands

```bash
npm install
npm run dev
npm run build
```

For Vercel, import this repository and use the default Vite settings: build command `npm run build`, output directory `dist`.

## Tutorial coverage and deployment checks

Use Node.js 24 (also selected by `package.json` for Vercel). `npm run build`
first runs `npm run check:tutorials`, then creates the Vite production output.
The content check imports the course data, renders course outlines and every
article, checks unique lesson routes and section membership, verifies invalid
lesson handling, and checks the Vercel SPA rewrite. This catches runtime data
errors that Vite's compilation alone cannot detect. Run `npm run lint` separately.

Existing written article components are retained. Previously missing or scaffolded
articles use `TutorialLesson`, with course-specific context, reusable explanations
of the relevant mechanism, worked traces, guided practice, expected results,
failure cases, and a revealable knowledge check. The shared material lives in
`src/data/tutorialProfiles.js`, `tutorialTopics.js`, and `tutorialPractice.js`.
Traces are conceptual exercises, not executable integrations with every named tool.
Product-specific lessons can be expanded with dedicated components over time.

Mobile, desktop, and tooling tracks with custom outlines now expose their actual
topics as navigable lessons. The Vite `tutorial-articles` plugin indexes written
components and excludes historical starter files from the deployment bundle.
Restart the development server after adding a new dedicated article file.

Vercel serves the static frontend and supports direct lesson links through the
existing `vercel.json` rewrite. Account, admin, and signed-in progress features
also require the separately hosted backend: set `VITE_API_URL` to its public
HTTPS API base URL (including `/api`) in Vercel and configure the backend's allowed
origin to match the frontend. Never put server credentials in `VITE_*` variables.
Anonymous tutorial reading does not require that backend. Verify a deployed
preview's homepage, direct lesson URL, refresh, next lesson, and answer reveal
before promoting it; a local build cannot verify project settings or a live backend.

## Database course content

The Database Engineering module contains 22 courses with 30 lessons each. Existing
article URLs load the shared `DatabaseLessonArticle` reader with course-specific
explanations, section labs, expected results, interactive walkthroughs, knowledge
checks, and official references. The six older entry components per course also
delegate to authored lessons.

Content lives in `src/data/databaseLessonTopics.js` and the database profile files
for relational, NoSQL, hybrid, vector, and scaling courses. Each profile has 30
explanations in outline order and six section labs. Runnable examples identify
their dialect and prerequisites; architectural exercises are labeled separately.
Labs use disposable environments, and later sections can depend on earlier setup.
Cloud/server examples require the corresponding environment and credentials;
the website displays examples and does not execute database commands.

Run `npm run check:databases` to validate catalog coverage, article imports,
server-rendered content, prerequisites, and reader sections. This check does not
provision database engines or execute their examples. After changing the outline,
update the matching topics/profiles and run
`node scripts/populate-database-articles.mjs` to regenerate article wrappers;
the script refuses to overwrite unrecognized authored content.

## Data Structures and Algorithms

The DSA module has 19 courses and 129 distinct authored lessons. DSA Foundations
now contains the complete 129-lesson learning path, from environment setup to a
route-planning capstone. Its URL is `/learn/dsa/dsa-foundations`; the singular
`/learn/dsa/dsa-foundation` URL is also accepted. The other 18 courses remain
available as focused topic tracks. Every lesson
includes an invariant, time/space analysis, a worked input, a JavaScript
implementation (Java for Arrays, JavaScript for the other topics), an interactive visual trace, and a practice question with an
explanation. Coverage uses the linked TutorialsPoint curriculum as a reference;
the prose, code, and visualizations are original.

Edit `src/data/dsaLinearLessons.js`, `dsaHierarchyLessons.js`, and
`dsaAlgorithmLessons.js` for content. `dsaFoundationLessons.js` assembles those
lessons in prerequisite order and adds setup, further searching and sorting,
connectivity, flow, matrix-chain optimization, approximation, randomization,
and a capstone. The original four foundation article URLs are preserved.
The pure implementations in `dsaAlgorithms.js`, `dsaAdvancedAlgorithms.js`,
and `dsaFoundationAlgorithms.js` emit the states rendered by the
visual lab. Small fixed inputs keep recursion and trace storage bounded. The
reader can reverse selected example arrays, step backward/forward, reset, and
jump to any recorded step. Graphs have text alternatives; wide diagrams and
matrices scroll within their own region on narrow screens.

After changing content or algorithms, run:

```bash
node scripts/generate-dsa-courses.mjs
npm run check:dsa
```

The generator refreshes route wrappers, the lightweight course catalog, legacy
aliases, and readable code strings that remain unminified in production. It
preserves the 240 old DSA article URLs through explicit aliases. The validator
runs the displayed implementations independently, compares randomized examples
against reference results, checks balanced-tree invariants and failure cases,
and renders every lesson. Visualization snapshot overhead is excluded from the
algorithmic complexity discussed in lessons.

### Arrays in Java

`/learn/dsa/arrays` contains 36 Java lessons covering language essentials,
ownership and copying, standard library contracts, interview patterns, matrix
operations, and projects using bounded buffers, rolling metrics, range updates,
and immutable snapshots. The five original array lesson URLs are preserved;
the complete DSA Foundations course includes the same upgraded material.
Every lesson has a standalone `ArrayLesson.java` program, step-by-step playback,
complexity analysis, an invariant, worked practice, boundary cases, and project
guidance. Programs target Java 17 or later and link to Java SE 21 documentation.

Edit `src/data/javaArrayLessons.js` for teaching material and
`src/data/javaArrayPrograms.js` for Java methods and executable cases.
`javaArrayRuntime.js` supplies the standalone program's trace harness.
The browser replays real Java snapshots from `javaArrayTraces.js`; it does not
compile Java or execute reader edits. Trace storage is teaching overhead and
is excluded from the stated algorithm complexities.

With `java` and `javac` on PATH, run:

```bash
npm run generate:java-arrays
node scripts/generate-dsa-courses.mjs
npm run check:java-arrays
npm run check:dsa
```

The Java check compiles and runs all 103 authored cases, checks expected results
and highlighted indices, and verifies that committed traces match the exact
displayed programs. Generation uses an isolated temporary directory and leaves
no Java class files in the repository.

## Java linked lists, stacks, queues/deques, and hash tables

The Java course at `/learn/backend/java` includes 18 authored lessons in four
new sections. Each lesson has a runnable Java 21 example with expected output,
a manually stepped visual trace, an invariant, complexity analysis, pitfalls,
project applications, interview exercises, and official Java API references.
The LRU cache capstone combines hashing and recency ordering.

Content: `src/data/javaStructureLessons.js`. Shared reader:
`src/components/learning/JavaStructureArticle.jsx`. Article wrappers follow the
existing course registry and preserve the Java course's earlier routes.

Run `node scripts/check-java-structures.mjs` with Node and a JDK on PATH to check
all 18 registered routes, server-render their content, compile each Java example,
and compare its actual output. The default uses `javac --release 21`. If a JDK
installation cannot read its release signature archive, setting
`JAVA_STRUCTURE_SOURCE_CHECK=1` uses `--source 21 --target 21` instead; this checks
language/bytecode compatibility but not the Java 21 API surface. Browser traces
are explanatory snapshots, not an in-browser Java interpreter.
