import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { cleanCodeSections } from "../../../../data/cleanCode";
import "../css/Course.css";

export default function CleanCodeCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "clean-code")}
      sections={cleanCodeSections}
      navigate={navigate}
    />
  );
}
