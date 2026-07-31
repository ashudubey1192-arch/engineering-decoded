import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function TestingPlaywrightCourse({ navigate }) { const module = getModule("testing"); return <div className="course-testing-playwright"><CoursePage module={module} track={getTrack(module, "playwright")} navigate={navigate} /></div>; }
