import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function SpringBootCourse({navigate}){const module=getModule("backend");return <div className="springCourse"><CoursePage module={module} track={getTrack(module,"spring-boot")} navigate={navigate}/></div>}
