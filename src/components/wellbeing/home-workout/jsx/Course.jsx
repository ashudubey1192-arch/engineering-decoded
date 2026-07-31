import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function WellbeingHomeWorkoutCourse({ navigate }) { const module = getModule("wellbeing"); return <div className="course-wellbeing-home-workout"><CoursePage module={module} track={getTrack(module, "home-workout")} navigate={navigate} /></div>; }
