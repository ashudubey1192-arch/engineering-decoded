import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { reactSections } from "../../../../data/react";
import "../css/Course.css";
export default function ReactCourse({ navigate }) {
  const module = getModule("frontend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "react")}
      sections={reactSections}
      navigate={navigate}
    />
  );
}
