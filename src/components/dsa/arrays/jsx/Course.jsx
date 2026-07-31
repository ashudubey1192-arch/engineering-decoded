import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaArraysCourse({ navigate }) { const module = getModule("dsa"); return <div className="course-dsa-arrays"><CoursePage module={module} track={getTrack(module, "arrays")} navigate={navigate} /></div>; }
