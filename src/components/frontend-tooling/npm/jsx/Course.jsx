import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingNpmCourse({ navigate }) {
  const module = getModule("frontend-tooling");
  return (
    <div className="course-frontend-tooling-npm">
      <CoursePage module={module} track={getTrack(module, "npm")} navigate={navigate} />
    </div>
  );
}
