import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function CommunicationCorporateVocabularyCourse({ navigate }) {
  const module = getModule("communication");
  return (
    <div className="course-communication-corporate-vocabulary">
      <CoursePage
        module={module}
        track={getTrack(module, "corporate-vocabulary")}
        navigate={navigate}
      />
    </div>
  );
}
