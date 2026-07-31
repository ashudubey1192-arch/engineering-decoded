import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaTreesCourse({ navigate }) { const module = getModule("dsa"); return <div className="course-dsa-trees"><CoursePage module={module} track={getTrack(module, "trees")} navigate={navigate} /></div>; }
