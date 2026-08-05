import {
  systemDesignFundamentalsArticles,
  systemDesignFundamentalsSections,
} from "./systemDesignFundamentals";
import { highLevelDesignArticles, highLevelDesignSections } from "./highLevelDesign";
import { lowLevelDesignArticles, lowLevelDesignSections } from "./lowLevelDesign";
import { javaArticles, javaSections } from "./java";
import { reactArticles, reactSections } from "./react";

const courses = {
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
  react: { sections: reactSections, articles: reactArticles, componentPath: "frontend/react" },
};

export const getStructuredCourse = (trackSlug) => courses[trackSlug] || null;
export const getStructuredCourseSections = (trackSlug) => getStructuredCourse(trackSlug)?.sections;
export const getStructuredCourseArticles = (trackSlug) => getStructuredCourse(trackSlug)?.articles;
