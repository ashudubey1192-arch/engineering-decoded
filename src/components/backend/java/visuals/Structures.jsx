import { Controls, Frame, Rich, javaHash, textWidth, useStepper, useSvgId } from "./Stepper";

// Animated pictures of linear data structures. Every visual is a list of frames; the
// stepper plays them. Elements keep stable React keys so CSS transitions move them.

function Arrow({ id }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" className="jvArrowHead" />
    </marker>
  );
}

function Player({ title, frames, render, legend, delay, kicker }) {
  const stepper = useStepper(frames.length, delay);
  const frame = frames[stepper.index];
  return (
    <Frame title={title} kicker={kicker || "ANIMATION"} legend={legend} controls={<Controls stepper={stepper} />} note={<Rich text={frame.note} />}>
      {frame.op && (
        <div className="jvOp">
          <code>{frame.op}</code>
        </div>
      )}
      {render(frame, stepper.index)}
    </Frame>
  );
}

/* ---------------- ArrayList: growth, shift on remove, O(1) get ---------------- */

const ARRAY_FRAMES = [
  { op: "List<String> list = new ArrayList<>(4);", cells: [null, null, null, null], size: 0, note: "An ArrayList wraps an `Object[]` (elementData). Here the initial capacity is 4 so the picture stays small; the default first allocation is 10." },
  { op: 'list.add("A");', cells: ["A", null, null, null], size: 1, mark: { 0: "new" }, note: "`add` stores the element at index `size`, then increments size. O(1)." },
  { op: 'list.add("B"); list.add("C");', cells: ["A", "B", "C", null], size: 3, mark: { 1: "new", 2: "new" }, note: "Elements sit side by side in memory, which makes iteration cache-friendly." },
  { op: 'list.add("D");', cells: ["A", "B", "C", "D"], size: 4, mark: { 3: "new" }, note: "size == capacity: the backing array is now full." },
  { op: 'list.add("E");  // no room', old: ["A", "B", "C", "D"], cells: ["A", "B", "C", "D", null, null], size: 4, mark: { 0: "moved", 1: "moved", 2: "moved", 3: "moved" }, note: "grow(): new capacity = old + (old >> 1) = 4 + 2 = 6 (50% larger). `Arrays.copyOf` copies every element into the new array. O(n) for this one add." },
  { op: 'list.add("E");', cells: ["A", "B", "C", "D", "E", null], size: 5, mark: { 4: "new" }, note: "The old array is garbage now. Because growth is geometric, adds are amortised O(1)." },
  { op: "list.remove(1);  // removes B", cells: ["A", "C", "D", "E", null, null], size: 4, mark: { 1: "moved", 2: "moved", 3: "moved" }, note: "Removing from the middle shifts every later element one slot left (`System.arraycopy`). O(n). The freed slot is set to null for the GC." },
  { op: "list.get(2);  // → D", cells: ["A", "C", "D", "E", null, null], size: 4, mark: { 2: "hit" }, note: "`get(i)` is direct indexing: address = base + i × slot size. O(1), the reason to choose ArrayList for random access." },
];

function ArrayCells({ cells, y, mark = {}, size, label }) {
  return (
    <g>
      <text x={14} y={y + 27} className="jvSmall" textAnchor="start">
        {label}
      </text>
      {cells.map((value, index) => (
        <g key={index} transform={`translate(${110 + index * 66} ${y})`}>
          <rect width={58} height={42} rx={5} className={`jvCell ${value == null ? "empty" : ""} ${mark[index] || ""} ${index >= size && value != null ? "" : ""}`} />
          <text x={29} y={26} textAnchor="middle" className="jvCellText">
            {value ?? "null"}
          </text>
          <text x={29} y={58} textAnchor="middle" className="jvSmall">
            [{index}]
          </text>
        </g>
      ))}
    </g>
  );
}

export function ArrayListVisual() {
  return (
    <Player
      title="ArrayList: the backing array, growth and shifting"
      frames={ARRAY_FRAMES}
      render={(frame, index) => (
        <svg viewBox="0 0 560 190" className="jvSvg" role="img" aria-label={`ArrayList elementData: ${frame.cells.map((c) => c ?? "null").join(", ")}`}>
          {frame.old ? (
            <>
              <ArrayCells cells={frame.old} y={14} size={4} label="old [4]" mark={{ 0: "fade", 1: "fade", 2: "fade", 3: "fade" }} />
              <text x={300} y={98} className="jvSmall" textAnchor="middle">
                ↓ Arrays.copyOf(elementData, 6) ↓
              </text>
              <ArrayCells key={`n${index}`} cells={frame.cells} y={110} size={frame.size} label="new [6]" mark={frame.mark} />
            </>
          ) : (
            <ArrayCells key={`c${index}`} cells={frame.cells} y={60} size={frame.size} label="elementData" mark={frame.mark} />
          )}
          <text x={546} y={20} textAnchor="end" className="jvSmall">
            size = {frame.size} · capacity = {frame.cells.length}
          </text>
        </svg>
      )}
    />
  );
}

