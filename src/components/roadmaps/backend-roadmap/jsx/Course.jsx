import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function RoadmapsBackendRoadmapCourse({ navigate }) {
  const module = getModule("roadmaps");
  return (
    <div className="course-roadmaps-backend-roadmap">
      <CoursePage module={module} track={getTrack(module, "backend-roadmap")} navigate={navigate} />
    </div>
  );
}
