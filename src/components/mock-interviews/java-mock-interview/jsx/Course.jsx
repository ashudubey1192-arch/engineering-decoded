import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsJavaMockInterviewCourse({ navigate }) { const module = getModule("mock-interviews"); return <div className="course-mock-interviews-java-mock-interview"><CoursePage module={module} track={getTrack(module, "java-mock-interview")} navigate={navigate} /></div>; }
