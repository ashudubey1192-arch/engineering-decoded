import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesMongodbCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-mongodb"><CoursePage module={module} track={getTrack(module, "mongodb")} navigate={navigate} /></div>; }
