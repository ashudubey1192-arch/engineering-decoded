import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendGraphqlCourse({ navigate }) {
  const module = getModule("backend");
  return (
    <div className="course-backend-graphql">
      <CoursePage module={module} track={getTrack(module, "graphql")} navigate={navigate} />
    </div>
  );
}
