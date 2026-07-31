import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiLlmsCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-llms"><CoursePage module={module} track={getTrack(module, "llms")} navigate={navigate} /></div>; }
