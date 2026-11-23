// All JavaScript Internals lesson content, keyed by outline slug (see outline.js).
import { executionLessons } from "./lessonsExecution.js";
import { scopeLessons } from "./lessonsScope.js";
import { functionLessons } from "./lessonsFunctions.js";
import { eventLoopLessons } from "./lessonsEventLoop.js";
import { functionalLessons } from "./lessonsFunctional.js";
import { promiseLessons } from "./lessonsPromises.js";
import { asyncLessons } from "./lessonsAsync.js";
import { thisLessons } from "./lessonsThis.js";

export const jsInternalsLessons = {
  ...executionLessons,
  ...scopeLessons,
  ...functionLessons,
  ...eventLoopLessons,
  ...functionalLessons,
  ...promiseLessons,
  ...asyncLessons,
  ...thisLessons,
};
