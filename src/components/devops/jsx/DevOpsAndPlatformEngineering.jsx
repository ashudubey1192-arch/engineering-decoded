import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DevOpsAndPlatformEngineering.css";
export default function DevOpsAndPlatformEngineering({ navigate }) {
  return (
    <div className="module-devops">
      <ModulePage module={getModule("devops")} navigate={navigate} />
    </div>
  );
}
