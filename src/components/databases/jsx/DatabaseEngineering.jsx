import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DatabaseEngineering.css";
export default function DatabaseEngineering({ navigate }) {
  return (
    <div className="module-databases">
      <ModulePage module={getModule("databases")} navigate={navigate} />
    </div>
  );
}
