import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesOracleCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-oracle"><CoursePage module={module} track={getTrack(module, "oracle")} navigate={navigate} /></div>; }
