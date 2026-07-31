import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DeveloperToolsBrowserDevtoolsCourse({ navigate }) {
  const module = getModule("developer-tools");
  return (
    <div className="course-developer-tools-browser-devtools">
      <CoursePage
        module={module}
        track={getTrack(module, "browser-devtools")}
        navigate={navigate}
      />
    </div>
  );
}
