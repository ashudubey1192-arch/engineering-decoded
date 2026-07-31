import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/InterviewPreparation.css";
export default function InterviewPreparation({ navigate }) { return <div className="module-interviews"><ModulePage module={getModule("interviews")} navigate={navigate} /></div>; }
