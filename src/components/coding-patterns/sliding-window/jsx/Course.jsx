import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsSlidingWindowCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-sliding-window"><CoursePage module={module} track={getTrack(module, "sliding-window")} navigate={navigate} /></div>; }
