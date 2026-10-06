/* global self */
// Each run gets a fresh worker. The UI terminates it on timeout or navigation.
function equal(actual, expected) {
  if (actual === expected) return true;
  if (!actual || !expected || typeof actual !== "object" || typeof expected !== "object")
    return false;
  if (Array.isArray(actual) !== Array.isArray(expected)) return false;
  const keys = Object.keys(expected);
  return (
    keys.length === Object.keys(actual).length &&
    keys.every((key) => Object.hasOwn(actual, key) && equal(actual[key], expected[key]))
  );
}
self.onmessage = ({ data }) => {
  try {
    const solve = new Function(`"use strict";\n${data.code}\n;return solve;`)();
    if (typeof solve !== "function") throw new Error("Define function solve(input).");
    const results = data.tests.map(({ label, input, expected }) => {
      try {
        const actual = solve(input);
        const passed = equal(actual, expected);
        return {
          label,
          passed,
          actual: JSON.stringify(actual)?.slice(0, 1000) ?? String(actual),
          expected: JSON.stringify(expected),
        };
      } catch (error) {
        return { label, passed: false, error: String(error.message).slice(0, 500) };
      }
    });
    self.postMessage({ results });
  } catch (error) {
    self.postMessage({ error: String(error.message).slice(0, 500) });
  }
};
