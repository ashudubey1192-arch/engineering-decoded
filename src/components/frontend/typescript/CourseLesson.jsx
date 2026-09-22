import WebLesson from "../WebLesson";
import { typescriptLessons } from "../../../data/typescriptLessons.js";

export default function CourseLesson({ slug }) {
  return <WebLesson course="TypeScript" slug={slug} content={typescriptLessons[slug]} />;
}
