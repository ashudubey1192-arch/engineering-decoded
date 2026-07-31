import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesPartitioningCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-partitioning">
      <CoursePage module={module} track={getTrack(module, "partitioning")} navigate={navigate} />
    </div>
  );
}
