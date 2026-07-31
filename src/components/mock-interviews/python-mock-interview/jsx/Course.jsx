import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsPythonMockInterviewCourse({ navigate }) { const module = getModule("mock-interviews"); return <div className="course-mock-interviews-python-mock-interview"><CoursePage module={module} track={getTrack(module, "python-mock-interview")} navigate={navigate} /></div>; }
