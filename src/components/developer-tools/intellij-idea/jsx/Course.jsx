import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsIntellijIdeaCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-intellij-idea"><CoursePage module={module} track={getTrack(module, "intellij-idea")} navigate={navigate} /></div>; }
