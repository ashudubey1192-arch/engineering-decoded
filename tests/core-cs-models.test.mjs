import test from "node:test";
import assert from "node:assert/strict";
import { coreCsModels, osiLayers, tcpIpLayers } from "../src/data/coreCsModels.js";
import { coreCsRoadmapLessons } from "../src/data/coreCsCourses.js";
import { auditedDepth, osDepth, networkDepth } from "../src/data/coreCsDepth/index.js";
import { coreCsComparisons } from "../src/data/coreCsComparisons.js";

const lesson = (course, id) => coreCsRoadmapLessons[`core-cs/${course}`].find(a => a.roadmap.id === id);

test("OSI teaches all seven named layers and visits all seven in playback", () => {
  assert.deepEqual(osiLayers.map(l => [l.number, l.name]), [[7,"Application"],[6,"Presentation"],[5,"Session"],[4,"Transport"],[3,"Network"],[2,"Data Link"],[1,"Physical"]]);
  const a = lesson("computer-networks", "osi-7-layer-model");
  assert.equal(a.lab.model.nodes.length, 7);
  assert.equal(a.lab.states.length, 7);
  for (const layer of osiLayers) {
    assert.ok(a.lab.states.some(s => s[0] === `Layer ${layer.number}: ${layer.name}`));
    assert.ok(a.lab.explanations.some(s => s.title.startsWith(`Layer ${layer.number} —`)));
    for (const field of ["role","pdu","identity","examples","detail"]) assert.ok(layer[field]);
  }
  assert.equal(a.lab.modelJourney, true);
  assert.match(a.lab.scenario, /seven/);
});

test("TCP/IP has four layers including Link and never substitutes a three-stage example", () => {
  assert.deepEqual(tcpIpLayers.map(l => l.name), ["Application", "Transport", "Internet", "Link"]);
  const a = lesson("computer-networks", "tcp-ip-4-layer-model");
  assert.equal(a.lab.states.length, 4);
  assert.equal(a.lab.model.nodes.length, 4);
  assert.match(a.lab.scenario, /physical transmission is included in Link/);
});

test("DHCP includes Request; TCP close covers both directions; TLS includes Finished checks", () => {
  assert.deepEqual(lesson("computer-networks", "dhcp").lab.model.nodes.map(n => n.id), ["discover","offer","request","ack"]);
  assert.equal(lesson("computer-networks", "dhcp").lab.states.length, 4);
  assert.deepEqual(lesson("computer-networks", "tcp-connection-termination").lab.model.nodes.map(n => n.id), ["fin-a","ack-a","fin-b","ack-b"]);
  const tls = lesson("computer-networks", "tls-handshake").lab;
  assert.ok(tls.model.nodes.some(n => n.id === "verify"));
  assert.ok(tls.model.nodes.some(n => n.id === "server-finished"));
  assert.ok(tls.model.nodes.some(n => n.id === "client-finished"));
  assert.equal(tls.states.length, tls.model.nodes.length);
});

test("five-state process model preserves Ready between wakeup and execution", () => {
  const a = lesson("operating-systems", "process-states");
  assert.deepEqual(a.lab.model.nodes.map(n => n.id), ["new","ready","running","blocked","terminated"]);
  assert.ok(a.lab.model.edges.some(([from,to]) => from === "blocked" && to === "ready"));
  assert.ok(!a.lab.model.edges.some(([from,to]) => from === "blocked" && to === "running"));
  const wake = a.lab.states.findIndex(s => s[0] === "Input arrives");
  assert.equal(a.lab.states[wake][1], "Ready");
  assert.equal(a.lab.states[wake + 1][1], "Running");
});

test("deadlock has all four conditions and every graph edge points to a real node", () => {
  assert.deepEqual(lesson("operating-systems", "deadlock").lab.model.nodes.map(n => n.id), ["exclusive","hold","no-preemption","cycle"]);
  for (const [course, models] of Object.entries(coreCsModels)) for (const [id, model] of Object.entries(models)) {
    assert.ok(lesson(course, id), `Unreachable model ${course}/${id}`);
    const ids = new Set(model.nodes.map(n => n.id));
    assert.equal(ids.size, model.nodes.length);
    for (const [from, to] of model.edges) assert.ok(ids.has(from) && ids.has(to));
  }
});

test("comparison rows remain complete for RAID and page replacement", () => {
  assert.deepEqual(coreCsComparisons["operating-systems"].raid.rows.map(r => r[0]), ["RAID 0","RAID 1","RAID 5","RAID 6","RAID 10"]);
  assert.deepEqual(coreCsComparisons["operating-systems"]["page-replacement-algorithms"].rows.map(r => r[0]), ["FIFO","Optimal (OPT)","LRU","Clock / second chance"]);
  for (const [course, tables] of Object.entries(coreCsComparisons)) for (const [id, table] of Object.entries(tables)) {
    assert.ok(lesson(course, id));
    assert.ok(table.rows.every(row => row.length === table.columns.length), id);
  }
});

test("the substantive audit reaches every technical chapter in both courses", () => {
  for (const [course, complete] of [["operating-systems", osDepth], ["computer-networks", networkDepth]]) {
    assert.deepEqual(Object.keys(auditedDepth[course]).sort(), Object.keys(complete).sort(), `${course}: missing or unexpected audit entries`);
    for (const [id, sections] of Object.entries(auditedDepth[course])) {
      assert.ok(sections.length >= 4, `${course}/${id}: missing detailed subtopics`);
      assert.ok(sections.every(s => s.title && s.body && s.body.split(/\s+/).length >= 40), `${course}/${id}: incomplete section`);
    }
  }
});
