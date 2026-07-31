import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaGraphsCourse({ navigate }) {
  const module = getModule("dsa");
  return (
    <div className="course-dsa-graphs">
      <CoursePage module={module} track={getTrack(module, "graphs")} navigate={navigate} />
    </div>
  );
}
