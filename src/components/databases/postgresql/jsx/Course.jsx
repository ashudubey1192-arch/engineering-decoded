import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesPostgresqlCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-postgresql"><CoursePage module={module} track={getTrack(module, "postgresql")} navigate={navigate} /></div>; }
