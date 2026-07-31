import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationStakeholderCommunicationCourse({ navigate }) { const module = getModule("communication"); return <div className="course-communication-stakeholder-communication"><CoursePage module={module} track={getTrack(module, "stakeholder-communication")} navigate={navigate} /></div>; }
