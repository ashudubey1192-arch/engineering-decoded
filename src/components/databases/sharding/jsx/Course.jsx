import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesShardingCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-sharding"><CoursePage module={module} track={getTrack(module, "sharding")} navigate={navigate} /></div>; }
