import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureLowLevelDesignCourse({ navigate }) { const module = getModule("architecture"); return <div className="course-architecture-low-level-design"><CoursePage module={module} track={getTrack(module, "low-level-design")} navigate={navigate} /></div>; }
