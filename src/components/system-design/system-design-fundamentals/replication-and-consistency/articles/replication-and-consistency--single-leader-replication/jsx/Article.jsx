import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/replication-and-consistency.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["replication-and-consistency--single-leader-replication"]} />;
}
