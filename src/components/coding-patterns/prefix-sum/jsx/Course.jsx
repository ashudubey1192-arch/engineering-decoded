import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsPrefixSumCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-prefix-sum"><CoursePage module={module} track={getTrack(module, "prefix-sum")} navigate={navigate} /></div>; }
