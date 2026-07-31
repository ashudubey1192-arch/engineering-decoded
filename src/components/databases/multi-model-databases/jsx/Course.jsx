import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesMultiModelDatabasesCourse({ navigate }) {
  const module = getModule("databases");
  return (
    <div className="course-databases-multi-model-databases">
      <CoursePage
        module={module}
        track={getTrack(module, "multi-model-databases")}
        navigate={navigate}
      />
    </div>
  );
}
