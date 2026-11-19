import CoreJavaLesson from "../../../../jsx/CoreJavaLesson";
import section from "../../../../../../../data/coreJava/sections/15-concurrency.js";
import outputs from "../../../../../../../data/coreJava/outputs/concurrency.json";

export default function Article() {
  return <CoreJavaLesson section={section} slug="concurrency--lock-and-reentrantlock" output={outputs["concurrency--lock-and-reentrantlock"]} />;
}