/* ---------------- Linked lists ---------------- */

const SINGLY = [
  { op: "Node head = null;", list: [], note: "An empty list is just a null head reference." },
  { op: "addLast(10)", list: [10], mark: { 0: "new" }, labels: { 0: ["head"] }, note: "A node holds the data and a `next` reference. The last node's next is null." },
  { op: "addLast(20); addLast(30)", list: [10, 20, 30], mark: { 1: "new", 2: "new" }, labels: { 0: ["head"], 2: ["tail"] }, note: "Without a tail pointer, appending must walk from head to the last node: O(n). Keeping a tail makes it O(1)." },
  { op: "Node n = new Node(15); n.next = p.next;", list: [10, 20, 30], float: { v: 15, after: 0 }, labels: { 0: ["head", "p"] }, note: "Insert after p (10): FIRST point the new node at p's successor, so 20 is never lost." },
  { op: "p.next = n;", list: [10, 15, 20, 30], mark: { 1: "new" }, labels: { 0: ["head", "p"] }, note: "THEN re-link p to the new node. Two reference writes: O(1) once you hold p." },
  { op: "p.next = p.next.next;  // delete 20", list: [10, 15, 20, 30], mark: { 2: "del" }, bypass: 2, labels: { 0: ["head"], 1: ["p"] }, note: "To delete you need the PREVIOUS node. Point it past the victim." },
  { op: "// 20 is unreachable", list: [10, 15, 30], labels: { 0: ["head"], 2: ["tail"] }, note: "Nothing references 20 any more, so the garbage collector reclaims it. Searching by value is still O(n)." },
];

const DOUBLY = [
  { op: "new LinkedList<>()", list: [], note: "java.util.LinkedList is doubly linked: each node has `prev`, `item` and `next`, and the list keeps `first` and `last`." },
  { op: "addLast(10); addLast(20)", list: [10, 20], mark: { 0: "new", 1: "new" }, labels: { 0: ["first"], 1: ["last"] }, note: "Links run both ways, so you can iterate forwards or backwards (ListIterator.previous)." },
  { op: "addFirst(5)", list: [5, 10, 20], mark: { 0: "new" }, labels: { 0: ["first"], 2: ["last"] }, note: "Adding at either end is O(1): set the new node's next, the old first's prev, and move `first`." },
  { op: "addLast(30)", list: [5, 10, 20, 30], mark: { 3: "new" }, labels: { 0: ["first"], 3: ["last"] }, note: "Same at the tail via `last`. That is why LinkedList is a natural Deque." },
  { op: "remove(Integer.valueOf(10))", list: [5, 10, 20, 30], mark: { 1: "del" }, bypass: 1, labels: { 0: ["first"], 3: ["last"] }, note: "Finding 10 walks from first: O(n). Unlinking is O(1): prev.next = next and next.prev = prev." },
  { op: "get(2)  // → 30", list: [5, 20, 30], mark: { 2: "hit" }, labels: { 0: ["first"], 2: ["last"] }, note: "`get(i)` walks from whichever end is nearer (i < size/2 ? first : last) but is still O(n). Use ArrayList for random access." },
];

