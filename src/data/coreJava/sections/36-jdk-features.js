import { section } from "../schema.js";
import part1 from "./parts/jdk-features-1.js";
import part2 from "./parts/jdk-features-2.js";
import part3 from "./parts/jdk-features-3.js";
import part4 from "./parts/jdk-features-4.js";

// JDK features for study: one lesson per release, Java 1.0 to Java 27.
export default section("jdk-features", "JDK Features: Java 1.0 to Java 27", [...part1, ...part2, ...part3, ...part4]);
