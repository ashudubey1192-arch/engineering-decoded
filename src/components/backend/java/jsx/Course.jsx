import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function JavaCourse({navigate}){const module=getModule("backend");return <div className="javaCourse"><CoursePage module={module} track={getTrack(module,"java")} navigate={navigate}/></div>}