function LinkedRow({ frame, doubly, marker }) {
  const box = doubly ? 120 : 96;
  const gap = 44;
  const x0 = 24;
  const y = 92;
  const xs = frame.list.map((_, index) => x0 + index * (box + gap));
  const endX = (xs.at(-1) ?? x0 - gap) + box + gap;
  const width = Math.max(560, endX + 60);
  return (
    <svg viewBox={`0 0 ${width} 190`} className="jvSvg" role="img" aria-label={`Linked list: ${frame.list.join(" → ") || "empty"} → null`}>
      <defs>
        <Arrow id={marker} />
      </defs>
      {frame.list.length === 0 && (
        <g>
          <text x={x0} y={y - 22} className="jvLabel">
            head
          </text>
          <line x1={x0 + 18} y1={y - 16} x2={x0 + 18} y2={y + 8} className="jvLink" markerEnd={`url(#${marker})`} />
          <text x={x0 + 4} y={y + 30} className="jvNull">
            null
          </text>
        </g>
      )}
      {frame.list.map((value, index) => {
        const x = xs[index];
        const cls = frame.mark?.[index] || "";
        return (
          <g key={`${value}-${index}-${cls}`} className={`jvLNode ${cls}`}>
            <rect x={x} y={y} width={box} height={42} rx={6} className="jvCell" />
            {doubly && <line x1={x + 28} x2={x + 28} y1={y} y2={y + 42} className="jvDivider" />}
            <line x1={x + box - 28} x2={x + box - 28} y1={y} y2={y + 42} className="jvDivider" />
            {doubly && <text x={x + 14} y={y + 26} textAnchor="middle" className="jvTiny">prev</text>}
            <text x={doubly ? x + box / 2 : x + (box - 28) / 2} y={y + 27} textAnchor="middle" className="jvCellText">
              {value}
            </text>
            <text x={x + box - 14} y={y + 26} textAnchor="middle" className="jvTiny">
              next
            </text>
            {(frame.labels?.[index] || []).map((label, li) => (
              <g key={label}>
                <text x={x + box / 2 + (li - ((frame.labels[index].length - 1) / 2)) * 44} y={y - 26} textAnchor="middle" className="jvLabel">
                  {label}
                </text>
              </g>
            ))}
            {frame.labels?.[index] && <line x1={x + box / 2} x2={x + box / 2} y1={y - 20} y2={y - 4} className="jvLink" markerEnd={`url(#${marker})`} />}
          </g>
        );
      })}
      {frame.list.map((_, index) => {
        if (frame.bypass === index + 1 || frame.bypass === index) {
          if (frame.bypass !== index + 1) return null;
        }
        const x = xs[index] + box - 14;
        const next = index + 1 < frame.list.length ? xs[index + 1] : null;
        if (frame.bypass === index + 1) {
          const target = xs[index + 2];
          return (
            <path key={`b${index}`} d={`M${x} ${y + 8} C ${x + 40} ${y - 52}, ${target - 40} ${y - 52}, ${target + 6} ${y + 2}`} className="jvLink hot" markerEnd={`url(#${marker})`} />
          );
        }
        if (next == null)
          return (
            <g key={`n${index}`}>
              <line x1={x} y1={y + 21} x2={x + gap + 8} y2={y + 21} className="jvLink" markerEnd={`url(#${marker})`} />
              <text x={x + gap + 14} y={y + 26} className="jvNull">
                null
              </text>
            </g>
          );
        return <line key={`n${index}`} x1={x} y1={y + 15} x2={next - 2} y2={y + 15} className="jvLink" markerEnd={`url(#${marker})`} />;
      })}
      {doubly &&
        frame.list.map((_, index) =>
          index > 0 && frame.bypass !== index && frame.bypass !== index - 1 ? (
            <line key={`p${index}`} x1={xs[index] + 10} y1={y + 30} x2={xs[index - 1] + box + 2} y2={y + 30} className="jvLink back" markerEnd={`url(#${marker})`} />
          ) : null,
        )}
      {frame.float && (
        <g className="jvLNode new">
          <rect x={xs[frame.float.after] + box + gap / 2 - 10} y={10} width={box} height={38} rx={6} className="jvCell" />
          <text x={xs[frame.float.after] + box + gap / 2 - 10 + (box - 28) / 2} y={34} textAnchor="middle" className="jvCellText">
            {frame.float.v}
          </text>
          <text x={xs[frame.float.after] + box + gap / 2 + 2} y={4 + 2} className="jvTiny">
            n
          </text>
          <path d={`M${xs[frame.float.after] + box + gap / 2 + box - 24} 40 Q ${xs[frame.float.after + 1] + box / 2} 52, ${xs[frame.float.after + 1] + box / 2} ${y - 2}`} className="jvLink hot" markerEnd={`url(#${marker})`} />
        </g>
      )}
    </svg>
  );
}

function reverseFrames() {
  const values = [1, 2, 3, 4];
  const frames = [{ op: "Node prev = null, cur = head;", dirs: ["r", "r", "r", "r"], prev: -1, cur: 0, note: "Reverse in place with three references. `prev` heads the reversed part, `cur` heads what is left." }];
  const dirs = ["r", "r", "r", "r"];
  for (let k = 0; k < values.length; k += 1) {
    frames.push({ op: "Node next = cur.next;", dirs: [...dirs], prev: k - 1, cur: k, next: k + 1, note: `Save cur.next (${k + 1 < values.length ? values[k + 1] : "null"}) before breaking the link, or the rest of the list is lost.` });
    dirs[k] = "l";
    frames.push({ op: "cur.next = prev; prev = cur; cur = next;", dirs: [...dirs], prev: k, cur: k + 1, note: `Node ${values[k]} now points backwards. Advance prev and cur one node.` });
  }
  frames.push({ op: "head = prev;", dirs: [...dirs], prev: 3, cur: 4, head: 3, note: "cur is null, so prev is the new head: 4 → 3 → 2 → 1 → null. O(n) time, O(1) extra space." });
  return frames.map((frame) => ({ ...frame, values }));
}

