import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DevopsKubernetesCourse({ navigate }) { const module = getModule("devops"); return <div className="course-devops-kubernetes"><CoursePage module={module} track={getTrack(module, "kubernetes")} navigate={navigate} /></div>; }
