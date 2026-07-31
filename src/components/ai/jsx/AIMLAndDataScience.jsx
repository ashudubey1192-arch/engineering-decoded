import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/AIMLAndDataScience.css";
export default function AIMLAndDataScience({ navigate }) {
  return (
    <div className="module-ai">
      <ModulePage module={getModule("ai")} navigate={navigate} />
    </div>
  );
}
