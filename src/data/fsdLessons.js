// Frontend System Design lesson content, keyed by article slug.
import { networkingLessons } from "./fsdLessonsNetworking.js";
import { securityLessons } from "./fsdLessonsSecurity.js";
import { testingLessons } from "./fsdLessonsTesting.js";
import { performanceLessons } from "./fsdLessonsPerformance.js";
import { dataLessons } from "./fsdLessonsData.js";
import { operationsLessons } from "./fsdLessonsOperations.js";
import { designLessons } from "./fsdLessonsDesign.js";
import { architectureLessons } from "./fsdLessonsArchitecture.js";
import { browserLessons } from "./fsdLessonsBrowser.js";

export const frontendSystemDesignLessons = {
  ...networkingLessons,
  ...securityLessons,
  ...testingLessons,
  ...performanceLessons,
  ...dataLessons,
  ...operationsLessons,
  ...designLessons,
  ...architectureLessons,
  ...browserLessons,
};
