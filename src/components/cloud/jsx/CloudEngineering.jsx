import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/CloudEngineering.css";
export default function CloudEngineering({ navigate }) { return <div className="module-cloud"><ModulePage module={getModule("cloud")} navigate={navigate} /></div>; }
