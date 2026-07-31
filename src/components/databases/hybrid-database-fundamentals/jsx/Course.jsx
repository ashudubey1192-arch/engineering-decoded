import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesHybridDatabaseFundamentalsCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-hybrid-database-fundamentals"><CoursePage module={module} track={getTrack(module, "hybrid-database-fundamentals")} navigate={navigate} /></div>; }
