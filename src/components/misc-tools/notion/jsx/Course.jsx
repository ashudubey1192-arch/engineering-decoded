import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsNotionCourse({ navigate }) {
  const module = getModule("misc-tools");
  return (
    <div className="course-misc-tools-notion">
      <CoursePage module={module} track={getTrack(module, "notion")} navigate={navigate} />
    </div>
  );
}
