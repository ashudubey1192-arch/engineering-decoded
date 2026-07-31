import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendExpressJsCourse({ navigate }) { const module = getModule("backend"); return <div className="course-backend-express-js"><CoursePage module={module} track={getTrack(module, "express-js")} navigate={navigate} /></div>; }
