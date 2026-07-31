import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureSystemDesignCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <div className="course-architecture-system-design">
      <CoursePage module={module} track={getTrack(module, "system-design")} navigate={navigate} />
    </div>
  );
}
