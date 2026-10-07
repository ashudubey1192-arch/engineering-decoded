import ReferenceRoadmap from "../../ReferenceRoadmap";
import { backendRoadmap } from "../../../../data/backendRoadmap";

export default function BackendRoadmapCourse({ navigate }) {
  return <ReferenceRoadmap roadmap={backendRoadmap} navigate={navigate} />;
}
