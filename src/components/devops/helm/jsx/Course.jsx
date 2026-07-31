import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsHelmCourse({ navigate }) {
  const module = getModule("devops");
  return (
    <div className="course-devops-helm">
      <CoursePage module={module} track={getTrack(module, "helm")} navigate={navigate} />
    </div>
  );
}
