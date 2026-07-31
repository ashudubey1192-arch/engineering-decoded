import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendOauthCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-oauth"><CoursePage module={module} track={getTrack(module, "oauth")} navigate={navigate} /></div>; }
