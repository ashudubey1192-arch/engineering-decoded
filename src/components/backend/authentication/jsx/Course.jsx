import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendAuthenticationCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-authentication"><CoursePage module={module} track={getTrack(module, "authentication")} navigate={navigate} /></div>; }
