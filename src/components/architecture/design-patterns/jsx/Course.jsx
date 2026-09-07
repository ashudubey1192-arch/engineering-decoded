import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { designPatternsSections } from "../../../../data/designPatterns";
import "../css/Course.css";
export default function ArchitectureDesignPatternsCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage module={module} track={getTrack(module, "design-patterns")} sections={designPatternsSections} navigate={navigate} />
  );
}
