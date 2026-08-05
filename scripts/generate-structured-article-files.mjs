import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { reactSections } from "../src/data/react.js";
import { javaSections } from "../src/data/java.js";
import { systemDesignFundamentalsSections } from "../src/data/systemDesignFundamentals.js";
import { highLevelDesignSections } from "../src/data/highLevelDesign.js";
import { lowLevelDesignSections } from "../src/data/lowLevelDesign.js";
import { angularSections } from "../src/data/angular.js";
import { springBootSections } from "../src/data/springBoot.js";
import { microservicesSections } from "../src/data/microservices.js";
import { apiDesignSections } from "../src/data/apiDesign.js";
import { cleanCodeSections } from "../src/data/cleanCode.js";
import { cleanArchitectureSections } from "../src/data/cleanArchitecture.js";
import { designPatternsSections } from "../src/data/designPatterns.js";
import { dddSections } from "../src/data/ddd.js";
import {
  cssSections, htmlSections, javascriptSections, materialUiSections, nextJsSections,
  reduxSections, tailwindCssSections, typescriptSections, viteSections, vueSections,
} from "../src/data/frontendCourses.js";
import {
  authenticationSections, djangoSections, expressJsSections, fastApiSections,
  goSections, graphQlSections, nodeJsSections, oauthSections, pythonSections,
  restApiSections,
} from "../src/data/backendCourses.js";

const root = resolve("src/components");
const courses = [
  { componentPath: "backend/python", name: "Python", sections: pythonSections },
  { componentPath: "backend/node-js", name: "Node.js", sections: nodeJsSections },
  { componentPath: "backend/go", name: "Go", sections: goSections },
  { componentPath: "backend/express-js", name: "Express.js", sections: expressJsSections },
  { componentPath: "backend/fastapi", name: "FastAPI", sections: fastApiSections },
  { componentPath: "backend/django", name: "Django", sections: djangoSections },
  { componentPath: "backend/rest-api", name: "REST API", sections: restApiSections },
  { componentPath: "backend/graphql", name: "GraphQL", sections: graphQlSections },
  { componentPath: "backend/authentication", name: "Authentication", sections: authenticationSections },
  { componentPath: "backend/oauth", name: "OAuth", sections: oauthSections },
  { componentPath: "frontend/html", name: "HTML", sections: htmlSections },
  { componentPath: "frontend/css", name: "CSS", sections: cssSections },
  { componentPath: "frontend/javascript", name: "JavaScript", sections: javascriptSections },
  { componentPath: "frontend/typescript", name: "TypeScript", sections: typescriptSections },
  { componentPath: "frontend/vue", name: "Vue", sections: vueSections },
  { componentPath: "frontend/next-js", name: "Next.js", sections: nextJsSections },
  { componentPath: "frontend/tailwind-css", name: "Tailwind CSS", sections: tailwindCssSections },
  { componentPath: "frontend/material-ui", name: "Material UI", sections: materialUiSections },
  { componentPath: "frontend/redux", name: "Redux", sections: reduxSections },
  { componentPath: "frontend/vite", name: "Vite", sections: viteSections },
  {
    componentPath: "architecture/design-patterns",
    name: "Design Patterns",
    sections: designPatternsSections,
  },
  { componentPath: "architecture/ddd", name: "Domain-Driven Design", sections: dddSections },
  {
    componentPath: "architecture/clean-architecture",
    name: "Clean Architecture",
    sections: cleanArchitectureSections,
  },
  { componentPath: "architecture/clean-code", name: "Clean Code", sections: cleanCodeSections },
  { componentPath: "architecture/api-design", name: "API Design", sections: apiDesignSections },
  {
    componentPath: "architecture/microservices",
    name: "Microservices",
    sections: microservicesSections,
  },
  { componentPath: "backend/spring-boot", name: "Spring Boot", sections: springBootSections },
  { componentPath: "frontend/angular", name: "Angular", sections: angularSections },
  { componentPath: "frontend/react", name: "React", sections: reactSections },
  { componentPath: "backend/java", name: "Java", sections: javaSections },
  {
    componentPath: "system-design/system-design-fundamentals",
    name: "System Design Fundamentals",
    sections: systemDesignFundamentalsSections,
  },
  {
    componentPath: "system-design/high-level-design",
    name: "High Level Design",
    sections: highLevelDesignSections,
  },
  {
    componentPath: "system-design/low-level-design",
    name: "Low Level Design",
    sections: lowLevelDesignSections,
  },
];
const requestedCourses = new Set(process.argv.slice(2));

const componentName = (slug) =>
  `${slug
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("")}Article`;

for (const course of courses) {
  if (requestedCourses.size && !requestedCourses.has(course.componentPath)) continue;
  for (const section of course.sections) {
    const sectionRoot = resolve(root, course.componentPath, section.slug);
    await rm(resolve(sectionRoot, "jsx/Article.jsx"), { force: true });
    await rm(resolve(sectionRoot, "css/Article.css"), { force: true });

    for (const article of section.lessons) {
      const articleRoot = resolve(sectionRoot, "articles", article.slug);
      const jsxDirectory = resolve(articleRoot, "jsx");
      const cssDirectory = resolve(articleRoot, "css");
      await mkdir(jsxDirectory, { recursive: true });
      await mkdir(cssDirectory, { recursive: true });

      const jsx = `import "../css/Article.css";

export default function ${componentName(article.slug)}() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">${article.title}</p>
        <p>This dedicated article belongs to ${course.name} / ${section.title}. Replace this placeholder with the final article content.</p>
      </section>
      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Explain the terminology, responsibilities, constraints, and trade-offs for ${article.title}.</p>
      </section>
      <section id="example">
        <h2>Practical example</h2>
        <p>Add a focused implementation, diagram, or walkthrough for this article.</p>
      </section>
      <section id="mistakes">
        <h2>Common mistakes</h2>
        <p>Document common failure modes and how to avoid them.</p>
      </section>
      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz"><p>What are the most important decisions and trade-offs in ${article.title}?</p></div>
      </section>
    </div>
  );
}
`;
      const css = `.dedicatedStructuredArticle .lead {
  font-size: 1.25rem;
}

.dedicatedStructuredArticle section {
  margin-bottom: 36px;
}
`;
      await writeFile(resolve(jsxDirectory, "Article.jsx"), jsx);
      await writeFile(resolve(cssDirectory, "Article.css"), css);
    }
  }
}
