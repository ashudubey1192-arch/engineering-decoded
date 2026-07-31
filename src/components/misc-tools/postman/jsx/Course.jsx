import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsPostmanCourse({ navigate }) {
  const module = getModule("misc-tools");
  return (
    <div className="course-misc-tools-postman">
      <CoursePage module={module} track={getTrack(module, "postman")} navigate={navigate} />
    </div>
  );
}
