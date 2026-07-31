import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingEventStreamingCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-event-streaming"><CoursePage module={module} track={getTrack(module, "event-streaming")} navigate={navigate} /></div>; }
