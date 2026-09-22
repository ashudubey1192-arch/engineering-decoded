import WebLesson from "../WebLesson";
import { javascriptLessons } from "../../../data/javascriptLessons.js";

export default function CourseLesson({ slug }) {
  return <WebLesson course="JavaScript" slug={slug} content={javascriptLessons[slug]} />;
}
