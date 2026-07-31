import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { modules, articleTemplates } from "../src/data/catalog.js";

const root = resolve("src/components");
const pascal = (value) =>
  value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
const articleFile = {
  introduction: "Introduction",
  "core-concepts": "CoreConcepts",
  architecture: "Architecture",
  "practical-guide": "PracticalGuide",
  "best-practices": "BestPractices",
  "interview-questions": "InterviewQuestions",
};
const writeMissing = (path, content) => {
  if (!existsSync(path)) writeFileSync(path, content, "utf8");
};

for (const module of modules) {
  const moduleJsx = resolve(root, module.id, "jsx");
  const moduleCss = resolve(root, module.id, "css");
  mkdirSync(moduleJsx, { recursive: true });
  mkdirSync(moduleCss, { recursive: true });
  const moduleName = pascal(module.name);
  writeMissing(
    resolve(moduleJsx, `${moduleName}.jsx`),
    `import ModulePage from "../../learning/ModulePage";\nimport { getModule } from "../../../data/catalog";\nimport "../css/${moduleName}.css";\nexport default function ${moduleName}({ navigate }) { return <div className="module-${module.id}"><ModulePage module={getModule("${module.id}")} navigate={navigate} /></div>; }\n`,
  );
  writeMissing(
    resolve(moduleCss, `${moduleName}.css`),
    `.module-${module.id} .moduleIntro{background:radial-gradient(circle at 85% 30%,color-mix(in srgb,${module.accent} 14%,transparent),transparent 32%)}\n`,
  );

  for (const track of module.groups.flatMap((group) => group.tracks)) {
    const trackJsx = resolve(root, module.id, track.slug, "jsx");
    const trackCss = resolve(root, module.id, track.slug, "css");
    mkdirSync(trackJsx, { recursive: true });
    mkdirSync(trackCss, { recursive: true });
    const courseName = `${pascal(module.id)}${pascal(track.slug)}Course`;
    writeMissing(
      resolve(trackJsx, "Course.jsx"),
      `import CoursePage from "../../../learning/CoursePage";\nimport { getModule, getTrack } from "../../../../data/catalog";\nimport "../css/Course.css";\nexport default function ${courseName}({ navigate }) { const module = getModule("${module.id}"); return <div className="course-${module.id}-${track.slug}"><CoursePage module={module} track={getTrack(module, "${track.slug}")} navigate={navigate} /></div>; }\n`,
    );
    writeMissing(
      resolve(trackCss, "Course.css"),
      `.course-${module.id}-${track.slug} .courseMain>header{background:radial-gradient(circle at 90% 15%,color-mix(in srgb,${module.accent} 12%,transparent),transparent 32%)}\n`,
    );

    for (const article of articleTemplates) {
      const file = articleFile[article.slug];
      const component = `${pascal(module.id)}${pascal(track.slug)}${file}`;
      writeMissing(
        resolve(trackJsx, `${file}.jsx`),
        `import "../css/${file}.css";\nexport default function ${component}() { const topic = ${JSON.stringify(track.name)}; return <div className="article-${module.id}-${track.slug}-${article.slug}"><section id="overview"><p className="lead">${article.title} for {topic}</p><p>This article has its own JSX and CSS files. Replace this starter copy with your detailed technical explanation while keeping the shared reader navigation.</p></section><section id="concepts"><h2>1. Core concepts</h2><p>Explain the stable mental models, important terminology, architecture decisions, and trade-offs for {topic}.</p><ul><li>Define the problem before introducing the tool.</li><li>Connect each concept to a production scenario.</li><li>Call out constraints and failure modes.</li></ul></section><section id="example"><h2>2. Practical example</h2><pre><code>{\`// Add a focused example here\\nconst lesson = { status: "ready" };\`}</code></pre></section><section id="mistakes"><h2>3. Common mistakes</h2><p>Document mistakes engineers make with {topic}, why they occur, and how to recognize them during review.</p></section><section id="check"><h2>4. Knowledge check</h2><div className="quiz"><p>Explain when you would use {topic} and which alternative you would compare it with.</p></div></section></div>; }\n`,
      );
      writeMissing(
        resolve(trackCss, `${file}.css`),
        `.article-${module.id}-${track.slug}-${article.slug}{--article-accent:${module.accent}}.article-${module.id}-${track.slug}-${article.slug} .lead{border-left:3px solid var(--article-accent);padding-left:18px}.article-${module.id}-${track.slug}-${article.slug} h2{color:color-mix(in srgb,var(--article-accent) 78%,var(--text))}\n`,
      );
    }
  }
}
