import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/Frontend.css";
export default function Frontend({navigate}){return <div className="frontendModule"><ModulePage module={getModule("frontend")} navigate={navigate}/></div>}
