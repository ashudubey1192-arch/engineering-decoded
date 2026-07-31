import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesDistributedSqlCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-distributed-sql"><CoursePage module={module} track={getTrack(module, "distributed-sql")} navigate={navigate} /></div>; }
