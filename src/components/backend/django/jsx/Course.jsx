import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendDjangoCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-django"><CoursePage module={module} track={getTrack(module, "django")} navigate={navigate} /></div>; }
