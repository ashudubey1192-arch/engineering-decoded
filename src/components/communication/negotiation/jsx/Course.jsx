import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationNegotiationCourse({ navigate }) {
  const module = getModule("communication");
  return (
    <div className="course-communication-negotiation">
      <CoursePage module={module} track={getTrack(module, "negotiation")} navigate={navigate} />
    </div>
  );
}
