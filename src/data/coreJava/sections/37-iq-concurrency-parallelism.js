import { section } from "../schema.js";
import part1 from "./parts/iq-par-1.js";
import part2 from "./parts/iq-par-2.js";
import part3 from "./parts/iq-par-3.js";
import part4 from "./parts/iq-par-4.js";
import part5 from "./parts/iq-par-5.js";
import part6 from "./parts/iq-par-6.js";
import part7 from "./parts/iq-par-7.js";

// Interview Q&A: top 100 concurrency and parallelism questions (Q1-Q100), from first
// principles (Amdahl, the Java Memory Model) to Fork/Join, CompletableFuture and virtual threads,
// plus 50 extra (Q101-Q150): thread states and concurrency models, signaling and locking
// strategies, classic synchronization problems, design problems and concurrent data structures.
export default section("interview-concurrency-parallelism", "Interview Q&A: Top 100 Concurrency and Parallelism Questions (+50 Extra)", [
  ...part1,
  ...part2,
  ...part3,
  ...part4,
  ...part5,
  ...part6,
  ...part7,
]);
