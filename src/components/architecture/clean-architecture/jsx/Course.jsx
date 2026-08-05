import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { cleanArchitectureSections } from "../../../../data/cleanArchitecture";
import "../css/Course.css";
export default function ArchitectureCleanArchitectureCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "clean-architecture")}
      sections={cleanArchitectureSections}
      navigate={navigate}
    />
  );
}
