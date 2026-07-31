import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CareerJobSearchCourse({ navigate }) {
  const module = getModule("career");
  return (
    <div className="course-career-job-search">
      <CoursePage module={module} track={getTrack(module, "job-search")} navigate={navigate} />
    </div>
  );
}
