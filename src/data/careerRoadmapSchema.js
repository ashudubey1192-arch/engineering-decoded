export const branch = (title, topics, explanation) => ({
  title,
  topics: topics.split("|"),
  explanation,
});

export const step = (
  id,
  title,
  hours,
  branches,
  flow,
  example,
  project,
  checkpoint,
  mistake,
  code = "",
) => ({
  id,
  title,
  hours,
  branches,
  flow: flow.split("|"),
  example,
  project,
  checkpoint,
  mistake,
  code,
});

export function roadmap(config) {
  let hours = 0;
  return {
    ...config,
    source: `https://roadmap.sh/${config.id}`,
    checked: "October 8, 2026",
    stages: config.stages.map((item) => {
      const start = Math.floor(hours / 8) + 1;
      hours += item.hours;
      const end = Math.ceil(hours / 8);
      return { ...item, weeks: start === end ? `${start}` : `${start}–${end}` };
    }),
  };
}
