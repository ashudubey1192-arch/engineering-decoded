import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { highLevelDesignSections } from "../../../../data/highLevelDesign";
import "../css/Course.css";
export default function HighLevelDesignCourse({ navigate }) {
  const module = getModule("architecture");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "high-level-design")}
      sections={highLevelDesignSections}
      navigate={navigate}
    />
  );
}
