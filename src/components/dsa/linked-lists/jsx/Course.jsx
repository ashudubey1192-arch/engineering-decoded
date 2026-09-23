import CoursePage from "../../../learning/CoursePage";
import { getModule, getTrack } from "../../../../data/catalog";
export default function Course({ navigate }) {
  const module = getModule("dsa");
  return <CoursePage module={module} track={getTrack(module, "linked-lists")} navigate={navigate} />;
}
