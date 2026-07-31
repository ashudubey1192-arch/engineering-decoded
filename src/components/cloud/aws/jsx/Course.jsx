import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CloudAwsCourse({ navigate }) { const module = getModule("cloud"); return <div className="course-cloud-aws"><CoursePage module={module} track={getTrack(module, "aws")} navigate={navigate} /></div>; }
