import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesMilvusCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-milvus"><CoursePage module={module} track={getTrack(module, "milvus")} navigate={navigate} /></div>; }
