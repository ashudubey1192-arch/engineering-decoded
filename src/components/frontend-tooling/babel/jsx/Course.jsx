import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingBabelCourse({ navigate }) { const module = getModule("frontend-tooling"); return <div className="course-frontend-tooling-babel"><CoursePage module={module} track={getTrack(module, "babel")} navigate={navigate} /></div>; }
