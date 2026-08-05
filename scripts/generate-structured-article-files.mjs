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

const root = resolve("src/components");
const courses = [
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
