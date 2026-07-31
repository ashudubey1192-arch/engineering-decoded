import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsContentPlanningCourse({ navigate }) {
  const module = getModule("blogs");
  return (
    <div className="course-blogs-content-planning">
      <CoursePage
        module={module}
        track={getTrack(module, "content-planning")}
        navigate={navigate}
      />
    </div>
  );
}
