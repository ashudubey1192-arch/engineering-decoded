# Engineering Decoded

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

The DSA module has 19 courses and 98 distinct authored lessons. DSA Foundations
now contains the complete 98-lesson learning path, from environment setup to a
route-planning capstone. Its URL is `/learn/dsa/dsa-foundations`; the singular
`/learn/dsa/dsa-foundation` URL is also accepted. The other 18 courses remain
available as focused topic tracks. Every lesson
includes an invariant, time/space analysis, a worked input, a JavaScript
implementation, an interactive visual trace, and a practice question with an
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