function ReverseRow({ frame, marker }) {
  const box = 70;
  const gap = 50;
  const x0 = 80;
  const y = 96;
  const xs = frame.values.map((_, i) => x0 + i * (box + gap));
  const labelAt = (i) => (i < 0 ? 24 : i >= frame.values.length ? xs.at(-1) + box + gap + 4 : xs[i] + box / 2);
  const tags = [["prev", frame.prev], ["cur", frame.cur], ["next", frame.next], ["head", frame.head]].filter(([, at]) => at !== undefined);
  return (
    <svg viewBox="0 0 640 200" className="jvSvg" role="img" aria-label="Reversing a linked list with prev, cur and next pointers">
      <defs>
        <Arrow id={marker} />
      </defs>
      <text x={14} y={y + 26} className="jvNull">null</text>
      <text x={xs.at(-1) + box + gap - 6} y={y + 26} className="jvNull">null</text>
      {frame.values.map((value, i) => (
        <g key={value}>
          <rect x={xs[i]} y={y} width={box} height={40} rx={6} className={`jvCell ${frame.dirs[i] === "l" ? "done" : ""} ${frame.cur === i ? "hit" : ""}`} />
          <text x={xs[i] + box / 2} y={y + 26} textAnchor="middle" className="jvCellText">
            {value}
          </text>
          {frame.dirs[i] === "r" ? (
            <line x1={xs[i] + box} y1={y + 20} x2={(i + 1 < frame.values.length ? xs[i + 1] : xs[i] + box + gap - 10) - 2} y2={y + 20} className="jvLink" markerEnd={`url(#${marker})`} />
          ) : (
            <line x1={xs[i]} y1={y + 20} x2={(i > 0 ? xs[i - 1] + box : 46) + 2} y2={y + 20} className="jvLink hot" markerEnd={`url(#${marker})`} />
          )}
        </g>
      ))}
      {tags.map(([name, at], index) => (
        <g key={name} className="jvTag" style={{ transform: `translate(${labelAt(at)}px, ${name === "next" || name === "head" ? 168 : 40 + index * 0}px)` }}>
          <text textAnchor="middle" className={`jvLabel t-${name}`} y={name === "next" || name === "head" ? 10 : 0}>
            {name}
          </text>
          <line x1={0} x2={0} y1={name === "next" || name === "head" ? -6 : 6} y2={name === "next" || name === "head" ? -26 : 48} className="jvLink" markerEnd={`url(#${marker})`} />
        </g>
      ))}
    </svg>
  );
}

function cycleFrames() {
  const next = (i) => (i < 5 ? i + 1 : 2);
  const frames = [{ op: "slow = head; fast = head;", slow: 0, fast: 0, note: "Floyd's tortoise and hare: node 6 links back to node 3, forming a cycle. slow moves 1 step, fast moves 2." }];
  let slow = 0;
  let fast = 0;
  do {
    slow = next(slow);
    fast = next(next(fast));
    frames.push({ op: "slow = slow.next; fast = fast.next.next;", slow, fast, note: slow === fast ? `They meet at node ${slow + 1}: a cycle exists. (Without a cycle, fast would reach null.)` : `slow at ${slow + 1}, fast at ${fast + 1}. Inside a cycle fast gains one node per step, so it must catch up.` });
  } while (slow !== fast);
  slow = 0;
  frames.push({ op: "slow = head;  // phase 2", slow, fast, note: "To find where the cycle starts, move slow back to head and step BOTH one node at a time." });
  while (slow !== fast) {
    slow = next(slow);
    fast = next(fast);
    frames.push({ op: "slow = slow.next; fast = fast.next;", slow, fast, start: slow === fast ? slow : undefined, note: slow === fast ? `They meet at node ${slow + 1}, the first node of the cycle. O(n) time, O(1) space.` : "Keep stepping both by one." });
  }
  return frames;
}

function CycleRow({ frame, marker }) {
  const box = 56;
  const gap = 34;
  const y = 70;
  const xs = Array.from({ length: 6 }, (_, i) => 30 + i * (box + gap));
  return (
    <svg viewBox="0 0 580 236" className="jvSvg" role="img" aria-label={`Cycle detection: slow at node ${frame.slow + 1}, fast at node ${frame.fast + 1}`}>
      <defs>
        <Arrow id={marker} />
      </defs>
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x} y={y} width={box} height={40} rx={20} className={`jvCell ${frame.start === i ? "hit" : i >= 2 ? "ring" : ""}`} />
          <text x={x + box / 2} y={y + 26} textAnchor="middle" className="jvCellText">
            {i + 1}
          </text>
          {i < 5 && <line x1={x + box} y1={y + 20} x2={xs[i + 1] - 2} y2={y + 20} className="jvLink" markerEnd={`url(#${marker})`} />}
        </g>
      ))}
      <path d={`M${xs[5] + box / 2} ${y + 40} C ${xs[5] + box / 2} ${y + 110}, ${xs[2] + box / 2} ${y + 110}, ${xs[2] + box / 2} ${y + 44}`} className="jvLink hot" markerEnd={`url(#${marker})`} />
      <g className="jvTag" style={{ transform: `translate(${xs[frame.slow] + box / 2}px, 0px)` }}>
        <text y={30} textAnchor="middle" className="jvLabel t-slow">🐢 slow</text>
        <line x1={0} x2={0} y1={36} y2={y - 4} className="jvLink" markerEnd={`url(#${marker})`} />
      </g>
      <g className="jvTag" style={{ transform: `translate(${xs[frame.fast] + box / 2}px, 0px)` }}>
        <text y={226} textAnchor="middle" className="jvLabel t-fast">🐇 fast</text>
        <line x1={0} x2={0} y1={212} y2={y + 44} className="jvLink" markerEnd={`url(#${marker})`} />
      </g>
    </svg>
  );
}

