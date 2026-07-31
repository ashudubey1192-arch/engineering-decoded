import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaGreedyCourse({ navigate }) { const module = getModule("dsa"); return <div className="course-dsa-greedy"><CoursePage module={module} track={getTrack(module, "greedy")} navigate={navigate} /></div>; }
