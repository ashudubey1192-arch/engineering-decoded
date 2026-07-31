import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureDesignPatternsCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <div className="course-architecture-design-patterns">
      <CoursePage module={module} track={getTrack(module, "design-patterns")} navigate={navigate} />
    </div>
  );
}
