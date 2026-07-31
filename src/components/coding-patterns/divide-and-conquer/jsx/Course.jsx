import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsDivideAndConquerCourse({ navigate }) {
  const module = getModule("coding-patterns");
  return (
    <div className="course-coding-patterns-divide-and-conquer">
      <CoursePage
        module={module}
        track={getTrack(module, "divide-and-conquer")}
        navigate={navigate}
      />
    </div>
  );
}
