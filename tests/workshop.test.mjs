import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { runSimulation, simulationModels } from "../src/data/learningSimulations.js";
import { interviewPractice } from "../src/data/interviewPractice.js";
import { interviewLessons, newInterviewCourseKeys } from "../src/data/interviewCourses.js";
import { deepTopicFor } from "../src/data/tutorialDeepTopics.js";

const values=frame=>Object.fromEntries(frame.values.map(v=>[v.name,v.value]));
test("shared content stays scoped to the right course and subject",()=>{
  assert.match(deepTopicFor({id:"frontend-tooling"},{slug:"eslint"},{title:"Apply the Main Workflow to a Feature"}).title,/Lint/);
  assert.match(deepTopicFor({id:"frontend-tooling"},{slug:"storybook"},{title:"Apply the Main Workflow to a Feature"}).title,/component/);
  assert.match(deepTopicFor({id:"frontend"},{slug:"redux"},{title:"Queries"}).title,/server data/);
  assert.match(deepTopicFor({id:"backend"},{slug:"graphql"},{title:"Queries"}).title,/GraphQL/);
  assert.equal(deepTopicFor({id:"wellbeing"},{slug:"yoga"},{title:"Queries"}),undefined);
});
test("queue conserves arrivals and handles zero service",()=>{
  const frames=runSimulation("queue",{arrival:10,service:6,capacity:20,seconds:8});
  const last=values(frames.at(-1));
  assert.equal(Number(last.Queued)+Number(last.Completed)+Number(last.Rejected),80);
  assert.deepEqual(values(runSimulation("queue",{arrival:10,service:0,capacity:20,seconds:3}).at(-1)),{Queued:"20",Completed:"0",Rejected:"10"});
});
test("LRU hits refresh recency and changing capacity changes faults",()=>{
  assert.equal(values(runSimulation("paging",{pages:"1,2,3,1,4,2",capacity:3}).at(-1)).Faults,"5");
  assert.equal(values(runSimulation("paging",{pages:"1,2,3,1,4,2",capacity:4}).at(-1)).Faults,"4");
  assert.equal(values(runSimulation("paging",{pages:"1,2,1,3,1",capacity:2}).at(-1)).Faults,"3");
});
test("round robin matches known schedule and service conservation",()=>{
  const frames=runSimulation("scheduler",{bursts:"5,3,1",quantum:2});
  assert.deepEqual(frames.map(f=>f.label),["Job 1: 0–2 ms","Job 2: 2–4 ms","Job 3: 4–5 ms","Job 1: 5–7 ms","Job 2: 7–8 ms","Job 1: 8–9 ms"]);
  assert.equal(values(frames.at(-1)).Clock,"9 ms");
});
test("network estimates and threshold endpoints",()=>{
  const network=values(runSimulation("network",{dns:20,rtt:40,server:30}).at(-1));
  assert.equal(network["Cold request (ms)"],"170");assert.equal(network["Reused request (ms)"],"70");
  assert.match(runSimulation("fraud",{threshold:100,capacity:4}).at(-1).note,/TP=0, FP=0, FN=4, TN=6/);
  assert.match(runSimulation("fraud",{threshold:0,capacity:4}).at(-1).note,/TP=4, FP=6, FN=0, TN=0/);
});
test("token bucket burst and refill; two-sum cannot reuse index",()=>{
  assert.equal(values(runSimulation("tokenBucket",{times:"0,0,0,1",capacity:2,rate:1}).at(-1)).Accepted,"3");
  assert.equal(values(runSimulation("twoSum",{values:"3",target:6}).at(-1)).Result,"No pair");
  assert.equal(values(runSimulation("twoSum",{values:"3,3",target:6}).at(-1)).Result,"[0, 1]");
});
test("models reject invalid and unbounded inputs",()=>{
  assert.throws(()=>runSimulation("scheduler",{bursts:"1,NaN",quantum:2}));
  assert.throws(()=>runSimulation("scheduler",{bursts:"1",quantum:0}));
  assert.throws(()=>runSimulation("paging",{pages:"",capacity:3}));
  for(const id of Object.keys(simulationModels))assert.ok(runSimulation(id,{}).length>0);
});
test("each new curriculum preserves its workshops and capstone alongside roadmap additions",()=>{
  for(const key of newInterviewCourseKeys){
    const lessons=interviewLessons[key];assert.equal(lessons.filter(l=>!l.roadmap).length,12,key);
    assert.match(lessons.at(-1).title,/Capstone/);
    assert.equal(new Set(lessons.map(l=>l.slug)).size,lessons.length);
    for(const lesson of lessons){assert.ok(lesson.lab.concept.length>200,lesson.slug);assert.ok(lesson.lab.states.length>=3);}
  }
});
test("reference programs pass boundary tests through the actual worker harness",()=>{
  const source=readFileSync(new URL("../src/components/dsa/dsaPractice.worker.js",import.meta.url),"utf8");
  for(const problem of Object.values(interviewPractice)){
    let response;const self={postMessage:value=>{response=value;}};
    const context=vm.createContext({self});vm.runInContext(source,context);
    context.data={code:problem.solution,tests:structuredClone(problem.tests)};
    vm.runInContext("self.onmessage({data})",context,{timeout:2000});
    assert.ok(!response.error,`${problem.id}: ${response.error}`);
    assert.ok(response.results.every(r=>r.passed),`${problem.id}: ${JSON.stringify(response)}`);
  }
});
test("worker reports wrong answers, syntax errors, and unexpected exceptions",()=>{
  const source=readFileSync(new URL("../src/components/dsa/dsaPractice.worker.js",import.meta.url),"utf8");
  for(const code of ["function solve(){return 99}","function solve(){throw new Error('oops')}","function solve( {"]){
    let response;const context=vm.createContext({self:{postMessage:v=>{response=v;}}});vm.runInContext(source,context);
    context.data={code,tests:[{label:"case",input:1,expected:2}]};vm.runInContext("self.onmessage({data})",context,{timeout:2000});
    assert.ok(response.error||response.results.every(r=>!r.passed));
  }
});
