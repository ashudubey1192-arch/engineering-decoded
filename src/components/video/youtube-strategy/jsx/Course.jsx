import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function VideoYoutubeStrategyCourse({ navigate }) {
  const module = getModule("video");
  return (
    <div className="course-video-youtube-strategy">
      <CoursePage
        module={module}
        track={getTrack(module, "youtube-strategy")}
        navigate={navigate}
      />
    </div>
  );
}
