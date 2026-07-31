import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsNewsletterCourse({ navigate }) { const module = getModule("blogs"); return <div className="course-blogs-newsletter"><CoursePage module={module} track={getTrack(module, "newsletter")} navigate={navigate} /></div>; }
