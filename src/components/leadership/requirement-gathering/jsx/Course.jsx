import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipRequirementGatheringCourse({ navigate }) { const module = getModule("leadership"); return <div className="course-leadership-requirement-gathering"><CoursePage module={module} track={getTrack(module, "requirement-gathering")} navigate={navigate} /></div>; }
