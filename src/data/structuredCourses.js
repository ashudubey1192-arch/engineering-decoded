import {
  systemDesignFundamentalsArticles,
  systemDesignFundamentalsSections,
} from "./systemDesignFundamentals";
import { highLevelDesignArticles, highLevelDesignSections } from "./highLevelDesign";
import { lowLevelDesignArticles, lowLevelDesignSections } from "./lowLevelDesign";
import { javaArticles, javaSections } from "./java";
import { reactArticles, reactSections } from "./react";
import { angularArticles, angularSections } from "./angular";
import { springBootArticles, springBootSections } from "./springBoot";
import { microservicesArticles, microservicesSections } from "./microservices";
import { apiDesignArticles, apiDesignSections } from "./apiDesign";
import { cleanCodeArticles, cleanCodeSections } from "./cleanCode";
import {
  cleanArchitectureArticles,
  cleanArchitectureSections,
} from "./cleanArchitecture";
import { designPatternsArticles, designPatternsSections } from "./designPatterns";
import { dddArticles, dddSections } from "./ddd";
import {
  cssArticles, cssSections, htmlArticles, htmlSections, javascriptArticles,
  javascriptSections, materialUiArticles, materialUiSections, nextJsArticles,
  nextJsSections, reduxArticles, reduxSections, tailwindCssArticles,
  tailwindCssSections, typescriptArticles, typescriptSections, viteArticles,
  viteSections, vueArticles, vueSections,
} from "./frontendCourses";
import {
  authenticationArticles, authenticationSections, djangoArticles, djangoSections,
  expressJsArticles, expressJsSections, fastApiArticles, fastApiSections, goArticles,
  goSections, graphQlArticles, graphQlSections, nodeJsArticles, nodeJsSections,
  oauthArticles, oauthSections, pythonArticles, pythonSections, restApiArticles,
  restApiSections,
} from "./backendCourses";
import { databaseCourses } from "./databaseCourses";

const courses = {
  ...databaseCourses,
  "system-design-fundamentals": {
    sections: systemDesignFundamentalsSections,
    articles: systemDesignFundamentalsArticles,
    componentPath: "system-design/system-design-fundamentals",
  },
  "high-level-design": {
    sections: highLevelDesignSections,
    articles: highLevelDesignArticles,
    componentPath: "system-design/high-level-design",
  },
  "low-level-design": {
    sections: lowLevelDesignSections,
    articles: lowLevelDesignArticles,
    componentPath: "system-design/low-level-design",
  },
  java: { sections: javaSections, articles: javaArticles, componentPath: "backend/java" },
  python: { sections: pythonSections, articles: pythonArticles, componentPath: "backend/python" },
  "node-js": { sections: nodeJsSections, articles: nodeJsArticles, componentPath: "backend/node-js" },
  go: { sections: goSections, articles: goArticles, componentPath: "backend/go" },
  "express-js": { sections: expressJsSections, articles: expressJsArticles, componentPath: "backend/express-js" },
  fastapi: { sections: fastApiSections, articles: fastApiArticles, componentPath: "backend/fastapi" },
  django: { sections: djangoSections, articles: djangoArticles, componentPath: "backend/django" },
  "rest-api": { sections: restApiSections, articles: restApiArticles, componentPath: "backend/rest-api" },
  graphql: { sections: graphQlSections, articles: graphQlArticles, componentPath: "backend/graphql" },
  authentication: { sections: authenticationSections, articles: authenticationArticles, componentPath: "backend/authentication" },
  oauth: { sections: oauthSections, articles: oauthArticles, componentPath: "backend/oauth" },
  react: { sections: reactSections, articles: reactArticles, componentPath: "frontend/react" },
  angular: {
    sections: angularSections,
    articles: angularArticles,
    componentPath: "frontend/angular",
  },
  html: { sections: htmlSections, articles: htmlArticles, componentPath: "frontend/html" },
  css: { sections: cssSections, articles: cssArticles, componentPath: "frontend/css" },
  javascript: { sections: javascriptSections, articles: javascriptArticles, componentPath: "frontend/javascript" },
  typescript: { sections: typescriptSections, articles: typescriptArticles, componentPath: "frontend/typescript" },
  vue: { sections: vueSections, articles: vueArticles, componentPath: "frontend/vue" },
  "next-js": { sections: nextJsSections, articles: nextJsArticles, componentPath: "frontend/next-js" },
  "tailwind-css": { sections: tailwindCssSections, articles: tailwindCssArticles, componentPath: "frontend/tailwind-css" },
  "material-ui": { sections: materialUiSections, articles: materialUiArticles, componentPath: "frontend/material-ui" },
  redux: { sections: reduxSections, articles: reduxArticles, componentPath: "frontend/redux" },
  vite: { sections: viteSections, articles: viteArticles, componentPath: "frontend/vite" },
  "spring-boot": {
    sections: springBootSections,
    articles: springBootArticles,
    componentPath: "backend/spring-boot",
  },
  microservices: {
    sections: microservicesSections,
    articles: microservicesArticles,
    componentPath: "architecture/microservices",
  },
  "api-design": {
    sections: apiDesignSections,
    articles: apiDesignArticles,
    componentPath: "architecture/api-design",
  },
  "clean-code": {
    sections: cleanCodeSections,
    articles: cleanCodeArticles,
    componentPath: "architecture/clean-code",
  },
  "clean-architecture": {
    sections: cleanArchitectureSections,
    articles: cleanArchitectureArticles,
    componentPath: "architecture/clean-architecture",
  },
  "design-patterns": {
    sections: designPatternsSections,
    articles: designPatternsArticles,
    componentPath: "architecture/design-patterns",
  },
  ddd: { sections: dddSections, articles: dddArticles, componentPath: "architecture/ddd" },
};

export const getStructuredCourse = (trackSlug) => courses[trackSlug] || null;
export const getStructuredCourseSections = (trackSlug) => getStructuredCourse(trackSlug)?.sections;
export const getStructuredCourseArticles = (trackSlug) => getStructuredCourse(trackSlug)?.articles;
