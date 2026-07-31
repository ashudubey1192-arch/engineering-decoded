import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/FrontendEngineering.css";
export default function FrontendEngineering({ navigate }) {
  return (
    <div className="module-frontend">
      <ModulePage module={getModule("frontend")} navigate={navigate} />
    </div>
  );
}
