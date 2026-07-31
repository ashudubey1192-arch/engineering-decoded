import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesChromaCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-chroma">
      <CoursePage module={module} track={getTrack(module, "chroma")} navigate={navigate} />
    </div>
  );
}
