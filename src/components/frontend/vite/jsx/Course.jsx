import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendViteCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="course-frontend-vite">
      <CoursePage module={module} track={getTrack(module, "vite")} navigate={navigate} />
    </div>
  );
}
