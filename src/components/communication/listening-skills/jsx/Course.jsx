import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationListeningSkillsCourse({ navigate }) { const module = getModule("communication"); return <div className="course-communication-listening-skills"><CoursePage module={module} track={getTrack(module, "listening-skills")} navigate={navigate} /></div>; }
