import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/FrontendToolsAndLibraries.css";
export default function FrontendToolsAndLibraries({ navigate }) {
  return (
    <div className="module-frontend-tooling">
      <ModulePage module={getModule("frontend-tooling")} navigate={navigate} />
    </div>
  );
}
