import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BackendNodeJsCourse({ navigate }) {
  const module = getModule("backend");
  return (
    <div className="course-backend-node-js">
      <CoursePage module={module} track={getTrack(module, "node-js")} navigate={navigate} />
    </div>
  );
}
