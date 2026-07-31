import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsReactInterviewCourse({ navigate }) { const module = getModule("interviews"); return <div className="course-interviews-react-interview"><CoursePage module={module} track={getTrack(module, "react-interview")} navigate={navigate} /></div>; }
