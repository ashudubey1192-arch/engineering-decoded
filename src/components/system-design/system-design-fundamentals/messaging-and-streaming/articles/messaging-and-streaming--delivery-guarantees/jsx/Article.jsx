import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/messaging-and-streaming.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["messaging-and-streaming--delivery-guarantees"]} />;
}
