import WebLesson from "../WebLesson";
import { cssLessons } from "../../../data/cssLessons.js";

export default function CourseLesson({ slug }) {
  return <WebLesson course="CSS" slug={slug} content={cssLessons[slug]} />;
}
