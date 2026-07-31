import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendTypescriptCourse({ navigate }) { const module = getModule("frontend"); return <div className="course-frontend-typescript"><CoursePage module={module} track={getTrack(module, "typescript")} navigate={navigate} /></div>; }
