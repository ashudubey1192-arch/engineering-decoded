import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function WellbeingHealthyDeveloperHabitsCourse({ navigate }) {
  const module = getModule("wellbeing");
  return (
    <div className="course-wellbeing-healthy-developer-habits">
      <CoursePage
        module={module}
        track={getTrack(module, "healthy-developer-habits")}
        navigate={navigate}
      />
    </div>
  );
}
