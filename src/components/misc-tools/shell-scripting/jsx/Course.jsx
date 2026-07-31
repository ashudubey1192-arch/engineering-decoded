import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function MiscToolsShellScriptingCourse({ navigate }) { const module = getModule("misc-tools"); return <div className="course-misc-tools-shell-scripting"><CoursePage module={module} track={getTrack(module, "shell-scripting")} navigate={navigate} /></div>; }
