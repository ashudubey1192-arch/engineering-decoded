import { section } from "../schema.js";
import part1 from "./parts/iq-threads-1.js";
import part2 from "./parts/iq-threads-2.js";
import part3 from "./parts/iq-threads-3.js";

// Interview Q&A: multithreading (set 1, Q1-Q60) and output questions (Q61-Q82).
export default section("interview-threads", "Interview Q&A: Multithreading", [...part1, ...part2, ...part3]);
