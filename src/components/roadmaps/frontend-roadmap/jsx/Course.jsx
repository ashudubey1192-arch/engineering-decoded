import ReferenceRoadmap from "../../ReferenceRoadmap";
import { frontendRoadmap } from "../../../../data/frontendRoadmap";

export default function FrontendRoadmapCourse({ navigate }) {
  return <ReferenceRoadmap roadmap={frontendRoadmap} navigate={navigate} />;
}
