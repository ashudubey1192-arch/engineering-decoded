import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsLeadershipMockInterviewCourse({ navigate }) {
  const module = getModule("mock-interviews");
  return (
    <div className="course-mock-interviews-leadership-mock-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "leadership-mock-interview")}
        navigate={navigate}
      />
    </div>
  );
}
