import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsGithubCourse({ navigate }) {
  const module = getModule("developer-tools");
  return (
    <div className="course-developer-tools-github">
      <CoursePage module={module} track={getTrack(module, "github")} navigate={navigate} />
    </div>
  );
}
