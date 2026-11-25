import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/core-concepts.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["core-concepts--tail-latency-and-percentiles"]} />;
}
