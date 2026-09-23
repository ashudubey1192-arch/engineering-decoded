import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
export default function Course({navigate}){const module=getModule("social-media");return <CoursePage module={module} track={getTrack(module,"substack")} navigate={navigate}/>;}
