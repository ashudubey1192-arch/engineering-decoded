import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesTransactionsCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-transactions"><CoursePage module={module} track={getTrack(module, "transactions")} navigate={navigate} /></div>; }
