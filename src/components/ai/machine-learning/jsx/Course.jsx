import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AiMachineLearningCourse({ navigate }) {
  const module = getModule("ai");
  return (
    <div className="course-ai-machine-learning">
      <CoursePage
        module={module}
        track={getTrack(module, "machine-learning")}
        navigate={navigate}
      />
    </div>
  );
}
