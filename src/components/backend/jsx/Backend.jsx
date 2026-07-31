import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/Backend.css";
export default function Backend({navigate}){return <div className="backendModule"><ModulePage module={getModule("backend")} navigate={navigate}/></div>}
