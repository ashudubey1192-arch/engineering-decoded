import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function RoadmapsFrontendRoadmapCourse({ navigate }) { const module = getModule("roadmaps"); return <div className="course-roadmaps-frontend-roadmap"><CoursePage module={module} track={getTrack(module, "frontend-roadmap")} navigate={navigate} /></div>; }
