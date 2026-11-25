import SystemDesignLesson from "../../../../../SystemDesignLesson";
import lessons from "../../../../../../../data/systemDesign/lessons/api-security.js";

export default function Article() {
  return <SystemDesignLesson content={lessons["api-security--api-keys-and-hmac-signatures"]} />;
}
