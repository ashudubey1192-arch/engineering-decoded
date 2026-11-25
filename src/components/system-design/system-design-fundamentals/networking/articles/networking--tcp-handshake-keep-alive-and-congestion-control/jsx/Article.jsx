import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/networking.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["networking--tcp-handshake-keep-alive-and-congestion-control"]} />;
}
