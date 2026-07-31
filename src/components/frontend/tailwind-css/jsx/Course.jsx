import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendTailwindCssCourse({ navigate }) { const module = getModule("frontend"); return <div className="course-frontend-tailwind-css"><CoursePage module={module} track={getTrack(module, "tailwind-css")} navigate={navigate} /></div>; }
