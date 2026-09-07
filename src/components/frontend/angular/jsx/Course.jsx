import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { angularSections } from "../../../../data/angular";
import "../css/Course.css";
export default function AngularCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "angular")}
      sections={angularSections}
      navigate={navigate}
    />
  );
}
