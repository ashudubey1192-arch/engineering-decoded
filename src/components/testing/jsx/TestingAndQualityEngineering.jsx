import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/TestingAndQualityEngineering.css";
export default function TestingAndQualityEngineering({ navigate }) {
  return (
    <div className="module-testing">
      <ModulePage module={getModule("testing")} navigate={navigate} />
    </div>
  );
}
