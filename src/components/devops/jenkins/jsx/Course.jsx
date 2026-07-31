import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsJenkinsCourse({ navigate }) {
  const module = getModule("devops");
  return (
    <div className="course-devops-jenkins">
      <CoursePage module={module} track={getTrack(module, "jenkins")} navigate={navigate} />
    </div>
  );
}
