import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiPromptEngineeringCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-prompt-engineering"><CoursePage module={module} track={getTrack(module, "prompt-engineering")} navigate={navigate} /></div>; }
