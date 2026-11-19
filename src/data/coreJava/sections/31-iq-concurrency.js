import { section } from "../schema.js";
import part1 from "./parts/iq-concurrency-1.js";
import part2 from "./parts/iq-concurrency-2.js";

// Interview Q&A: java.util.concurrent (Q1-Q49).
export default section("interview-concurrency", "Interview Q&A: Thread Concurrency (java.util.concurrent)", [...part1, ...part2]);
