// Deliberately bounded educational models; not predictions of kernel behavior.
export function roundRobin(bursts, quantum) {
  const remaining = [...bursts];
  const first = bursts.map(() => null);
  const completion = bursts.map(() => 0);
  const timeline = [];
  let time = 0;
  while (remaining.some(value => value > 0)) {
    remaining.forEach((value, id) => {
      if (!value) return;
      first[id] ??= time;
      const duration = Math.min(quantum, value);
      timeline.push({ id, start: time, end: time + duration });
      time += duration;
      remaining[id] -= duration;
      if (!remaining[id]) completion[id] = time;
    });
  }
  return { timeline, first, completion, waiting: completion.map((value, id) => value - bursts[id]) };
}

export function pageReplacement(references, capacity, policy) {
  const frames = [];
  const loaded = new Map();
  const used = new Map();
  let faults = 0;
  return references.map((page, index) => {
    const hit = frames.includes(page);
    let evicted = null;
    if (!hit) {
      faults++;
      if (frames.length === capacity) {
        const age = policy === "LRU" ? used : loaded;
        evicted = frames.reduce((oldest, candidate) => age.get(candidate) < age.get(oldest) ? candidate : oldest);
        frames[frames.indexOf(evicted)] = page;
      } else frames.push(page);
      loaded.set(page, index);
    }
    used.set(page, index);
    return { page, hit, evicted, frames: [...frames], faults };
  });
}

export function translateAddress(address, pageSize, pageTable) {
  const page = Math.floor(address / pageSize);
  const offset = address % pageSize;
  const frame = pageTable[page];
  return { page, offset, frame, physical: frame == null ? null : frame * pageSize + offset };
}
