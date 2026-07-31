import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationTechnicalWritingCourse({ navigate }) { const module = getModule("communication"); return <div className="course-communication-technical-writing"><CoursePage module={module} track={getTrack(module, "technical-writing")} navigate={navigate} /></div>; }
