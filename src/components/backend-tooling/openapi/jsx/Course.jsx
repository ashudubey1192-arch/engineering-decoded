import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendToolingOpenapiCourse({ navigate }) {
  const module = getModule("backend-tooling");
  return (
    <div className="course-backend-tooling-openapi">
      <CoursePage module={module} track={getTrack(module, "openapi")} navigate={navigate} />
    </div>
  );
}
