import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/DeveloperWellbeing.css";
export default function DeveloperWellbeing({ navigate }) { return <div className="module-wellbeing"><ModulePage module={getModule("wellbeing")} navigate={navigate} /></div>; }
