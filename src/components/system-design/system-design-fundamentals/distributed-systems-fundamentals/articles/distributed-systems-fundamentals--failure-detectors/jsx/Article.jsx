import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/distributed-systems-fundamentals.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["distributed-systems-fundamentals--failure-detectors"]} />;
}
