import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ReactCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="reactCourse">
      <CoursePage module={module} track={getTrack(module, "react")} navigate={navigate} />
    </div>
  );
}
