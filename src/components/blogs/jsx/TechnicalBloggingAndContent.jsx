import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/TechnicalBloggingAndContent.css";
export default function TechnicalBloggingAndContent({ navigate }) { return <div className="module-blogs"><ModulePage module={getModule("blogs")} navigate={navigate} /></div>; }
