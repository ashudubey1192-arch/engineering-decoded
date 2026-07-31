import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingGradleCourse({ navigate }) {
  const module = getModule("backend-tooling");
  return (
    <div className="course-backend-tooling-gradle">
      <CoursePage module={module} track={getTrack(module, "gradle")} navigate={navigate} />
    </div>
  );
}
