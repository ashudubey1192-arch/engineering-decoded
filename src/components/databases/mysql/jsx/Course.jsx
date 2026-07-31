import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesMysqlCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-mysql">
      <CoursePage module={module} track={getTrack(module, "mysql")} navigate={navigate} />
    </div>
  );
}
