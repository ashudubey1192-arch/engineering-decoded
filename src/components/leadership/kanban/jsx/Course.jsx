import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipKanbanCourse({ navigate }) {
  const module = getModule("leadership");
  return (
    <div className="course-leadership-kanban">
      <CoursePage module={module} track={getTrack(module, "kanban")} navigate={navigate} />
    </div>
  );
}
