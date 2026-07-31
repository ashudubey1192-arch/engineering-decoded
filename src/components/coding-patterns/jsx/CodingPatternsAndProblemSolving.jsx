import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/CodingPatternsAndProblemSolving.css";
export default function CodingPatternsAndProblemSolving({ navigate }) { return <div className="module-coding-patterns"><ModulePage module={getModule("coding-patterns")} navigate={navigate} /></div>; }
