import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function TestingApiTestingCourse({ navigate }) { const module = getModule("testing"); return <div className="course-testing-api-testing"><CoursePage module={module} track={getTrack(module, "api-testing")} navigate={navigate} /></div>; }
