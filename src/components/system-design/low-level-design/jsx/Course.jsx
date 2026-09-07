import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { lowLevelDesignSections } from "../../../../data/lowLevelDesign";
import "../css/Course.css";
export default function LowLevelDesignCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "low-level-design")}
      sections={lowLevelDesignSections}
      navigate={navigate}
    />
  );
}
