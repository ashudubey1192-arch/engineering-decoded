import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesHtapDatabasesCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-htap-databases">
      <CoursePage module={module} track={getTrack(module, "htap-databases")} navigate={navigate} />
    </div>
  );
}
