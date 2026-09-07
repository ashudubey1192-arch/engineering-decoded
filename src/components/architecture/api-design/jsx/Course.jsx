import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { apiDesignSections } from "../../../../data/apiDesign";
import "../css/Course.css";

export default function ApiDesignCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "api-design")}
      sections={apiDesignSections}
      navigate={navigate}
    />
  );
}
