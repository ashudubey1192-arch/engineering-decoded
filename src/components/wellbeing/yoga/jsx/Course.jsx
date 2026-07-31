import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function WellbeingYogaCourse({ navigate }) { const module = getModule("wellbeing"); return <div className="course-wellbeing-yoga"><CoursePage module={module} track={getTrack(module, "yoga")} navigate={navigate} /></div>; }
