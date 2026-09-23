import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
export default function Course({navigate}) { const module=getModule("coding-patterns"); return <CoursePage module={module} track={getTrack(module,"matrix-and-2d-array")} navigate={navigate} />; }
