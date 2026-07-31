import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingKafkaCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-kafka"><CoursePage module={module} track={getTrack(module, "kafka")} navigate={navigate} /></div>; }
