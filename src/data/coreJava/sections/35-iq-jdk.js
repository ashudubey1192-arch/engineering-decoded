import { section } from "../schema.js";
import part1 from "./parts/iq-jdk-1.js";
import part2 from "./parts/iq-jdk-2.js";
import part3 from "./parts/iq-jdk-3.js";
import part4 from "./parts/iq-jdk-4.js";

// Interview Q&A: top 100 questions on JDK 1 to 27, focused on Java 8, records, sealed classes,
// pattern matching and virtual threads.
export default section("interview-jdk-versions", "Interview Q&A: Top 100 JDK 1-27 Questions", [...part1, ...part2, ...part3, ...part4]);
