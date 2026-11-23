import test from "node:test";
import assert from "node:assert/strict";
import { roundRobin, pageReplacement, translateAddress } from "../src/data/osExperiments.js";

test("round robin reproduces the worked schedule and conserves every CPU burst", () => {
  const result = roundRobin([5, 3, 1], 2);
  assert.deepEqual(result.timeline.map(s => [s.id, s.start, s.end]), [[0,0,2],[1,2,4],[2,4,5],[0,5,7],[1,7,8],[0,8,9]]);
  assert.deepEqual(result.first, [0, 2, 4]);
  assert.deepEqual(result.completion, [9, 8, 5]);
  assert.deepEqual(result.waiting, [4, 5, 4]);
  for (let quantum = 1; quantum <= 5; quantum++) {
    const schedule = roundRobin([5, 3, 1], quantum);
    assert.equal(schedule.timeline.at(-1).end, 9);
    for (const [id, burst] of [5,3,1].entries()) assert.equal(schedule.timeline.filter(s => s.id === id).reduce((n,s) => n+s.end-s.start, 0), burst);
  }
});

test("page hits refresh LRU recency but do not reset FIFO load order", () => {
  const refs = [1,2,3,1,4,1];
  const fifo = pageReplacement(refs, 3, "FIFO");
  const lru = pageReplacement(refs, 3, "LRU");
  assert.equal(fifo[4].evicted, 1);
  assert.equal(lru[4].evicted, 2);
  assert.equal(fifo[5].hit, false);
  assert.equal(lru[5].hit, true);
  assert.equal(fifo[5].faults, 5);
  assert.equal(lru[5].faults, 4);
  for (const state of [...fifo, ...lru]) {
    assert.equal(new Set(state.frames).size, state.frames.length);
    assert.ok(state.frames.length <= 3);
  }
});

test("address translation preserves offsets and distinguishes absent mappings", () => {
  assert.deepEqual(translateAddress(0x3123, 4096, [5,2,7,9]), {page:3, offset:0x123, frame:9, physical:0x9123});
  assert.equal(translateAddress(4095, 4096, [5,2]).physical, 5*4096+4095);
  assert.equal(translateAddress(4096, 4096, [5,2]).physical, 8192);
  assert.equal(translateAddress(0x3123, 4096, [5,2,7,null]).physical, null);
  assert.equal(translateAddress(0, 4096, [0]).physical, 0);
});
