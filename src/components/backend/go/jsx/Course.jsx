import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendGoCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-go"><CoursePage module={module} track={getTrack(module, "go")} navigate={navigate} /></div>; }
