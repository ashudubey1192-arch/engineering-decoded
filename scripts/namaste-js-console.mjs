// Preloaded with `node --import` by build-namaste-js.mjs so every lesson example prints with
// the same formatter the in-page playground uses.
import { formatArgs } from "../src/components/frontend/javascript/namaste/formatValue.js";

for (const method of ["log", "info", "warn", "error"]) {
  console[method] = (...args) => process.stdout.write(`${formatArgs(args)}\n`);
}
