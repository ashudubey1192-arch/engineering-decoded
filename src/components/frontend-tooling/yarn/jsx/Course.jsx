import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingYarnCourse({ navigate }) { const module = getModule("frontend-tooling"); return <div className="course-frontend-tooling-yarn"><CoursePage module={module} track={getTrack(module, "yarn")} navigate={navigate} /></div>; }
