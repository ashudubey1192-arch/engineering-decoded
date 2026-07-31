import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsHrInterviewCourse({ navigate }) { const module = getModule("interviews"); return <div className="course-interviews-hr-interview"><CoursePage module={module} track={getTrack(module, "hr-interview")} navigate={navigate} /></div>; }
