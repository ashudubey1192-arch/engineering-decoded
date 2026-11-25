import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/databases.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["databases--distributed-sql-databases"]} />;
}
