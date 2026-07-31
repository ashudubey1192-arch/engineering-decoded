import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsPowershellCourse({ navigate }) {
  const module = getModule("misc-tools");
  return (
    <div className="course-misc-tools-powershell">
      <CoursePage module={module} track={getTrack(module, "powershell")} navigate={navigate} />
    </div>
  );
}
