import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesInfluxdbCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-influxdb"><CoursePage module={module} track={getTrack(module, "influxdb")} navigate={navigate} /></div>; }
