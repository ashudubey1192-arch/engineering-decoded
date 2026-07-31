import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaBinarySearchCourse({ navigate }) {
  const module = getModule("dsa");
  return (
    <div className="course-dsa-binary-search">
      <CoursePage module={module} track={getTrack(module, "binary-search")} navigate={navigate} />
    </div>
  );
}
