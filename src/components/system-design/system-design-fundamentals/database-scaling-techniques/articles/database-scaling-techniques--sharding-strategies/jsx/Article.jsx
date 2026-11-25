import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/database-scaling-techniques.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["database-scaling-techniques--sharding-strategies"]} />;
}
