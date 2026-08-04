import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureHighLevelDesignCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <div className="course-architecture-high-level-design">
      <CoursePage
        module={module}
        track={getTrack(module, "high-level-design")}
        navigate={navigate}
      />
    </div>
  );
}
