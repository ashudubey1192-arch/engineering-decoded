import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function VideoCapcutCourse({ navigate }) {
  const module = getModule("video");
  return (
    <div className="course-video-capcut">
      <CoursePage module={module} track={getTrack(module, "capcut")} navigate={navigate} />
    </div>
  );
}
