import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingPubSubCourse({ navigate }) { const module = getModule("messaging"); return <div className="course-messaging-pub-sub"><CoursePage module={module} track={getTrack(module, "pub-sub")} navigate={navigate} /></div>; }
