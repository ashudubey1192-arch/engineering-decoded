import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function DatabasesPineconeCourse({ navigate }) { const module = getModule("databases"); return <div className="course-databases-pinecone"><CoursePage module={module} track={getTrack(module, "pinecone")} navigate={navigate} /></div>; }
