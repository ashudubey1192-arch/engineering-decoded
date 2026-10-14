import { HttpError, requireValue } from "./validation.js";
export async function runner(action, body, request = fetch) {
  const { JAVA_RUNNER_URL: base, JAVA_RUNNER_TOKEN: token } = process.env;
  if (!base || !token) {
    if (action === "status")
      return {
        available: false,
        message: "Java execution is not configured. Editing and local execution remain available.",
      };
    throw new HttpError(503, "Java execution is not configured");
  }
  if (action === "run") {
    requireValue(
      typeof body.code === "string" && body.code.trim().length > 0 && body.code.length <= 20000,
    );
    requireValue(Array.isArray(body.tests) && body.tests.length > 0 && body.tests.length <= 4);
    for (const t of body.tests) {
      requireValue(t && typeof t.label === "string" && t.label.length > 0 && t.label.length <= 100);
      for (const field of ["input", "expected"])
        requireValue(typeof t[field] === "string" && t[field].length <= 4096);
    }
  }
  try {
    const result = await request(new URL(action === "status" ? "/health" : "/run", base), {
      method: action === "status" ? "GET" : "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      ...(action === "run" ? { body: JSON.stringify({ code: body.code, tests: body.tests }) } : {}),
      signal: AbortSignal.timeout(action === "status" ? 5000 : 65000),
    });
    if (!result.ok) throw new Error("Runner unavailable");
    return action === "status"
      ? { available: true, message: "Java runner is ready." }
      : await result.json();
  } catch {
    if (action === "status")
      return { available: false, message: "Java runner is offline. Retry later." };
    throw new HttpError(503, "Java runner unavailable or timed out; your code remains saved");
  }
}
