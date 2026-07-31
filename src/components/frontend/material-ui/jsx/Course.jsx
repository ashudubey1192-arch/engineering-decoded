import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendMaterialUiCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <div className="course-frontend-material-ui">
      <CoursePage module={module} track={getTrack(module, "material-ui")} navigate={navigate} />
    </div>
  );
}
