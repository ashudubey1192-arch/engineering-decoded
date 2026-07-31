import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsEclipseCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-eclipse"><CoursePage module={module} track={getTrack(module, "eclipse")} navigate={navigate} /></div>; }
