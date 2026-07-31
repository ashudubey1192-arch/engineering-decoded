import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipEngineeringManagementCourse({ navigate }) {
  const module = getModule("leadership");
  return (
    <div className="course-leadership-engineering-management">
      <CoursePage
        module={module}
        track={getTrack(module, "engineering-management")}
        navigate={navigate}
      />
    </div>
  );
}
