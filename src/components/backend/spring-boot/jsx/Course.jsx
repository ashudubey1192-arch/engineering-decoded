import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { springBootSections } from "../../../../data/springBoot";
import "../css/Course.css";
export default function SpringBootCourse({ navigate }) {
  const module = getModule("backend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "spring-boot")}
      sections={springBootSections}
      navigate={navigate}
    />
  );
}
