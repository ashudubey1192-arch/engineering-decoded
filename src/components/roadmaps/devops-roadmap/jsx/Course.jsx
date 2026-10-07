import ReferenceRoadmap from "../../ReferenceRoadmap";
import { devopsRoadmap } from "../../../../data/devopsRoadmap";

export default function DevopsRoadmapCourse({ navigate }) {
  return <ReferenceRoadmap roadmap={devopsRoadmap} navigate={navigate} />;
}
