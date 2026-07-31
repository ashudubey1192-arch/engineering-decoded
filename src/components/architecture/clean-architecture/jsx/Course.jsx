import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureCleanArchitectureCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <div className="course-architecture-clean-architecture">
      <CoursePage
        module={module}
        track={getTrack(module, "clean-architecture")}
        navigate={navigate}
      />
    </div>
  );
}
