import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsJavaInterviewCourse({ navigate }) { const module = getModule("interviews"); return <div className="course-interviews-java-interview"><CoursePage module={module} track={getTrack(module, "java-interview")} navigate={navigate} /></div>; }
