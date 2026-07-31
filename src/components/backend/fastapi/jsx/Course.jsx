import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendFastapiCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-fastapi"><CoursePage module={module} track={getTrack(module, "fastapi")} navigate={navigate} /></div>; }
