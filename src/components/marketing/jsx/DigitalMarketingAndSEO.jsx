import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DigitalMarketingAndSEO.css";
export default function DigitalMarketingAndSEO({ navigate }) {
  return (
    <div className="module-marketing">
      <ModulePage module={getModule("marketing")} navigate={navigate} />
    </div>
  );
}
