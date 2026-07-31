import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsLeadershipInterviewCourse({ navigate }) {
  const module = getModule("interviews");
  return (
    <div className="course-interviews-leadership-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "leadership-interview")}
        navigate={navigate}
      />
    </div>
  );
}
