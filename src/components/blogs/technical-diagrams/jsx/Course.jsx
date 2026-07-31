import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function BlogsTechnicalDiagramsCourse({ navigate }) {
  const module = getModule("blogs");
  return (
    <div className="course-blogs-technical-diagrams">
      <CoursePage
        module={module}
        track={getTrack(module, "technical-diagrams")}
        navigate={navigate}
      />
    </div>
  );
}
