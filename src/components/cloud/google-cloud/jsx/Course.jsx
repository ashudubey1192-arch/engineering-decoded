import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CloudGoogleCloudCourse({ navigate }) { const module = getModule("cloud"); return <div className="course-cloud-google-cloud"><CoursePage module={module} track={getTrack(module, "google-cloud")} navigate={navigate} /></div>; }
