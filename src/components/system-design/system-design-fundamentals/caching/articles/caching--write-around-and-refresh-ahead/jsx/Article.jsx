import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/caching.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["caching--write-around-and-refresh-ahead"]} />;
}
