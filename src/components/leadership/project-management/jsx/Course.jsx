import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipProjectManagementCourse({ navigate }) {
  const module = getModule("leadership");
  return (
    <div className="course-leadership-project-management">
      <CoursePage
        module={module}
        track={getTrack(module, "project-management")}
        navigate={navigate}
      />
    </div>
  );
}
