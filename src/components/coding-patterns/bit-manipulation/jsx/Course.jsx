import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsBitManipulationCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-bit-manipulation"><CoursePage module={module} track={getTrack(module, "bit-manipulation")} navigate={navigate} /></div>; }
