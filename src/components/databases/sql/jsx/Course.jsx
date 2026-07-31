import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesSqlCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-sql"><CoursePage module={module} track={getTrack(module, "sql")} navigate={navigate} /></div>; }
