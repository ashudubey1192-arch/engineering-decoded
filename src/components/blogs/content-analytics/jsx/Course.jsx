import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsContentAnalyticsCourse({ navigate }) { const module = getModule("blogs"); return <div className="course-blogs-content-analytics"><CoursePage module={module} track={getTrack(module, "content-analytics")} navigate={navigate} /></div>; }
