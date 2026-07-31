import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CloudServerlessCourse({ navigate }) {
  const module = getModule("cloud");
  return (
    <div className="course-cloud-serverless">
      <CoursePage module={module} track={getTrack(module, "serverless")} navigate={navigate} />
    </div>
  );
}