export function LinkedListVisual({ mode = "singly" }) {
  const marker = useSvgId("jvA");
  if (mode === "reverse")
    return <Player title="Reversing a linked list (prev, cur, next)" frames={reverseFrames()} render={(frame) => <ReverseRow frame={frame} marker={marker} />} />;
  if (mode === "cycle")
    return <Player title="Detecting a cycle: Floyd's tortoise and hare" frames={cycleFrames()} render={(frame) => <CycleRow frame={frame} marker={marker} />} />;
  const doubly = mode === "doubly";
  return (
    <Player
      title={doubly ? "Doubly linked list (java.util.LinkedList)" : "Singly linked list: insert and delete by re-linking"}
      frames={doubly ? DOUBLY : SINGLY}
      render={(frame) => <LinkedRow frame={frame} doubly={doubly} marker={marker} />}
    />
  );
}

/* ---------------- Stack ---------------- */

const STACK_FRAMES = [
  { op: "Deque<Integer> stack = new ArrayDeque<>();", items: [], note: "A stack is LIFO: the last element pushed is the first popped, like a pile of plates." },
  { op: "stack.push(10);", items: [10], fresh: 10, note: "push adds on top. O(1)." },
  { op: "stack.push(20);", items: [10, 20], fresh: 20, note: "20 is now on top of 10." },
  { op: "stack.push(30);", items: [10, 20, 30], fresh: 30, note: "The top is always the most recent element." },
  { op: "stack.peek();  // → 30", items: [10, 20, 30], peek: true, note: "peek reads the top without removing it." },
  { op: "stack.pop();  // → 30", items: [10, 20], popped: 30, note: "pop removes and returns the top. O(1)." },
  { op: "stack.pop();  // → 20", items: [10], popped: 20, note: "Elements come out in reverse order of insertion: 30, 20, 10." },
  { op: "stack.push(40);", items: [10, 40], fresh: 40, note: "Uses: undo history, matching brackets, expression evaluation, DFS and the JVM's own call stack. Popping an empty stack: underflow (ArrayDeque throws NoSuchElementException)." },
];

export function StackVisual() {
  return (
    <Player
      title="Stack: push, peek and pop (LIFO)"
      frames={STACK_FRAMES}
      render={(frame) => (
        <svg viewBox="0 0 460 300" className="jvSvg" role="img" aria-label={`Stack from bottom to top: ${frame.items.join(", ") || "empty"}`}>
          <path d="M140 40 V 272 H 300 V 40" className="jvBin" />
          {Array.from({ length: 5 }, (_, slot) => (
            <text key={slot} x={128} y={252 - slot * 46} textAnchor="end" className="jvTiny">
              {slot}
            </text>
          ))}
          {frame.items.map((value, slot) => (
            <g key={value} className={`jvStackItem ${frame.fresh === value ? "drop" : ""}`} style={{ transform: `translate(0px, ${-slot * 46}px)` }}>
              <rect x={150} y={228} width={140} height={38} rx={5} className={`jvCell ${slot === frame.items.length - 1 && frame.peek ? "hit" : ""}`} />
              <text x={220} y={252} textAnchor="middle" className="jvCellText">
                {value}
              </text>
            </g>
          ))}
          {frame.items.length > 0 && (
            <g className="jvTag" style={{ transform: `translate(0px, ${-(frame.items.length - 1) * 46}px)` }}>
              <text x={330} y={252} className="jvLabel">← top</text>
            </g>
          )}
          {frame.popped !== undefined && (
            <g key={`p${frame.popped}`} className="jvPopped">
              <rect x={330} y={40} width={100} height={38} rx={5} className="jvCell del" />
              <text x={380} y={64} textAnchor="middle" className="jvCellText">
                {frame.popped}
              </text>
              <text x={380} y={30} textAnchor="middle" className="jvSmall">
                returned
              </text>
            </g>
          )}
        </svg>
      )}
    />
  );
}

