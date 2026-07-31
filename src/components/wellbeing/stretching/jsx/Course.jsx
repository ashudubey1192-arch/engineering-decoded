import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function WellbeingStretchingCourse({ navigate }) { const module = getModule("wellbeing"); return <div className="course-wellbeing-stretching"><CoursePage module={module} track={getTrack(module, "stretching")} navigate={navigate} /></div>; }
