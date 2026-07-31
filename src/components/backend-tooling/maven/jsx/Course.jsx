import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingMavenCourse({ navigate }) {
  const module = getModule("backend-tooling");
  return (
    <div className="course-backend-tooling-maven">
      <CoursePage module={module} track={getTrack(module, "maven")} navigate={navigate} />
    </div>
  );
}
