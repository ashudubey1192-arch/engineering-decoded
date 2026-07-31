import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/CollaborationAndMiscellaneousTools.css";
export default function CollaborationAndMiscellaneousTools({ navigate }) { return <div className="module-misc-tools"><ModulePage module={getModule("misc-tools")} navigate={navigate} /></div>; }
