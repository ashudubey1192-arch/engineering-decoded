import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsMicrosoftOfficeCourse({ navigate }) {
  const module = getModule("misc-tools");
  return (
    <div className="course-misc-tools-microsoft-office">
      <CoursePage
        module={module}
        track={getTrack(module, "microsoft-office")}
        navigate={navigate}
      />
    </div>
  );
}
