import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsBehavioralInterviewCourse({ navigate }) {
  const module = getModule("interviews");
  return (
    <div className="course-interviews-behavioral-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "behavioral-interview")}
        navigate={navigate}
      />
    </div>
  );
}
