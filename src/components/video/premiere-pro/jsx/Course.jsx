import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function VideoPremiereProCourse({ navigate }) {
  const module = getModule("video");
  return (
    <div className="course-video-premiere-pro">
      <CoursePage module={module} track={getTrack(module, "premiere-pro")} navigate={navigate} />
    </div>
  );
}
