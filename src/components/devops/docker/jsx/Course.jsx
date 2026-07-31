import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsDockerCourse({ navigate }) {
  const module = getModule("devops");
  return (
    <div className="course-devops-docker">
      <CoursePage module={module} track={getTrack(module, "docker")} navigate={navigate} />
    </div>
  );
}
