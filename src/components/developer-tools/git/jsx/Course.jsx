import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsGitCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-git"><CoursePage module={module} track={getTrack(module, "git")} navigate={navigate} /></div>; }
