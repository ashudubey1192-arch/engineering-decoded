import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsOopPatternsCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-oop-patterns"><CoursePage module={module} track={getTrack(module, "oop-patterns")} navigate={navigate} /></div>; }
