import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/BackendEngineering.css";
export default function BackendEngineering({ navigate }) { return <div className="module-backend"><ModulePage module={getModule("backend")} navigate={navigate} /></div>; }
