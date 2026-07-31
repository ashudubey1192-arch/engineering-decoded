import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MarketingSeoCourse({ navigate }) { const module = getModule("marketing"); return <div className="course-marketing-seo"><CoursePage module={module} track={getTrack(module, "seo")} navigate={navigate} /></div>; }
