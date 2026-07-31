import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipScrumCourse({ navigate }) { const module = getModule("leadership"); return <div className="course-leadership-scrum"><CoursePage module={module} track={getTrack(module, "scrum")} navigate={navigate} /></div>; }
