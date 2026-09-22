import WebLesson from "../WebLesson";
import { htmlLessons } from "../../../data/htmlLessons.js";

export default function CourseLesson({ slug }) {
  return <WebLesson course="HTML" slug={slug} content={htmlLessons[slug]} />;
}
