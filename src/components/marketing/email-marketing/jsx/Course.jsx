import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MarketingEmailMarketingCourse({ navigate }) { const module = getModule("marketing"); return <div className="course-marketing-email-marketing"><CoursePage module={module} track={getTrack(module, "email-marketing")} navigate={navigate} /></div>; }
