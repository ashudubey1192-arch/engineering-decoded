import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsAnsibleCourse({ navigate }) { const module = getModule("devops"); return <div className="course-devops-ansible"><CoursePage module={module} track={getTrack(module, "ansible")} navigate={navigate} /></div>; }
