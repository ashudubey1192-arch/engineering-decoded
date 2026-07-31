import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsAiCodingToolsCourse({ navigate }) { const module = getModule("developer-tools"); return <div className="course-developer-tools-ai-coding-tools"><CoursePage module={module} track={getTrack(module, "ai-coding-tools")} navigate={navigate} /></div>; }
