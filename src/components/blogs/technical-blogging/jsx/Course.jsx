import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsTechnicalBloggingCourse({ navigate }) { const module = getModule("blogs"); return <div className="course-blogs-technical-blogging"><CoursePage module={module} track={getTrack(module, "technical-blogging")} navigate={navigate} /></div>; }
