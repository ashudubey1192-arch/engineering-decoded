// JavaScript Internals course outline: one lesson per sub-topic, grouped by topic. Content lives in src/data/jsInternals/lessons*.js and is rendered by
// src/components/frontend/javascript/internals/JsInternalsLesson.jsx.
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map(([lessonTitle, topic, slugTitle = lessonTitle]) => ({
    title: lessonTitle,
    slug: `${slug}--${slugify(slugTitle)}`,
    time: "15 min",
    sectionSlug: slug,
    topic,
    group: topic,
  })),
});

export const jsInternalsSections = [
  section("nj-execution", "JS Internals · Execution Context & Hoisting", [
    ["How JavaScript Works and Execution Context", "How JavaScript Works"],
    ["Memory and Code Execution Phases", "How Code Is Executed"],
    ["The Call Stack", "How Code Is Executed"],
    ["Hoisting in JavaScript", "Hoisting"],
    ["Hoisting Function Expressions and Arrow Functions", "Hoisting"],
    ["How Functions Work and Variable Environment", "Functions & Variable Environment"],
    ["The Global Object, window and this", "The Global Object", "Shortest JS Program, window and this"],
    ["undefined vs not defined", "undefined vs not defined"],
  ]),
  section("nj-scope", "JS Internals · Scope, TDZ & Closures", [
    ["Scope and Lexical Environment", "Scope Chain & Lexical Environment"],
    ["The Scope Chain", "Scope Chain & Lexical Environment"],
    ["let and const and the Temporal Dead Zone", "let, const & TDZ"],
    ["ReferenceError vs TypeError vs SyntaxError", "let, const & TDZ"],
    ["Block Scope", "Block Scope & Shadowing"],
    ["Shadowing and Illegal Shadowing", "Block Scope & Shadowing"],
    ["Closures", "Closures"],
    ["Uses of Closures", "Closures"],
    ["setTimeout and Closures in a Loop", "setTimeout + Closures"],
    ["Closures Interview Deep Dive", "Closures Interview"],
    ["Data Privacy and Constructor Functions", "Closures Interview"],
    ["Closures and Garbage Collection", "Closures Interview"],
  ]),
  section("nj-functions", "JS Internals · First-Class Functions & Callbacks", [
    ["Function Statement, Expression and Declaration", "First-Class Functions"],
    ["Anonymous and Named Function Expressions", "First-Class Functions"],
    ["Parameters, Arguments and First-Class Functions", "First-Class Functions"],
    ["Arrow Functions", "First-Class Functions"],
    ["Callback Functions", "Callbacks & Event Listeners"],
    ["Event Listeners and Closures", "Callbacks & Event Listeners"],
    ["Removing Event Listeners", "Callbacks & Event Listeners"],
  ]),
  section("nj-event-loop", "JS Internals · Event Loop & JS Engine", [
    ["Web APIs and the Browser Runtime", "Async JS & Event Loop"],
    ["Callback Queue and the Event Loop", "Async JS & Event Loop"],
    ["Microtask Queue", "Async JS & Event Loop"],
    ["Starvation and Task Ordering", "Async JS & Event Loop"],
    ["JavaScript Runtime Environment", "JS Engine & V8"],
    ["Parsing, AST and JIT Compilation", "JS Engine & V8"],
    ["V8 Architecture and Garbage Collection", "JS Engine & V8"],
    ["Why setTimeout Delays Are Not Exact", "Timer Accuracy", "Trust Issues with setTimeout"],
    ["setTimeout Zero and Blocking the Main Thread", "Timer Accuracy"],
  ]),
  section("nj-functional", "JS Internals · Higher-Order Functions", [
    ["Higher-Order Functions and Functional Programming", "Higher-Order Functions"],
    ["Building a Custom Array Method", "Higher-Order Functions"],
    ["map", "map, filter & reduce"],
    ["filter", "map, filter & reduce"],
    ["reduce", "map, filter & reduce"],
    ["Chaining map, filter and reduce", "map, filter & reduce"],
  ]),
  section("nj-promises", "JS Internals · Callback Hell & Promises", [
    ["Callback Hell", "Callback Hell"],
    ["Inversion of Control", "Callback Hell"],
    ["Promises", "Promises"],
    ["Promise States and the Promise Object", "Promises"],
    ["Creating a Promise", "Creating, Chaining & Errors"],
    ["Promise Chaining", "Creating, Chaining & Errors"],
    ["Error Handling in Promise Chains", "Creating, Chaining & Errors"],
  ]),
  section("nj-async", "JS Internals · async/await & Promise APIs", [
    ["async Functions", "async await"],
    ["await Behind the Scenes", "async await"],
    ["Error Handling with async await", "async await"],
    ["async await vs then and catch", "async await"],
    ["Promise.all", "Promise APIs"],
    ["Promise.allSettled", "Promise APIs"],
    ["Promise.race", "Promise APIs"],
    ["Promise.any", "Promise APIs"],
    ["Promise API Interview Questions", "Promise APIs"],
  ]),
  section("nj-this", "JS Internals · The this Keyword", [
    ["this in Global Scope and Functions", "this keyword"],
    ["this in Object Methods", "this keyword"],
    ["call, apply and bind", "this keyword"],
    ["this in Arrow Functions", "this keyword"],
    ["this in DOM Event Handlers", "this keyword"],
    ["Writing a bind Polyfill", "this keyword"],
  ]),
];

export const jsInternalsArticles = jsInternalsSections.flatMap((item) => item.lessons);
