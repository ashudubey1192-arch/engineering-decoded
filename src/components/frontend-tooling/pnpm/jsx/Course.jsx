import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingPnpmCourse({ navigate }) { const module = getModule("frontend-tooling"); return <div className="course-frontend-tooling-pnpm"><CoursePage module={module} track={getTrack(module, "pnpm")} navigate={navigate} /></div>; }
