import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingCaffeineCourse({ navigate }) { const module = getModule("backend-tooling"); return <div className="course-backend-tooling-caffeine"><CoursePage module={module} track={getTrack(module, "caffeine")} navigate={navigate} /></div>; }
