import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MessagingRabbitmqCourse({ navigate }) {
  const module = getModule("messaging");
  return (
    <div className="course-messaging-rabbitmq">
      <CoursePage module={module} track={getTrack(module, "rabbitmq")} navigate={navigate} />
    </div>
  );
}
