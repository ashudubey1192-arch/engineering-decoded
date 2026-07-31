import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendRestApiCourse({ navigate }) {
  const module = getModule("backend");
  return (
    <div className="course-backend-rest-api">
      <CoursePage module={module} track={getTrack(module, "rest-api")} navigate={navigate} />
    </div>
  );
}
