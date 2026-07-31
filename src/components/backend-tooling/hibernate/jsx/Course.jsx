import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingHibernateCourse({ navigate }) { const module = getModule("backend-tooling"); return <div className="course-backend-tooling-hibernate"><CoursePage module={module} track={getTrack(module, "hibernate")} navigate={navigate} /></div>; }
