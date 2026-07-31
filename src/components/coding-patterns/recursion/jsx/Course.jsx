import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsRecursionCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-recursion"><CoursePage module={module} track={getTrack(module, "recursion")} navigate={navigate} /></div>; }
