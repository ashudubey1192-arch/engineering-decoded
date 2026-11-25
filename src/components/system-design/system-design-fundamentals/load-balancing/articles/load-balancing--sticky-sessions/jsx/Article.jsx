import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/load-balancing.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["load-balancing--sticky-sessions"]} />;
}
