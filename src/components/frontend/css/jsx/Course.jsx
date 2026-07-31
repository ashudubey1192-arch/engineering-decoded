import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendCssCourse({ navigate }) { const module = getModule("frontend"); return <div className="course-frontend-css"><CoursePage module={module} track={getTrack(module, "css")} navigate={navigate} /></div>; }
