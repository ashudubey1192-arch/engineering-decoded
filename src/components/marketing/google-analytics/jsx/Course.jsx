import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MarketingGoogleAnalyticsCourse({ navigate }) {
  const module = getModule("marketing");
  return (
    <div className="course-marketing-google-analytics">
      <CoursePage
        module={module}
        track={getTrack(module, "google-analytics")}
        navigate={navigate}
      />
    </div>
  );
}
