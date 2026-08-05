import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { dddSections } from "../../../../data/ddd";
import "../css/Course.css";
export default function ArchitectureDddCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage module={module} track={getTrack(module, "ddd")} sections={dddSections} navigate={navigate} />
  );
}
