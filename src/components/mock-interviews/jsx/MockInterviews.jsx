import ModulePage from "../../learning/ModulePage";
import { getModule } from "../../../data/catalog";
import "../css/MockInterviews.css";
export default function MockInterviews({ navigate }) {
  return (
    <div className="module-mock-interviews">
      <ModulePage module={getModule("mock-interviews")} navigate={navigate} />
    </div>
  );
}
