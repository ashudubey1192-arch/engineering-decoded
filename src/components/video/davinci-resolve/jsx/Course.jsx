import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function VideoDavinciResolveCourse({ navigate }) {
  const module = getModule("video");
  return (
    <div className="course-video-davinci-resolve">
      <CoursePage module={module} track={getTrack(module, "davinci-resolve")} navigate={navigate} />
    </div>
  );
}
