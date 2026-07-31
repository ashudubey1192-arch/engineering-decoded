import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesReplicationCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-replication">
      <CoursePage module={module} track={getTrack(module, "replication")} navigate={navigate} />
    </div>
  );
}