/* ---------------- Queue (linear) and circular queue ---------------- */

const QUEUE_FRAMES = [
  { op: "Queue<String> q = new ArrayDeque<>();", items: [], note: "A queue is FIFO: elements leave in the order they arrived, like a ticket line." },
  { op: 'q.offer("A");', items: ["A"], fresh: "A", note: "offer (or add) joins at the rear (tail). O(1)." },
  { op: 'q.offer("B"); q.offer("C");', items: ["A", "B", "C"], fresh: "C", note: "front = oldest element, rear = newest." },
  { op: "q.peek();  // → A", items: ["A", "B", "C"], peek: true, note: "peek reads the front without removing it (null when empty; element() throws)." },
  { op: "q.poll();  // → A", items: ["B", "C"], out: "A", note: "poll removes the front (null when empty; remove() throws). O(1)." },
  { op: 'q.offer("D");', items: ["B", "C", "D"], fresh: "D", note: "Uses: BFS, task scheduling, buffering between producer and consumer threads (BlockingQueue)." },
  { op: "q.poll(); q.poll();  // → B, C", items: ["D"], out: "C", note: "First in, first out: A, B, C left in arrival order." },
];

export function QueueVisual() {
  return (
    <Player
      title="Queue: offer at the rear, poll from the front (FIFO)"
      frames={QUEUE_FRAMES}
      render={(frame) => (
        <svg viewBox="0 0 600 170" className="jvSvg" role="img" aria-label={`Queue from front to rear: ${frame.items.join(", ") || "empty"}`}>
          <path d="M110 50 H 560 M110 110 H 560" className="jvBin" />
          {frame.items.map((value, i) => (
            <g key={value} className={`jvQItem ${frame.fresh === value ? "join" : ""}`} style={{ transform: `translate(${i * 86}px, 0px)` }}>
              <rect x={124} y={58} width={74} height={44} rx={5} className={`jvCell ${i === 0 && frame.peek ? "hit" : ""}`} />
              <text x={161} y={86} textAnchor="middle" className="jvCellText">
                {value}
              </text>
            </g>
          ))}
          {frame.out && (
            <g key={`o${frame.out}${frame.op}`} className="jvLeave">
              <rect x={18} y={58} width={74} height={44} rx={5} className="jvCell del" />
              <text x={55} y={86} textAnchor="middle" className="jvCellText">
                {frame.out}
              </text>
            </g>
          )}
          {frame.items.length > 0 && (
            <>
              <text x={161} y={140} textAnchor="middle" className="jvLabel">front ↑</text>
              <g className="jvTag" style={{ transform: `translate(${(frame.items.length - 1) * 86}px, 0px)` }}>
                <text x={161} y={36} textAnchor="middle" className="jvLabel">rear ↓</text>
              </g>
            </>
          )}
        </svg>
      )}
    />
  );
}

function circularFrames() {
  const cap = 6;
  const slots = Array(cap).fill(null);
  let head = 0;
  let tail = 0;
  let size = 0;
  const frames = [{ op: "int head = 0, tail = 0, size = 0; // capacity 6", slots: [...slots], head, tail, size, note: "A circular (ring) buffer reuses freed slots. Indices wrap with `% capacity`, so no shifting is ever needed." }];
  const enqueue = (value) => {
    slots[tail] = value;
    const at = tail;
    tail = (tail + 1) % cap;
    size += 1;
    frames.push({ op: `enqueue("${value}");  // a[${at}] = ${value}; tail = (${at} + 1) % 6`, slots: [...slots], head, tail, size, fresh: at, note: size === cap ? "size == capacity: the queue is full (head == tail with size 6). The next enqueue must fail, block or grow." : `tail moves to ${tail}.${at === cap - 1 ? " It wrapped around to 0!" : ""}` });
  };
  const dequeue = () => {
    const value = slots[head];
    slots[head] = null;
    const at = head;
    head = (head + 1) % cap;
    size -= 1;
    frames.push({ op: `dequeue();  // → ${value}; head = (${at} + 1) % 6`, slots: [...slots], head, tail, size, gone: at, note: `${value} leaves from the front. Slot ${at} is free for reuse.` });
  };
  ["A", "B", "C", "D"].forEach(enqueue);
  dequeue();
  dequeue();
  ["E", "F", "G", "H"].forEach(enqueue);
  return frames;
}

