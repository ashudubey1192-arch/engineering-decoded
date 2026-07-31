import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesCassandraCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-cassandra">
      <CoursePage module={module} track={getTrack(module, "cassandra")} navigate={navigate} />
    </div>
  );
}
