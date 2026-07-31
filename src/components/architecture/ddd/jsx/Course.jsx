import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureDddCourse({ navigate }) { const module = getModule("architecture"); return <div className="course-architecture-ddd"><CoursePage module={module} track={getTrack(module, "ddd")} navigate={navigate} /></div>; }
