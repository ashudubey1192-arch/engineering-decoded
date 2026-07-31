import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsGithubActionsCourse({ navigate }) {
  const module = getModule("devops");
  return (
    <div className="course-devops-github-actions">
      <CoursePage module={module} track={getTrack(module, "github-actions")} navigate={navigate} />
    </div>
  );
}
