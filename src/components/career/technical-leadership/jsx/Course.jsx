import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CareerTechnicalLeadershipCourse({ navigate }) { const module = getModule("career"); return <div className="course-career-technical-leadership"><CoursePage module={module} track={getTrack(module, "technical-leadership")} navigate={navigate} /></div>; }
