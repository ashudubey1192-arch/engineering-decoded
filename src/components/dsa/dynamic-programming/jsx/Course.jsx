import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaDynamicProgrammingCourse({ navigate }) { const module = getModule("dsa"); return <div className="course-dsa-dynamic-programming"><CoursePage module={module} track={getTrack(module, "dynamic-programming")} navigate={navigate} /></div>; }
