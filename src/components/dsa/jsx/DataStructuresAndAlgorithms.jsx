import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DataStructuresAndAlgorithms.css";
export default function DataStructuresAndAlgorithms({ navigate }) {
  return (
    <div className="module-dsa">
      <ModulePage module={getModule("dsa")} navigate={navigate} />
    </div>
  );
}
