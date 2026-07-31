import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipJiraCourse({ navigate }) {
  const module = getModule("leadership");
  return (
    <div className="course-leadership-jira">
      <CoursePage module={module} track={getTrack(module, "jira")} navigate={navigate} />
    </div>
  );
}
