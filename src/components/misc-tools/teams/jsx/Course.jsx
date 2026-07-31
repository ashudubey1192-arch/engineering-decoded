import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsTeamsCourse({ navigate }) {
  const module = getModule("misc-tools");
  return (
    <div className="course-misc-tools-teams">
      <CoursePage module={module} track={getTrack(module, "teams")} navigate={navigate} />
    </div>
  );
}
