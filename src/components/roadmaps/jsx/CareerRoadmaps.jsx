import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/CareerRoadmaps.css";
export default function CareerRoadmaps({ navigate }) {
  return (
    <div className="module-roadmaps">
      <ModulePage module={getModule("roadmaps")} navigate={navigate} />
    </div>
  );
}
