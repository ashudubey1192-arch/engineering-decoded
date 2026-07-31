import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function LeadershipTeamLeadershipCourse({ navigate }) { const module = getModule("leadership"); return <div className="course-leadership-team-leadership"><CoursePage module={module} track={getTrack(module, "team-leadership")} navigate={navigate} /></div>; }
