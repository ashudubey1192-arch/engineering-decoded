import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingSolaceCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-solace"><CoursePage module={module} track={getTrack(module, "solace")} navigate={navigate} /></div>; }
