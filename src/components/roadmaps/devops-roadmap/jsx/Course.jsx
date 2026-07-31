import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function RoadmapsDevopsRoadmapCourse({ navigate }) {
  const module = getModule("roadmaps");
  return (
    <div className="course-roadmaps-devops-roadmap">
      <CoursePage module={module} track={getTrack(module, "devops-roadmap")} navigate={navigate} />
    </div>
  );
}
