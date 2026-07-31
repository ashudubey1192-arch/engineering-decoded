import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesWeaviateCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-weaviate"><CoursePage module={module} track={getTrack(module, "weaviate")} navigate={navigate} /></div>; }
