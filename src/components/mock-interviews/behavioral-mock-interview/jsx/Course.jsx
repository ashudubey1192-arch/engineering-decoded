import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsBehavioralMockInterviewCourse({ navigate }) {
  const module = getModule("mock-interviews");
  return (
    <div className="course-mock-interviews-behavioral-mock-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "behavioral-mock-interview")}
        navigate={navigate}
      />
    </div>
  );
}
