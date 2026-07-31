import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CareerResumeBuilderCourse({ navigate }) {
  const module = getModule("career");
  return (
    <div className="course-career-resume-builder">
      <CoursePage module={module} track={getTrack(module, "resume-builder")} navigate={navigate} />
    </div>
  );
}
