import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsVsCodeCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-vs-code"><CoursePage module={module} track={getTrack(module, "vs-code")} navigate={navigate} /></div>; }
