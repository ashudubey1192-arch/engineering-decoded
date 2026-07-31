import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsConfluenceCourse({ navigate }) { const module = getModule("misc-tools"); return <div className="course-misc-tools-confluence"><CoursePage module={module} track={getTrack(module, "confluence")} navigate={navigate} /></div>; }
