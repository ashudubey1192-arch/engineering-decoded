import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { microservicesSections } from "../../../../data/microservices";
import "../css/Course.css";
export default function ArchitectureMicroservicesCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "microservices")}
      sections={microservicesSections}
      navigate={navigate}
    />
  );
}
