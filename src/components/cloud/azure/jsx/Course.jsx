import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CloudAzureCourse({ navigate }) { const module = getModule("cloud"); return <div className="course-cloud-azure"><CoursePage module={module} track={getTrack(module, "azure")} navigate={navigate} /></div>; }
