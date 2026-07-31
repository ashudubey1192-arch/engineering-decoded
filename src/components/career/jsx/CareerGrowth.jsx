import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/CareerGrowth.css";
export default function CareerGrowth({ navigate }) {
  return (
    <div className="module-career">
      <ModulePage module={getModule("career")} navigate={navigate} />
    </div>
  );
}
