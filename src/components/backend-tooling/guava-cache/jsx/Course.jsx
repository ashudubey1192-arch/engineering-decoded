import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingGuavaCacheCourse({ navigate }) {
  const module = getModule("backend-tooling");
  return (
    <div className="course-backend-tooling-guava-cache">
      <CoursePage module={module} track={getTrack(module, "guava-cache")} navigate={navigate} />
    </div>
  );
}
