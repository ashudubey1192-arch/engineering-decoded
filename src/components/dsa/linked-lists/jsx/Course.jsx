import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DsaLinkedListsCourse({ navigate }) {
  const module = getModule("dsa");
  return (
    <div className="course-dsa-linked-lists">
      <CoursePage module={module} track={getTrack(module, "linked-lists")} navigate={navigate} />
    </div>
  );
}
