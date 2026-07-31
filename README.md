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
