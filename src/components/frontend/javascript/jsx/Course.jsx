import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendJavascriptCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="course-frontend-javascript">
      <CoursePage module={module} track={getTrack(module, "javascript")} navigate={navigate} />
    </div>
  );
}
