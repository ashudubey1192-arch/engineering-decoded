import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/api-infrastructure.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["api-infrastructure--distributed-rate-limiting"]} />;
}
