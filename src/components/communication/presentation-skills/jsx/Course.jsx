import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationPresentationSkillsCourse({ navigate }) { const module = getModule("communication"); return <div className="course-communication-presentation-skills"><CoursePage module={module} track={getTrack(module, "presentation-skills")} navigate={navigate} /></div>; }
