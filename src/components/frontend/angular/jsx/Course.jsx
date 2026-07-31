import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function AngularCourse({navigate}){const module=getModule("frontend");return <div className="angularCourse"><CoursePage module={module} track={getTrack(module,"angular")} navigate={navigate}/></div>}
