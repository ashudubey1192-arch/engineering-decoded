import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/EngineeringCommunication.css";
export default function EngineeringCommunication({ navigate }) { return <div className="module-communication"><ModulePage module={getModule("communication")} navigate={navigate} /></div>; }
