import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsOpenshiftCourse({ navigate }) { const module = getModule("devops"); return <div className="course-devops-openshift"><CoursePage module={module} track={getTrack(module, "openshift")} navigate={navigate} /></div>; }
