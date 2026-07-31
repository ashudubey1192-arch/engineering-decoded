import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaBacktrackingCourse({ navigate }) {
  const module = getModule("dsa");
  return (
    <div className="course-dsa-backtracking">
      <CoursePage module={module} track={getTrack(module, "backtracking")} navigate={navigate} />
    </div>
  );
}
