import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesIndexingCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-indexing"><CoursePage module={module} track={getTrack(module, "indexing")} navigate={navigate} /></div>; }
