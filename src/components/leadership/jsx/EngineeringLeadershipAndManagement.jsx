import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/EngineeringLeadershipAndManagement.css";
export default function EngineeringLeadershipAndManagement({ navigate }) { return <div className="module-leadership"><ModulePage module={getModule("leadership")} navigate={navigate} /></div>; }
