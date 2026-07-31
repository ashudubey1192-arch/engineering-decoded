import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MarketingContentMarketingCourse({ navigate }) {
  const module = getModule("marketing");
  return (
    <div className="course-marketing-content-marketing">
      <CoursePage
        module={module}
        track={getTrack(module, "content-marketing")}
        navigate={navigate}
      />
    </div>
  );
}
