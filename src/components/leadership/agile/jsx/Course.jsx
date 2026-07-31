import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipAgileCourse({ navigate }) {
  const module = getModule("leadership");
  return (
    <div className="course-leadership-agile">
      <CoursePage module={module} track={getTrack(module, "agile")} navigate={navigate} />
    </div>
  );
}
