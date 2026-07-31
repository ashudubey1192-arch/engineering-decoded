import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsGitlabCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-gitlab"><CoursePage module={module} track={getTrack(module, "gitlab")} navigate={navigate} /></div>; }
