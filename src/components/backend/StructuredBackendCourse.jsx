import StructuredCoursePage from "../learning/StructuredCoursePage";
import { getModule, getTrack } from "../../data/catalog";
import { getStructuredCourseSections } from "../../data/structuredCourses";

export default function StructuredBackendCourse({ trackSlug, navigate }) {
  const module = getModule("backend");
  return (
    <StructuredCoursePage
      module={module}
      track={getTrack(module, trackSlug)}
      sections={getStructuredCourseSections(trackSlug)}
      navigate={navigate}
    />
  );
}
