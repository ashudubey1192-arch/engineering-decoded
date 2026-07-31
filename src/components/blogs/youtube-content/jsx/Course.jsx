import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsYoutubeContentCourse({ navigate }) { const module = getModule("blogs"); return <div className="course-blogs-youtube-content"><CoursePage module={module} track={getTrack(module, "youtube-content")} navigate={navigate} /></div>; }
