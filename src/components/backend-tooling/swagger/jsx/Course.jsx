import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingSwaggerCourse({ navigate }) { const module = getModule("backend-tooling"); return <div className="course-backend-tooling-swagger"><CoursePage module={module} track={getTrack(module, "swagger")} navigate={navigate} /></div>; }
