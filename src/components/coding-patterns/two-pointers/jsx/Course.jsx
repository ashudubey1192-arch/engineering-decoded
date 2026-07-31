import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsTwoPointersCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-two-pointers"><CoursePage module={module} track={getTrack(module, "two-pointers")} navigate={navigate} /></div>; }
