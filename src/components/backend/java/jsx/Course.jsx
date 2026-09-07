import StructuredCoursePage from "../../../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import { javaSections } from "../../../../data/java";
import "../css/Course.css";
export default function JavaCourse({ navigate }) {
  const module = getModule("backend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, "java")}
      sections={javaSections}
      navigate={navigate}
    />
  );
}
