import CoreJavaLesson from "../../../../jsx/CoreJavaLesson";
import section from "../../../../../../../data/coreJava/sections/11-garbage-collection.js";
import outputs from "../../../../../../../data/coreJava/outputs/garbage-collection.json";

export default function Article() {
  return <CoreJavaLesson section={section} slug="garbage-collection--serial-vs-throughput-gc-default-collectors-and-finding-the-gc-in-use" output={outputs["garbage-collection--serial-vs-throughput-gc-default-collectors-and-finding-the-gc-in-use"]} />;
}
