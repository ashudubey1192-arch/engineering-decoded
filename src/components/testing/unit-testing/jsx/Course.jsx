import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
import "../css/Course.css";
export default function TestingUnitTestingCourse({ navigate }) { const module = getModule("testing"); return <div className="course-testing-unit-testing"><CoursePage module={module} track={getTrack(module, "unit-testing")} navigate={navigate} /></div>; }
