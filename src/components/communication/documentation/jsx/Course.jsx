import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationDocumentationCourse({ navigate }) {
  const module = getModule("communication");
  return (
    <div className="course-communication-documentation">
      <CoursePage module={module} track={getTrack(module, "documentation")} navigate={navigate} />
    </div>
  );
}
