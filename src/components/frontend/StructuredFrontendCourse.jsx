import StructuredCoursePage from "../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../data/catalog";
import { getStructuredCourseSections } from "../../data/structuredCourses";

export default function StructuredFrontendCourse({ trackSlug, navigate }) {
  const module = getModule("frontend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, trackSlug)}
      sections={getStructuredCourseSections("frontend", trackSlug)}
      navigate={navigate}
    />
  );
}
