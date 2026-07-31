import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function FrontendToolingStorybookCourse({ navigate }) { const module = getModule("frontend-tooling"); return <div className="course-frontend-tooling-storybook"><CoursePage module={module} track={getTrack(module, "storybook")} navigate={navigate} /></div>; }