export function CircularQueueVisual() {
  const marker = useSvgId("jvA");
  return (
    <Player
      title="Circular queue (ring buffer): indices wrap around"
      frames={circularFrames()}
      render={(frame) => {
        const cx = 240;
        const cy = 150;
        const r = 92;
        const pos = (i, radius = r) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / frame.slots.length;
          return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
        };
        const [hx, hy] = pos(frame.head, 140);
        const [tx, ty] = pos(frame.tail, 140);
        return (
          <svg viewBox="0 0 520 300" className="jvSvg" role="img" aria-label={`Ring buffer slots: ${frame.slots.map((s) => s ?? "empty").join(", ")}; head ${frame.head}, tail ${frame.tail}`}>
            <defs>
              <Arrow id={marker} />
            </defs>
            <circle cx={cx} cy={cy} r={r} className="jvRing" />
            {frame.slots.map((value, i) => {
              const [x, y] = pos(i);
              return (
                <g key={`${i}-${value}`} className={frame.fresh === i ? "jvPopIn" : ""}>
                  <circle cx={x} cy={y} r={27} className={`jvCell ${value == null ? "empty" : ""} ${frame.fresh === i ? "new" : ""} ${frame.gone === i ? "del" : ""}`} />
                  <text x={x} y={y + 5} textAnchor="middle" className="jvCellText">
                    {value ?? "·"}
                  </text>
                  <text x={pos(i, 52)[0]} y={pos(i, 52)[1] + 4} textAnchor="middle" className="jvTiny">
                    [{i}]
                  </text>
                </g>
              );
            })}
            <text x={hx} y={hy + 4} textAnchor="middle" className="jvLabel t-head">head</text>
            <text x={tx} y={ty + (frame.tail === frame.head ? 16 : 4)} textAnchor="middle" className="jvLabel t-tail">tail</text>
            <text x={cx} y={cy + 5} textAnchor="middle" className="jvSmall">
              size {frame.size}/6
            </text>
          </svg>
        );
      }}
    />
  );
}

/* ---------------- HashMap buckets (real String.hashCode values) ---------------- */

function hashFrames() {
  const buckets = Array.from({ length: 16 }, () => []);
  const frames = [{ op: "Map<String, Integer> map = new HashMap<>();", buckets: buckets.map((b) => [...b]), note: "A HashMap is an array of 16 buckets (table) by default. Each bucket holds a chain of Node(hash, key, value, next). Load factor 0.75 → it resizes to 32 when the 13th entry arrives." }];
  const snap = () => buckets.map((chain) => chain.map((entry) => ({ ...entry })));
  const describe = (key) => {
    const { hash, spread, index } = javaHash(key);
    return { index, calc: `"${key}".hashCode() = ${hash} → h ^ (h >>> 16) = ${spread} → ${spread} & 15 = ${index}` };
  };
  const put = (key, value) => {
    const { index, calc } = describe(key);
    const chain = buckets[index];
    const found = chain.find((entry) => entry.key === key);
    let note;
    if (found) {
      found.value = value;
      note = `Key "${key}" already exists (equals() is true), so put REPLACES the value and returns the old one. Size stays the same.`;
    } else {
      chain.push({ key, value });
      note = chain.length > 1 ? `COLLISION: bucket ${index} already has ${chain[0].key}. "Aa" and "BB" have the same hashCode (2112), so the new node is appended to the chain. get() then compares keys with equals().` : `Bucket ${index} was empty: the node is stored directly.`;
    }
    frames.push({ op: `map.put("${key}", ${value});`, calc, buckets: snap(), bucket: index, hit: key, note });
  };
  put("Aa", 1);
  put("BB", 2);
  put("Java", 3);
  put("Duke", 4);
  put("Map", 5);
  {
    const { index, calc } = describe("BB");
    frames.push({ op: 'map.get("BB");  // → 2', calc, buckets: snap(), bucket: index, hit: "BB", walk: true, note: `get jumps straight to bucket ${index} (O(1)), then walks the chain comparing hash and equals() until it finds "BB". Long chains cost O(n), which is why a chain longer than 8 becomes a red-black tree (O(log n)).` });
  }
  put("Aa", 9);
  return frames;
}

