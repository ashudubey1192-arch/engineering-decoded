import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/common-building-blocks.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["common-building-blocks--distributed-counters"]} />;
}
