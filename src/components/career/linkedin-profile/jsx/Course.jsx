import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CareerLinkedinProfileCourse({ navigate }) { const module = getModule("career"); return <div className="course-career-linkedin-profile"><CoursePage module={module} track={getTrack(module, "linkedin-profile")} navigate={navigate} /></div>; }