export function HashMapVisual() {
  return (
    <Player
      title="HashMap internals: hash → bucket index → chain"
      frames={hashFrames()}
      delay={1900}
      render={(frame) => {
        const cell = 56;
        const x0 = 14;
        const longest = Math.max(1, ...frame.buckets.map((chain) => chain.length));
        const height = 150 + longest * 44;
        return (
          <>
            {frame.calc && (
              <div className="jvCalc">
                <code>{frame.calc}</code>
              </div>
            )}
            <svg viewBox={`0 0 ${x0 * 2 + cell * 16} ${height}`} className="jvSvg jvScroll" style={{ minWidth: 680 }} role="img" aria-label={`HashMap table. ${frame.buckets.map((chain, i) => (chain.length ? `bucket ${i}: ${chain.map((e) => `${e.key}=${e.value}`).join(", ")}` : null)).filter(Boolean).join("; ") || "all buckets empty"}`}>
              <text x={x0} y={18} className="jvSmall">table (Node[16])</text>
              {frame.buckets.map((chain, i) => {
                const x = x0 + i * cell;
                return (
                  <g key={i}>
                    <rect x={x} y={28} width={cell - 4} height={34} rx={4} className={`jvCell ${frame.bucket === i ? "hit" : chain.length ? "" : "empty"}`} />
                    <text x={x + (cell - 4) / 2} y={50} textAnchor="middle" className="jvTiny">
                      [{i}]
                    </text>
                    {chain.map((entry, k) => {
                      const y = 84 + k * 44;
                      const w = textWidth(`${entry.key}=${entry.value}`, 10.5);
                      const nx = x + (cell - 4) / 2 - w / 2;
                      return (
                        <g key={entry.key} className={`jvPopIn ${frame.hit === entry.key ? "hot" : ""}`}>
                          <line x1={x + (cell - 4) / 2} x2={x + (cell - 4) / 2} y1={k === 0 ? 62 : y - 14} y2={y} className="jvLink" />
                          <rect x={nx} y={y} width={w} height={28} rx={14} className={`jvCell ${frame.hit === entry.key ? "hit" : ""}`} />
                          <text x={x + (cell - 4) / 2} y={y + 18} textAnchor="middle" className="jvSmallStrong">
                            {entry.key}={entry.value}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          </>
        );
      }}
    />
  );
}

/* ---------------- HashSet vs LinkedHashSet vs TreeSet ordering ---------------- */

function orderFrames(map) {
  const words = ["banana", "cherry", "apple", "fig", "date", "kiwi"];
  const frames = [{ op: map ? "HashMap / LinkedHashMap / TreeMap" : "new HashSet<>(), new LinkedHashSet<>(), new TreeSet<>()", added: [], note: "The same elements are added to all three, in the same order. Watch how each one iterates." }];
  const added = [];
  for (const word of words) {
    added.push(word);
    frames.push({ op: map ? `put("${word}", ${word.length})` : `add("${word}")`, added: [...added], fresh: word, note: map ? `TreeMap sorts by key (compareTo), LinkedHashMap remembers insertion order, HashMap iterates bucket by bucket ("${word}" → bucket ${javaHash(word).index}).` : `HashSet iterates in bucket order ("${word}" → bucket ${javaHash(word).index}), LinkedHashSet in insertion order, TreeSet in sorted order.` });
  }
  frames.push({ op: "for (var x : each) System.out.println(x);", added: [...added], note: map ? "Pick HashMap for speed, LinkedHashMap for predictable insertion (or access) order, TreeMap for sorted keys and range queries (O(log n))." : "Pick HashSet for speed (O(1)), LinkedHashSet when insertion order matters, TreeSet for sorted order and range queries (O(log n), no null)." });
  return frames;
}

export function OrderingVisual({ map = false }) {
  const kinds = map ? ["HashMap", "LinkedHashMap", "TreeMap"] : ["HashSet", "LinkedHashSet", "TreeSet"];
  return (
    <Player
      title={map ? "Iteration order: HashMap vs LinkedHashMap vs TreeMap" : "Iteration order: HashSet vs LinkedHashSet vs TreeSet"}
      frames={orderFrames(map)}
      render={(frame) => {
        const orders = [
          [...frame.added].sort((a, b) => javaHash(a).index - javaHash(b).index || frame.added.indexOf(a) - frame.added.indexOf(b)),
          frame.added,
          [...frame.added].sort(),
        ];
        return (
          <svg viewBox="0 0 600 300" className="jvSvg" role="img" aria-label={kinds.map((kind, i) => `${kind}: ${orders[i].join(", ") || "empty"}`).join(". ")}>
            {kinds.map((kind, column) => (
              <g key={kind} transform={`translate(${20 + column * 196} 0)`}>
                <text x={86} y={22} textAnchor="middle" className="jvLabel">
                  {kind}
                </text>
                <text x={86} y={40} textAnchor="middle" className="jvTiny">
                  {["bucket order (looks random)", "insertion order", "sorted order"][column]}
                </text>
                {orders[column].map((word, row) => (
                  <g key={word} className="jvOrderItem" style={{ transform: `translate(0px, ${58 + row * 38}px)` }}>
                    <rect width={172} height={30} rx={5} className={`jvCell ${frame.fresh === word ? "new" : ""}`} />
                    <text x={86} y={20} textAnchor="middle" className="jvCellText">
                      {map ? `${word}=${word.length}` : word}
                    </text>
                    {column === 0 && (
                      <text x={164} y={20} textAnchor="end" className="jvTiny">
                        b{javaHash(word).index}
                      </text>
                    )}
                  </g>
                ))}
              </g>
            ))}
          </svg>
        );
      }}
    />
  );
}
