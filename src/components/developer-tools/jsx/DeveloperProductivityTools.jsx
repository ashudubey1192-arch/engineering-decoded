import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DeveloperProductivityTools.css";
export default function DeveloperProductivityTools({ navigate }) {
  return (
    <div className="module-developer-tools">
      <ModulePage module={getModule("developer-tools")} navigate={navigate} />
    </div>
  );
}
