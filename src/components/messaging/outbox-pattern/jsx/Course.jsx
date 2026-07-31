import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingOutboxPatternCourse({ navigate }) {
  const module = getModule("messaging");
  return (
    <div className="course-messaging-outbox-pattern">
      <CoursePage module={module} track={getTrack(module, "outbox-pattern")} navigate={navigate} />
    </div>
  );
}
