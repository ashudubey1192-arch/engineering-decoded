import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureLoadBalancingCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <div className="course-architecture-load-balancing">
      <CoursePage module={module} track={getTrack(module, "load-balancing")} navigate={navigate} />
    </div>
  );
}
