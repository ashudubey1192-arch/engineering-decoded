import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MockInterviewsSystemDesignMockInterviewCourse({ navigate }) {
  const module = getModule("mock-interviews");
  return (
    <div className="course-mock-interviews-system-design-mock-interview">
      <CoursePage
        module={module}
        track={getTrack(module, "system-design-mock-interview")}
        navigate={navigate}
      />
    </div>
  );
}
