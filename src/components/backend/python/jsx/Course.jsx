import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendPythonCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-python"><CoursePage module={module} track={getTrack(module, "python")} navigate={navigate} /></div>; }
