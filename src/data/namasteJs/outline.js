// Namaste JavaScript course outline: every episode of Season 1 and Season 2, split into
// one lesson per sub-topic. Content lives in src/data/namasteJs/lessons*.js and is rendered by
// src/components/frontend/javascript/namaste/NamasteJsLesson.jsx.
// The episode list was used as a topic list only; all lesson content is original.
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map(([lessonTitle, episode]) => ({
    title: lessonTitle,
    slug: `${slug}--${slugify(lessonTitle)}`,
    time: "15 min",
    sectionSlug: slug,
    episode,
    group: episode,
  })),
});

export const namasteJsSections = [
  section("nj-execution", "Namaste JS · Execution Context & Hoisting", [
    ["How JavaScript Works and Execution Context", "S1 EP-01 · How JavaScript Works"],
    ["Memory and Code Execution Phases", "S1 EP-02 · How Code Is Executed"],
    ["The Call Stack", "S1 EP-02 · How Code Is Executed"],
    ["Hoisting in JavaScript", "S1 EP-03 · Hoisting"],
    ["Hoisting Function Expressions and Arrow Functions", "S1 EP-03 · Hoisting"],
    ["How Functions Work and Variable Environment", "S1 EP-04 · Functions & Variable Environment"],
    ["Shortest JS Program, window and this", "S1 EP-05 · Shortest JS Program"],
    ["undefined vs not defined", "S1 EP-06 · undefined vs not defined"],
  ]),
  section("nj-scope", "Namaste JS · Scope, TDZ & Closures", [
    ["Scope and Lexical Environment", "S1 EP-07 · Scope Chain & Lexical Environment"],
    ["The Scope Chain", "S1 EP-07 · Scope Chain & Lexical Environment"],
    ["let and const and the Temporal Dead Zone", "S1 EP-08 · let, const & TDZ"],
    ["ReferenceError vs TypeError vs SyntaxError", "S1 EP-08 · let, const & TDZ"],
    ["Block Scope", "S1 EP-09 · Block Scope & Shadowing"],
    ["Shadowing and Illegal Shadowing", "S1 EP-09 · Block Scope & Shadowing"],
    ["Closures", "S1 EP-10 · Closures"],
    ["Uses of Closures", "S1 EP-10 · Closures"],
    ["setTimeout and Closures in a Loop", "S1 EP-11 · setTimeout + Closures"],
    ["Closures Interview Deep Dive", "S1 EP-12 · Closures Interview"],
    ["Data Privacy and Constructor Functions", "S1 EP-12 · Closures Interview"],
    ["Closures and Garbage Collection", "S1 EP-12 · Closures Interview"],
  ]),
  section("nj-functions", "Namaste JS · First-Class Functions & Callbacks", [
    ["Function Statement, Expression and Declaration", "S1 EP-13 · First-Class Functions"],
    ["Anonymous and Named Function Expressions", "S1 EP-13 · First-Class Functions"],
    ["Parameters, Arguments and First-Class Functions", "S1 EP-13 · First-Class Functions"],
    ["Arrow Functions", "S1 EP-13 · First-Class Functions"],
    ["Callback Functions", "S1 EP-14 · Callbacks & Event Listeners"],
    ["Event Listeners and Closures", "S1 EP-14 · Callbacks & Event Listeners"],
    ["Removing Event Listeners", "S1 EP-14 · Callbacks & Event Listeners"],
  ]),
  section("nj-event-loop", "Namaste JS · Event Loop & JS Engine", [
    ["Web APIs and the Browser Runtime", "S1 EP-15 · Async JS & Event Loop"],
    ["Callback Queue and the Event Loop", "S1 EP-15 · Async JS & Event Loop"],
    ["Microtask Queue", "S1 EP-15 · Async JS & Event Loop"],
    ["Starvation and Task Ordering", "S1 EP-15 · Async JS & Event Loop"],
    ["JavaScript Runtime Environment", "S1 EP-16 · JS Engine & V8"],
    ["Parsing, AST and JIT Compilation", "S1 EP-16 · JS Engine & V8"],
    ["V8 Architecture and Garbage Collection", "S1 EP-16 · JS Engine & V8"],
    ["Trust Issues with setTimeout", "S1 EP-17 · Trust Issues with setTimeout"],
    ["setTimeout Zero and Blocking the Main Thread", "S1 EP-17 · Trust Issues with setTimeout"],
  ]),
  section("nj-functional", "Namaste JS · Higher-Order Functions", [
    ["Higher-Order Functions and Functional Programming", "S1 EP-18 · Higher-Order Functions"],
    ["Building a Custom Array Method", "S1 EP-18 · Higher-Order Functions"],
    ["map", "S1 EP-19 · map, filter & reduce"],
    ["filter", "S1 EP-19 · map, filter & reduce"],
    ["reduce", "S1 EP-19 · map, filter & reduce"],
    ["Chaining map, filter and reduce", "S1 EP-19 · map, filter & reduce"],
  ]),
  section("nj-promises", "Namaste JS · Callback Hell & Promises", [
    ["Callback Hell", "S2 EP-01 · Callback Hell"],
    ["Inversion of Control", "S2 EP-01 · Callback Hell"],
    ["Promises", "S2 EP-02 · Promises"],
    ["Promise States and the Promise Object", "S2 EP-02 · Promises"],
    ["Creating a Promise", "S2 EP-03 · Creating, Chaining & Errors"],
    ["Promise Chaining", "S2 EP-03 · Creating, Chaining & Errors"],
    ["Error Handling in Promise Chains", "S2 EP-03 · Creating, Chaining & Errors"],
  ]),
  section("nj-async", "Namaste JS · async/await & Promise APIs", [
    ["async Functions", "S2 EP-04 · async await"],
    ["await Behind the Scenes", "S2 EP-04 · async await"],
    ["Error Handling with async await", "S2 EP-04 · async await"],
    ["async await vs then and catch", "S2 EP-04 · async await"],
    ["Promise.all", "S2 EP-05 · Promise APIs"],
    ["Promise.allSettled", "S2 EP-05 · Promise APIs"],
    ["Promise.race", "S2 EP-05 · Promise APIs"],
    ["Promise.any", "S2 EP-05 · Promise APIs"],
    ["Promise API Interview Questions", "S2 EP-05 · Promise APIs"],
  ]),
  section("nj-this", "Namaste JS · The this Keyword", [
    ["this in Global Scope and Functions", "S2 EP-06 · this keyword"],
    ["this in Object Methods", "S2 EP-06 · this keyword"],
    ["call, apply and bind", "S2 EP-06 · this keyword"],
    ["this in Arrow Functions", "S2 EP-06 · this keyword"],
    ["this in DOM Event Handlers", "S2 EP-06 · this keyword"],
    ["Writing a bind Polyfill", "S2 EP-06 · this keyword"],
  ]),
];

export const namasteJsArticles = namasteJsSections.flatMap((item) => item.lessons);
