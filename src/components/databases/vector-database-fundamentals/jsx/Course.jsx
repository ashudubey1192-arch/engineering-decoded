import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesVectorDatabaseFundamentalsCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-vector-database-fundamentals">
      <CoursePage
        module={module}
        track={getTrack(module, "vector-database-fundamentals")}
        navigate={navigate}
      />
    </div>
  );
}
