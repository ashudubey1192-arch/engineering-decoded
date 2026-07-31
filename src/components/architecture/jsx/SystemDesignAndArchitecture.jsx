import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/SystemDesignAndArchitecture.css";
export default function SystemDesignAndArchitecture({ navigate }) {
  return (
    <div className="module-architecture">
      <ModulePage module={getModule("architecture")} navigate={navigate} />
    </div>
  );
}
