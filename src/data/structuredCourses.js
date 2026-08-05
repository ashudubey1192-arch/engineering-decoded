import {
  systemDesignFundamentalsArticles,
  systemDesignFundamentalsSections,
} from "./systemDesignFundamentals";
import { highLevelDesignArticles, highLevelDesignSections } from "./highLevelDesign";
import { lowLevelDesignArticles, lowLevelDesignSections } from "./lowLevelDesign";

const courses = {
  "system-design-fundamentals": {
    sections: systemDesignFundamentalsSections,
    articles: systemDesignFundamentalsArticles,
  },
  "high-level-design": { sections: highLevelDesignSections, articles: highLevelDesignArticles },
  "low-level-design": { sections: lowLevelDesignSections, articles: lowLevelDesignArticles },
};

export const getStructuredCourse = (trackSlug) => courses[trackSlug] || null;
export const getStructuredCourseSections = (trackSlug) => getStructuredCourse(trackSlug)?.sections;
export const getStructuredCourseArticles = (trackSlug) => getStructuredCourse(trackSlug)?.articles;
