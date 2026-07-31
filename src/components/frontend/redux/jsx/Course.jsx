import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendReduxCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="course-frontend-redux">
      <CoursePage module={module} track={getTrack(module, "redux")} navigate={navigate} />
    </div>
  );
}
