import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/networking.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["networking--nat-and-private-networks"]} />;
}
