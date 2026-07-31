import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingJpaCourse({ navigate }) {
  const module = getModule("backend-tooling");
  return (
    <div className="course-backend-tooling-jpa">
      <CoursePage module={module} track={getTrack(module, "jpa")} navigate={navigate} />
    </div>
  );
}
