import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function WellbeingNutritionCourse({ navigate }) {
  const module = getModule("wellbeing");
  return (
    <div className="course-wellbeing-nutrition">
      <CoursePage module={module} track={getTrack(module, "nutrition")} navigate={navigate} />
    </div>
  );
}
