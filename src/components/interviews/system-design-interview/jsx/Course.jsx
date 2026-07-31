import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function InterviewsSystemDesignInterviewCourse({ navigate }) {
  const module = getModule("interviews");
  return (
    <div className="course-interviews-system-design-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "system-design-interview")}
        navigate={navigate}
      />
    </div>
  );
}
