import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/BackendToolsAndLibraries.css";
export default function BackendToolsAndLibraries({ navigate }) { return <div className="module-backend-tooling"><ModulePage module={getModule("backend-tooling")} navigate={navigate} /></div>; }
