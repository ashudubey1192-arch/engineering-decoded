import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiAiAgentsCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-ai-agents"><CoursePage module={module} track={getTrack(module, "ai-agents")} navigate={navigate} /></div>; }
