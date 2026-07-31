import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/VideoEditingAndContent.css";
export default function VideoEditingAndContent({ navigate }) { return <div className="module-video"><ModulePage module={getModule("video")} navigate={navigate} /></div>; }
