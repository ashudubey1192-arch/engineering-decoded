import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingWebpackCourse({ navigate }) { const module = getModule("frontend-tooling"); return <div className="course-frontend-tooling-webpack"><CoursePage module={module} track={getTrack(module, "webpack")} navigate={navigate} /></div>; }
