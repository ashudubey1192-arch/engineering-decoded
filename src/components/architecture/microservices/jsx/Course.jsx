import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function ArchitectureMicroservicesCourse({ navigate }) { const module = getModule("architecture"); return <div className="course-architecture-microservices"><CoursePage module={module} track={getTrack(module, "microservices")} navigate={navigate} /></div>; }
