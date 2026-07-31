import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiPythonCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-python"><CoursePage module={module} track={getTrack(module, "python")} navigate={navigate} /></div>; }
