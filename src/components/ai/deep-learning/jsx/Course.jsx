import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiDeepLearningCourse({ navigate }) { const module = getModule("ai"); return <div className="course-ai-deep-learning"><CoursePage module={module} track={getTrack(module, "deep-learning")} navigate={navigate} /></div>; }
