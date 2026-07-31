import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiDataScienceCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-data-science"><CoursePage module={module} track={getTrack(module, "data-science")} navigate={navigate} /></div>; }
