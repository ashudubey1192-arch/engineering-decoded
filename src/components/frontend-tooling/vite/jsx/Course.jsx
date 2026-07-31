import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingViteCourse({ navigate }) {
  const module = getModule("frontend-tooling");
  return (
    <div className="course-frontend-tooling-vite">
      <CoursePage module={module} track={getTrack(module, "vite")} navigate={navigate} />
    </div>
  );
}
