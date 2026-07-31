import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function TestingIntegrationTestingCourse({ navigate }) {
  const module = getModule("testing");
  return (
    <div className="course-testing-integration-testing">
      <CoursePage
        module={module}
        track={getTrack(module, "integration-testing")}
        navigate={navigate}
      />
    </div>
  );
}
