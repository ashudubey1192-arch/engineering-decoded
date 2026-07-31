import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CodingPatternsConcurrencyPatternsCourse({ navigate }) { const module = getModule("coding-patterns"); return <div className="course-coding-patterns-concurrency-patterns"><CoursePage module={module} track={getTrack(module, "concurrency-patterns")} navigate={navigate} /></div>; }
