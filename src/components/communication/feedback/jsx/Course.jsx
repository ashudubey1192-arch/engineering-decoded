import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationFeedbackCourse({ navigate }) { const module = getModule("communication"); return <div className="course-communication-feedback"><CoursePage module={module} track={getTrack(module, "feedback")} navigate={navigate} /></div>; }
