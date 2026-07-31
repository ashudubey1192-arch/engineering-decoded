import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsReactMockInterviewCourse({ navigate }) { const module = getModule("mock-interviews"); return <div className="course-mock-interviews-react-mock-interview"><CoursePage module={module} track={getTrack(module, "react-mock-interview")} navigate={navigate} /></div>; }
