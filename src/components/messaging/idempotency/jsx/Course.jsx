import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingIdempotencyCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-idempotency"><CoursePage module={module} track={getTrack(module, "idempotency")} navigate={navigate} /></div>; }
