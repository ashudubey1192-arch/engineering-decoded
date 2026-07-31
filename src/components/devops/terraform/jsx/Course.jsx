import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsTerraformCourse({ navigate }) {
  const module = getModule("devops");
  return (
    <div className="course-devops-terraform">
      <CoursePage module={module} track={getTrack(module, "terraform")} navigate={navigate} />
    </div>
  );
}
