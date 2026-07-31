import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingDeadLetterQueueCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-dead-letter-queue"><CoursePage module={module} track={getTrack(module, "dead-letter-queue")} navigate={navigate} /></div>; }
