import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/resilience-patterns.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["resilience-patterns--timeouts-and-deadlines"]} />;
}
