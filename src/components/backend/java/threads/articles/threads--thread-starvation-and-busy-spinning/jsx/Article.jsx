import CoreJavaLesson from "../../../../jsx/CoreJavaLesson";
import section from "../../../../../../../data/coreJava/sections/14-threads.js";
import outputs from "../../../../../../../data/coreJava/outputs/threads.json";

export default function Article() {
  return <CoreJavaLesson section={section} slug="threads--thread-starvation-and-busy-spinning" output={outputs["threads--thread-starvation-and-busy-spinning"]} />;
}
