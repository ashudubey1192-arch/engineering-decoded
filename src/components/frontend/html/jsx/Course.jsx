import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendHtmlCourse({ navigate }) { const module = getModule("frontend"); return <div className="course-frontend-html"><CoursePage module={module} track={getTrack(module, "html")} navigate={navigate} /></div>; }
