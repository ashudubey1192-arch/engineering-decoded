import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendVueCourse({ navigate }) { const module = getModule("frontend"); return <div className="course-frontend-vue"><CoursePage module={module} track={getTrack(module, "vue")} navigate={navigate} /></div>; }
