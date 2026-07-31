import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendNextJsCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="course-frontend-next-js">
      <CoursePage module={module} track={getTrack(module, "next-js")} navigate={navigate} />
    </div>
  );
}
