import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function RoadmapsAiEngineerRoadmapCourse({ navigate }) {
  const module = getModule("roadmaps");
  return (
    <div className="course-roadmaps-ai-engineer-roadmap">
      <CoursePage
        module={module}
        track={getTrack(module, "ai-engineer-roadmap")}
        navigate={navigate}
      />
    </div>
  );
}
