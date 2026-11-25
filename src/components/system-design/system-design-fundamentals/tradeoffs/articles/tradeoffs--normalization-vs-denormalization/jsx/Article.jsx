import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/tradeoffs.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["tradeoffs--normalization-vs-denormalization"]} />;
}
