import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsRssFeedCourse({ navigate }) { const module = getModule("blogs"); return <div className="course-blogs-rss-feed"><CoursePage module={module} track={getTrack(module, "rss-feed")} navigate={navigate} /></div>; }
