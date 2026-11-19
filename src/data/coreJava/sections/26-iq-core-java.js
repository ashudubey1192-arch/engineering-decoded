import { section } from "../schema.js";
import part1 from "./parts/iq-core-1.js";
import part2 from "./parts/iq-core-2.js";
import part3 from "./parts/iq-core-3.js";
import part4 from "./parts/iq-core-4.js";
import part5 from "./parts/iq-core-5.js";

// Interview Q&A: the top core Java questions, answered in order (Q1-Q116).
export default section("interview-core-java", "Interview Q&A: Core Java Top Questions", [...part1, ...part2, ...part3, ...part4, ...part5]);
