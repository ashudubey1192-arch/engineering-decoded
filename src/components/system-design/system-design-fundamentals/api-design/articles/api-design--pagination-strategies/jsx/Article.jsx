import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/api-design.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["api-design--pagination-strategies"]} />;
}
