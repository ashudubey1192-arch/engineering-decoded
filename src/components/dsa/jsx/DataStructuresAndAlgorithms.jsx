import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DataStructuresAndAlgorithms.css";
import DsaProgressPanel from "../DsaProgressPanel.jsx";
import DsaLearningPaths, { DsaRevisionQueue } from "../DsaLearningPaths.jsx";
export default function DataStructuresAndAlgorithms({ navigate }) {
  return (
    <div className="module-dsa">
      <ModulePage module={getModule("dsa")} navigate={navigate} introContent={<><DsaProgressPanel /><DsaLearningPaths /><DsaRevisionQueue /></>} />
    </div>
  );
}
