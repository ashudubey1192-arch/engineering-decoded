import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingEslintCourse({ navigate }) {
  const module = getModule("frontend-tooling");
  return (
    <div className="course-frontend-tooling-eslint">
      <CoursePage module={module} track={getTrack(module, "eslint")} navigate={navigate} />
    </div>
  );
}
