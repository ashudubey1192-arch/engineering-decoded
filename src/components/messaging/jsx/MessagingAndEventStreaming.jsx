import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/MessagingAndEventStreaming.css";
export default function MessagingAndEventStreaming({ navigate }) {
  return (
    <div className="module-messaging">
      <ModulePage module={getModule("messaging")} navigate={navigate} />
    </div>
  );
}
