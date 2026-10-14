// Calendar days use UTC consistently across devices. Yesterday keeps a streak alive.
export function learningCalendar(rows, now = new Date()) {
  const dayMs = 86400000;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const key = (time) => new Date(time).toISOString().slice(0, 10);
  const days = new Set(rows.map((row) => row.day));
  const activity = Array.from({ length: 42 }, (_, i) => {
    const date = key(today - (41 - i) * dayMs);
    return { date, active: days.has(date) };
  });
  const monday = today - ((now.getUTCDay() + 6) % 7) * dayMs;
  const weeklyDays = activity.filter((day) => day.active && Date.parse(day.date) >= monday).length;
  let cursor = days.has(key(today)) ? today : today - dayMs;
  let streak = 0;
  while (days.has(key(cursor))) {
    streak++;
    cursor -= dayMs;
  }
  return { activity, weeklyDays, streak, timezone: "UTC" };
}
