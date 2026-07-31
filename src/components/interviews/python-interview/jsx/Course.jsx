import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsPythonInterviewCourse({ navigate }) {
  const module = getModule("interviews");
  return (
    <div className="course-interviews-python-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "python-interview")}
        navigate={navigate}
      />
    </div>
  );
}
