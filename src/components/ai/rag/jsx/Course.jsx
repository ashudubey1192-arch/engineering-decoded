import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiRagCourse({ navigate }) {
  const module = getModule("ai");
  return (
    <div className="course-ai-rag">
      <CoursePage module={module} track={getTrack(module, "rag")} navigate={navigate} />
    </div>
  );
}
