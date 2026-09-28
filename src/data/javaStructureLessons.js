const make = (
  id,
  title,
  concept,
  invariant,
  code,
  output,
  frames,
  complexity,
  pitfalls,
  project,
  challenge,
  answer,
) => ({
  id,
  title,
  concept,
  invariant,
  code: `import java.util.*;\nimport java.util.concurrent.*;\n\npublic class Main {\n${code}\n}`,
  output,
  frames: frames.map(([label, cells, explanation]) => ({ label, cells, explanation })),
  complexity,
  pitfalls,
  project,
  challenge,
  answer,
});

const linked = [
  make(
    "nodes",
    "Linked lists: nodes, ownership, insertion and deletion",
    "A singly linked list stores a value and next reference per node. The head identifies the first node; null ends the chain. Unlike an array, reaching index i requires following i links. A tail pointer makes appending constant time, but deleting the last node still needs its predecessor. A doubly linked node also stores prev; a circular list links the tail to the head and needs a different stopping condition.",
    "Every live node is reachable from head exactly once in an acyclic list. Save the successor before changing a link.",
    `  static class Node { int value; Node next; Node(int v) { value = v; } }
  public static void main(String[] args) {
    Node head = new Node(10); head.next = new Node(30);
    Node added = new Node(20);
    added.next = head.next; head.next = added;
    head.next = head.next.next; // delete 20 after known predecessor
    for (Node p = head; p != null; p = p.next) System.out.print(p.value + " ");
  }`,
    "10 30",
    [
      ["Initial", ["head:10", "30", "null"], "Follow next from 10 to 30."],
      [
        "Save successor",
        ["added:20 → 30", "head:10 → 30"],
        "Set added.next before publishing added.",
      ],
      ["Insert", ["head:10", "20", "30", "null"], "Set head.next = added."],
      [
        "Unlink",
        ["head:10", "30", "null"],
        "Bypass 20. Garbage collection can reclaim it once no references retain it.",
      ],
    ],
    "Search/index: O(n). Insert or unlink after a known predecessor: O(1). Storage: O(n).",
    "An insertion at an index includes O(n) search. For a doubly linked list update both directions and head/tail, including the single-node case. A sentinel removes many head special cases.",
    "Intrusive lists and caches need explicit ownership rules. In ordinary Java business code use library collections; pointer-heavy lists have allocation and locality costs.",
    "Delete the head and the only node. What happens to a cached tail?",
    "Move head to head.next. If head becomes null, set tail to null too. Test empty, singleton, head, middle and tail changes.",
  ),
  make(
    "reverse",
    "Reverse a linked list with three pointers",
    "Reverse links in place rather than copying values. Maintain a reversed prefix and an untouched suffix. This is the core building block for palindrome checks, reversing a subrange and reversing groups of k nodes.",
    "prev heads the reversed prefix; cur heads the unprocessed suffix. The two chains contain all original nodes.",
    `  static class Node { int v; Node next; Node(int v, Node n) { this.v=v; next=n; } }
  static Node reverse(Node cur) {
    Node prev=null;
    while(cur!=null) { Node next=cur.next; cur.next=prev; prev=cur; cur=next; }
    return prev;
  }
  public static void main(String[] args) {
    Node h=reverse(new Node(1,new Node(2,new Node(3,null))));
    for(;h!=null;h=h.next) System.out.print(h.v+" ");
  }`,
    "3 2 1",
    [
      ["Start", ["prev:null", "cur:1 → 2 → 3"], "The reversed prefix is empty."],
      [
        "Reverse 1",
        ["prev:1 → null", "cur:2 → 3"],
        "Save 2, reverse 1.next, advance both pointers.",
      ],
      ["Reverse 2", ["prev:2 → 1", "cur:3"], "Keep the suffix reachable."],
      ["Finish", ["head:3", "2", "1", "null"], "Return prev when cur is null."],
    ],
    "O(n) time and O(1) extra space. Recursive reversal adds O(n) call-stack space.",
    "Changing cur.next before saving it loses the suffix. This algorithm assumes an acyclic list and mutates the caller's nodes.",
    "For shared models, prefer copying or exclusive ownership. A palindrome check can reverse the second half, compare, then restore it before returning.",
    "Reverse null and a singleton. How do you reverse positions left through right?",
    "Both base cases work unchanged. Use a dummy node, reach the predecessor of left, reverse only the requested range, then reconnect both boundaries.",
  ),
  make(
    "cycle",
    "Fast and slow pointers: middle, cycles and cycle entry",
    "Move slow one link and fast two. In an acyclic chain fast reaches the end; in a cycle the relative distance changes by one per iteration, eventually producing a meeting. After meeting, move one pointer from head and one from the meeting node at equal speed to find the entry.",
    "Only dereference fast.next.next after checking fast and fast.next. Compare node identities, not stored values.",
    `  static class Node { int v; Node next; Node(int v){this.v=v;} }
  static Node entry(Node head) {
    Node slow=head, fast=head;
    while(fast!=null && fast.next!=null) {
      slow=slow.next; fast=fast.next.next;
      if(slow==fast) { slow=head; while(slow!=fast){slow=slow.next;fast=fast.next;} return slow; }
    }
    return null;
  }
  public static void main(String[] args) {
    Node a=new Node(1),b=new Node(2),c=new Node(3); a.next=b;b.next=c;c.next=b;
    System.out.println(entry(a).v);
    System.out.println(entry(new Node(9))==null);
  }`,
    "2\ntrue",
    [
      ["Links", ["1 → 2", "2 → 3", "3 → 2"], "The cycle enters at node 2."],
      ["Iteration 1", ["slow:2", "fast:3"], "Pointers have not met."],
      ["Iteration 2", ["slow:3", "fast:3"], "Meeting proves a cycle, but 3 is not its entry."],
      ["Find entry", ["slow:1 → 2", "fast:3 → 2"], "Reset slow to head; both meet next at 2."],
    ],
    "O(n) time, O(1) extra space.",
    "Equal values do not mean equal nodes. Do not print a cyclic list with an unbounded traversal.",
    "Validate custom graph-like chains before traversing untrusted links. For middle-finding, the same speeds return the second middle of an even-length list when both start at head.",
    "Why does resetting a pointer find the entry?",
    "Let the noncyclic prefix length be μ and cycle length λ. At the meeting, the slow travel distance is a multiple of λ. After μ more steps its cycle position is the entry, exactly when the reset pointer reaches it.",
  ),
  make(
    "merge",
    "Sentinels: merge sorted lists and remove the nth node",
    "A dummy head gives a stable predecessor even when the result's first node changes. Merge by selecting the smaller front node, then append the leftover chain. For nth-from-end deletion, a dummy and a gap of n nodes let the trailing pointer stop just before the target.",
    "The output prefix is sorted and contains the smallest consumed nodes from both inputs.",
    `  static class Node { int v; Node next; Node(int v,Node n){this.v=v;next=n;} }
  static Node merge(Node a,Node b){
    Node dummy=new Node(0,null),tail=dummy;
    while(a!=null && b!=null){
      if(a.v<=b.v){tail.next=a;a=a.next;}else{tail.next=b;b=b.next;}
      tail=tail.next;
    }
    tail.next=a!=null?a:b; return dummy.next;
  }
  public static void main(String[] args){
    Node h=merge(new Node(1,new Node(4,null)),new Node(2,new Node(3,null)));
    for(;h!=null;h=h.next)System.out.print(h.v+" ");
  }`,
    "1 2 3 4",
    [
      [
        "Inputs",
        ["A:1 → 4", "B:2 → 3", "dummy"],
        "Both inputs must already be sorted and disjoint.",
      ],
      ["Take A", ["dummy → 1", "A:4", "B:2 → 3"], "1 is the smallest front."],
      ["Take B twice", ["dummy → 1 → 2 → 3", "A:4"], "Advance only the chosen list each time."],
      ["Append rest", ["1", "2", "3", "4"], "Return dummy.next."],
    ],
    "O(m+n) time, O(1) auxiliary space; nodes are reused.",
    "Shared input tails can create cycles in a destructive merge. Reject invalid n before nth-from-end deletion.",
    "Merge sorted event chains under exclusive ownership. For k chains, use a min-heap of front nodes for O(N log k) time. Merge sort splits at the middle and merges in O(n log n) time.",
    "Describe intersection detection and nth-from-end deletion.",
    "Intersection: switch each pointer to the other head on null; they meet at the shared identity or null after at most m+n steps. Deletion: start both at dummy, advance fast n steps with validation, then advance both until fast.next is null; bypass slow.next.",
  ),
  make(
    "library-list",
    "Java LinkedList, iterators and collection choices",
    "LinkedList implements both List and Deque using a doubly linked structure. Use a ListIterator for local edits during traversal. ArrayList is usually a better starting point for indexed reads; ArrayDeque is a good starting point for stack/queue workloads. A data structure choice should follow measured access patterns.",
    "Structural edits during this traversal go through the iterator that owns its position.",
    `  public static void main(String[] args){
    LinkedList<Integer> xs=new LinkedList<>(List.of(10,20,30));
    ListIterator<Integer> it=xs.listIterator();
    while(it.hasNext()){if(it.next()==20){it.remove();it.add(25);}}
    xs.addFirst(5); xs.removeLast();
    System.out.println(xs);
    xs.remove(Integer.valueOf(10)); System.out.println(xs);
  }`,
    "[5, 10, 25]\n[5, 25]",
    [
      ["Initial", ["10", "20", "30"], "Iterator begins before 10."],
      ["Replace locally", ["10", "25", "30"], "Remove the last returned element and insert 25."],
      ["Endpoints", ["5", "10", "25"], "Add first and remove last."],
      ["By value", ["5", "25"], "Integer.valueOf selects removal by value."],
    ],
    "Endpoint changes O(1); indexed access/search O(n); iterator traversal O(n). Storage O(n).",
    "remove(1) removes index 1; remove(Integer.valueOf(1)) removes the value. Repeated get(i) traversal is O(n²). Fail-fast iterators are bug detection, not thread safety.",
    "An editor with frequent edits around a maintained cursor can use a list iterator. Do not assume linked nodes save memory; each node stores links and object overhead.",
    "Can you remove using xs.remove inside an enhanced for loop?",
    "Use Iterator.remove after next, or removeIf for a predicate. Mutating the collection structurally outside its iterator can invalidate traversal.",
  ),
];

const stack = [
  make(
    "stack-api",
    "Stacks: LIFO, ArrayDeque and undo/redo",
    "A stack removes the most recently added element. Use Deque<E> with ArrayDeque<E> for new single-threaded Java stacks. push, pop and peek use the first end. A command editor maintains undo and redo stacks; a new edit clears redo because it starts a new history branch.",
    "The next item to undo is at the top of undo; the next item to redo is at the top of redo.",
    `  public static void main(String[] args){
    Deque<String> undo=new ArrayDeque<>(),redo=new ArrayDeque<>();
    undo.push("type A"); undo.push("type B");
    redo.push(undo.pop()); System.out.println(undo.peek());
    undo.push(redo.pop()); System.out.println(undo.peek());
    undo.push("type C"); redo.clear(); System.out.println(redo.isEmpty());
  }`,
    "type A\ntype B\ntrue",
    [
      ["Edit A", ["top:A"], "Push A."],
      ["Edit B", ["top:B", "A"], "Newest command sits at the first end."],
      ["Undo", ["undo:A", "redo:B"], "Move B after successfully reversing its effect."],
      ["Redo", ["undo:B → A", "redo:empty"], "Reapply B, then return it to undo."],
    ],
    "Endpoint operations O(1) amortized; retained history O(n).",
    "pop throws on empty; pollFirst returns null. ArrayDeque rejects null. java.util.Stack is legacy; its synchronized methods do not make a multi-step workflow atomic.",
    "Store commands with execute/undo behavior, bound history memory, and decide what happens when undo fails. This example models history movement, not transactional command execution.",
    "How do you build a minimum stack?",
    "Store (value, minimumSoFar) for every push, or maintain a second stack of minima including duplicates. pop removes matching state; peeked minimum is O(1).",
  ),
  make(
    "brackets",
    "Balanced parentheses and expression parsing",
    "Nested syntax closes in reverse opening order, which is exactly LIFO. Push the expected closing character for each opener; every closer must match the top. This example accepts only bracket characters and rejects other input.",
    "The stack contains the unmatched expected closers, with the next required closer on top.",
    `  static boolean valid(String s){
    Deque<Character> st=new ArrayDeque<>();
    for(char c:s.toCharArray()){
      if(c=='(')st.push(')');else if(c=='[')st.push(']');else if(c=='{')st.push('}');
      else if(c!=')' && c!=']' && c!='}')return false;
      else if(st.isEmpty() || st.pop()!=c)return false;
    }
    return st.isEmpty();
  }
  public static void main(String[] args){System.out.println(valid("([])"));System.out.println(valid("([)]"));}`,
    "true\nfalse",
    [
      ["Read (", ["top:)"], "Expect a closing parenthesis later."],
      ["Read [", ["top:]", ")"], "The inner bracket must close first."],
      ["Read ]", ["top:)"], "Pop matching ]."],
      ["Read )", ["empty"], "All openers matched; accept."],
    ],
    "O(n) time and O(n) worst-case space.",
    "An empty final stack alone is insufficient: reject mismatches immediately. Decide whether non-bracket characters are ignored or rejected.",
    "Use the same pattern for nested delimiters. A real language parser also needs tokenization for quoted strings and escapes. Postfix evaluation pops right operand first, then left, so subtraction is left − right.",
    "Test empty input, a lone closer and an unfinished opener.",
    "Empty input is valid. A closer with an empty stack is invalid. Any remaining expected closer after the scan is invalid.",
  ),
  make(
    "monotonic-stack",
    "Monotonic stacks: next greater and daily temperatures",
    "Store indices of unresolved values in decreasing order. A warmer day resolves every smaller temperature at the top. Each index is pushed once and popped at most once, so the inner while loop does not make the whole algorithm quadratic.",
    "Stack indices increase from bottom to top, and their temperatures are non-increasing. They have no warmer day yet.",
    `  static int[] waits(int[] a){
    int[] out=new int[a.length];Deque<Integer> st=new ArrayDeque<>();
    for(int i=0;i<a.length;i++){
      while(!st.isEmpty() && a[i]>a[st.peek()]){int j=st.pop();out[j]=i-j;}
      st.push(i);
    }return out;
  }
  public static void main(String[] args){System.out.println(Arrays.toString(waits(new int[]{73,71,74,74,76})));}`,
    "[2, 1, 2, 1, 0]",
    [
      ["Days 0–1", ["top:1(71)", "0(73)"], "Both await a warmer day."],
      ["Day 2:74", ["answer[1]=1", "answer[0]=2", "top:2(74)"], "Resolve 71 then 73."],
      ["Day 3:74", ["top:3(74)", "2(74)"], "Equal is not warmer."],
      [
        "Day 4:76",
        ["answer[3]=1", "answer[2]=2", "4 unresolved"],
        "Unresolved positions retain zero.",
      ],
    ],
    "O(n) time, O(n) auxiliary space plus output.",
    "Store indices to compute distances. The choice of > versus >= encodes whether equality qualifies.",
    "Use next-greater queries for threshold analysis. For largest rectangle in a histogram, keep increasing heights and compute a popped bar's width from the new top to the current index; add a final sentinel height to flush.",
    "What are the results for [5,5,5] and [3,2,1]?",
    "Both return all zeros. No strictly larger future value exists. For circular next-greater, scan up to 2n positions but push original indices only once.",
  ),
];

const queue = [
  make(
    "queue-api",
    "Queues and deques: FIFO, endpoints and API contracts",
    "A FIFO queue adds at the back and removes at the front. A deque (pronounced deck) supports both ends; dequeue is the action of removing from a queue. Queue is an interface, not a guarantee of FIFO for every implementation: PriorityQueue removes by priority.",
    "With offerLast and pollFirst, earlier arrivals leave before later arrivals.",
    `  public static void main(String[] args){
    Deque<String> q=new ArrayDeque<>();q.offerLast("A");q.offerLast("B");
    System.out.println(q.pollFirst());q.offerFirst("urgent");
    System.out.println(q.pollFirst());System.out.println(q.pollLast());
    System.out.println(q.pollFirst());
  }`,
    "A\nurgent\nB\nnull",
    [
      ["Enqueue", ["front:A", "back:B"], "offerLast adds arrivals."],
      ["Dequeue", ["front/back:B"], "pollFirst returns A."],
      ["Prepend", ["front:urgent", "back:B"], "A deque permits insertion at the opposite end too."],
      [
        "Drain",
        ["empty"],
        "pollFirst returns urgent; pollLast returns B; another poll returns null.",
      ],
    ],
    "ArrayDeque endpoint operations O(1) amortized; searching/removing a value O(n); storage O(n).",
    "add/remove/element use exceptions for failure; offer/poll/peek use special return values. ArrayDeque initial capacity is not a hard bound. PriorityQueue iteration is not sorted order.",
    "Use FIFO for local work scheduling; use PriorityQueue with Comparator.comparingInt for priority scheduling. Its offer/poll cost O(log n), peek O(1). Use a sequence number to break equal-priority ties when needed.",
    "When should you use LinkedList as a queue?",
    "When its additional list behavior is actually required. Prefer an ArrayDeque for a simple single-threaded FIFO; choose a concurrent or blocking queue when threads share work.",
  ),
  make(
    "ring-buffer",
    "Build a bounded circular queue",
    "A ring buffer reuses a fixed array. head identifies the next removal and size distinguishes empty from full. Insertion uses (head+size) modulo capacity; removal advances head modulo capacity. No shifting is necessary.",
    "0 ≤ size ≤ capacity; the live values occupy size logical positions starting at head, wrapping at capacity.",
    `  static class Ring {
    final int[] a;int head,size;
    Ring(int n){if(n<=0)throw new IllegalArgumentException();a=new int[n];}
    boolean offer(int v){if(size==a.length)return false;a[(head+size)%a.length]=v;size++;return true;}
    Integer poll(){if(size==0)return null;int v=a[head];head=(head+1)%a.length;size--;return v;}
  }
  public static void main(String[] args){Ring r=new Ring(3);r.offer(10);r.offer(20);r.offer(30);
    System.out.println(r.offer(40));System.out.println(r.poll());r.offer(40);
    while(r.size>0)System.out.println(r.poll());
  }`,
    "false\n10\n20\n30\n40",
    [
      ["Full", ["0:10 head", "1:20", "2:30"], "size=3; reject another offer."],
      ["Poll", ["0:stale", "1:20 head", "2:30"], "Return 10; size=2."],
      ["Wrap", ["0:40", "1:20 head", "2:30"], "The new tail wraps to index 0."],
      ["Logical order", ["20", "30", "40"], "Logical order differs from physical array order."],
    ],
    "O(1) per operation and O(capacity) storage.",
    "A zero capacity makes modulo invalid. For object arrays clear removed slots to release references. This implementation is not thread-safe.",
    "Use bounded buffers for telemetry batches with a deliberate full policy: reject, block, overwrite oldest, or drop newest. These policies have different data-loss semantics.",
    "How do you implement a queue using two stacks?",
    "Push into an input stack. When output is empty, transfer all input elements to output. Poll output. Each value transfers once, giving amortized O(1), with O(n) worst-case transfer.",
  ),
  make(
    "bfs",
    "Breadth-first search with a queue",
    "BFS explores vertices in increasing edge distance from the source in an unweighted graph. Mark visited on enqueue so cycles and multiple incoming edges cannot schedule a vertex repeatedly. A queue holds the frontier.",
    "Every queued vertex has a final shortest unweighted distance, and queue distances are nondecreasing.",
    `  static int[] distances(int[][] graph,int start){
    int[] d=new int[graph.length];Arrays.fill(d,-1);d[start]=0;
    Queue<Integer> q=new ArrayDeque<>();q.offer(start);
    while(!q.isEmpty()){int v=q.poll();for(int w:graph[v])if(d[w]==-1){d[w]=d[v]+1;q.offer(w);}}
    return d;
  }
  public static void main(String[] args){System.out.println(Arrays.toString(distances(new int[][]{{1,2},{3},{3},{},{}},0)));}`,
    "[0, 1, 1, 2, -1]",
    [
      ["Source", ["queue:0", "d[0]=0"], "Initialize every other distance to -1."],
      ["Expand 0", ["queue:1 → 2", "d[1]=1", "d[2]=1"], "Enqueue both neighbors."],
      ["Expand 1", ["queue:2 → 3", "d[3]=2"], "Discover 3."],
      ["Expand 2,3", ["empty", "d[4]=-1"], "3 is already discovered; 4 is unreachable."],
    ],
    "O(V+E) time and O(V) extra space for an adjacency list.",
    "This example assumes valid vertex IDs and start. Weighted edges need an appropriate algorithm; ordinary FIFO BFS does not solve arbitrary weighted shortest paths.",
    "Use BFS for dependency distance, minimum hops, or grid spreading. Capture queue size before a level loop to process exactly one layer. Store parent[w]=v to reconstruct a route.",
    "How do multiple sources change BFS?",
    "Set all source distances to zero and enqueue all sources initially. Each discovered vertex gets its distance to the nearest source.",
  ),
  make(
    "window",
    "Monotonic deque: sliding window maximum",
    "Keep candidate indices in decreasing value order. Remove expired indices at the front and dominated values at the back. The front is the maximum of the current window; smaller earlier values can never win against the newer larger value.",
    "All deque indices lie in the current window and their values strictly decrease from front to back.",
    `  static int[] max(int[] a,int k){
    if(k<1||k>a.length)throw new IllegalArgumentException("window");
    int[] out=new int[a.length-k+1];Deque<Integer> q=new ArrayDeque<>();
    for(int i=0;i<a.length;i++){
      while(!q.isEmpty()&&q.peekFirst()<=i-k)q.pollFirst();
      while(!q.isEmpty()&&a[q.peekLast()]<=a[i])q.pollLast();
      q.offerLast(i);if(i>=k-1)out[i-k+1]=a[q.peekFirst()];
    }return out;
  }
  public static void main(String[] args){System.out.println(Arrays.toString(max(new int[]{1,3,-1,-3,5,3},3)));}`,
    "[3, 3, 5, 5]",
    [
      ["Window 1,3,-1", ["1:3", "2:-1"], "3 dominates 1; output 3."],
      ["Window 3,-1,-3", ["1:3", "2:-1", "3:-3"], "Output 3 again."],
      ["Window -1,-3,5", ["4:5"], "Expire index 1, then remove smaller candidates; output 5."],
      ["Window -3,5,3", ["4:5", "5:3"], "Output 5; 3 remains a future candidate."],
    ],
    "O(n) time and O(k) auxiliary space, excluding output.",
    "Store indices, not just values, to expire duplicates correctly. Validate k and define empty-input behavior explicitly.",
    "Use for rolling peaks in ordered measurements. Time-based windows expire using timestamps instead of i-k; out-of-order arrivals need a separate policy.",
    "Why is the nested loop linear overall?",
    "Each index enters once and leaves at most once, either by expiration or domination. Total deque operations are O(n).",
  ),
  make(
    "blocking",
    "Production queues: capacity, backpressure and shutdown",
    "A producer that outpaces its consumer can exhaust memory with an unbounded queue. ArrayBlockingQueue imposes a capacity. offer can reject work, timed offer can wait within a budget, and put waits until space exists. Thread safety does not imply persistence or exactly-once processing.",
    "Accepted pending jobs never exceed the configured queue capacity.",
    `  public static void main(String[] args) throws InterruptedException {
    BlockingQueue<String> jobs=new ArrayBlockingQueue<>(2);
    System.out.println(jobs.offer("A"));System.out.println(jobs.offer("B"));
    System.out.println(jobs.offer("C"));System.out.println(jobs.take());
    System.out.println(jobs.offer("C"));System.out.println(jobs);
  }`,
    "true\ntrue\nfalse\nA\ntrue\n[B, C]",
    [
      ["Offer A", ["A", "free"], "One slot remains."],
      ["Offer B", ["A", "B"], "At capacity."],
      ["Offer C", ["A", "B"], "false reports overload; caller must handle it."],
      ["Consume then retry", ["B", "C"], "Taking A frees one slot; retry succeeds."],
    ],
    "ArrayBlockingQueue endpoint work O(1), plus lock contention or waiting. Storage O(capacity).",
    "Do not check remainingCapacity then assume offer will succeed: another producer can race. Do not swallow InterruptedException; propagate it or restore interruption and stop appropriately.",
    "Define retry limits, overload responses, queue-depth/age metrics, and shutdown behavior. Interrupt workers or use an explicit poison message per consumer. For durable jobs across restarts, use a broker or persistent job store and idempotent handlers.",
    "Does take followed by a database write form one transaction?",
    "No. A crash after take can lose in-memory work. A durable acknowledgement protocol and idempotency key are needed when retries or restarts matter.",
  ),
];

const hashing = [
  make(
    "hash-contract",
    "Hash tables: buckets, collisions, equals and hashCode",
    "A hash selects a bucket; equality identifies the key within that bucket. Different keys can collide and must remain distinct. A teaching implementation can chain entries in lists; open addressing instead probes slots and requires a deletion marker or rehashing to preserve probe paths. Resize redistributes entries into a larger bucket array.",
    "Equal keys must have equal hash codes. Hash collisions alone never imply key equality.",
    `  record Key(String value) { public int hashCode(){return 7;} }
  public static void main(String[] args){
    Map<Key,Integer> m=new HashMap<>();m.put(new Key("A"),10);m.put(new Key("B"),20);
    m.put(new Key("A"),30);System.out.println(m.size());
    System.out.println(m.get(new Key("A")));System.out.println(m.get(new Key("B")));
  }`,
    "2\n30\n20",
    [
      [
        "Insert A",
        ["bucket h: A=10"],
        "Conceptual bucket; no claim about a particular JDK bucket index.",
      ],
      ["Collision", ["bucket h: A=10 | B=20"], "B hashes the same but is not equal to A."],
      [
        "Update A",
        ["bucket h: A=30 | B=20"],
        "An equal key replaces the value, not the number of entries.",
      ],
      ["Lookup B", ["hash → bucket → equals → 20"], "Equality distinguishes the collision."],
    ],
    "Expected O(1) lookup/update with well-distributed hashes; poor hashing can degrade operations. Storage O(n+capacity). Resize is O(n), amortized across inserts.",
    "Do not mutate fields used by equals/hashCode while a key is stored. Java records are only shallowly immutable. Arrays use identity equality unless wrapped with deliberate content semantics.",
    "Use immutable value keys for indexes. Load factor is size/capacity: more spare buckets trade memory for shorter searches. HashMap tree bins are an implementation optimization, not a universal O(1) guarantee.",
    "How do you map negative hashes to a custom table index?",
    "For arbitrary positive capacity, Math.floorMod(hash, capacity) avoids negative indices. Math.abs(Integer.MIN_VALUE) remains negative. A custom put must search for an equal key before adding a new entry.",
  ),
  make(
    "map-api",
    "HashMap, Hashtable, ordering and concurrent maps",
    "HashMap is the normal general-purpose map when a single thread owns it. Hashtable is a legacy synchronized map that rejects null keys and values. LinkedHashMap maintains encounter order; TreeMap provides sorted keys with logarithmic operations. ConcurrentHashMap supports concurrent access and rejects nulls.",
    "Use an atomic map operation when the update depends on the existing value; individual thread-safe calls do not make a read-modify-write sequence atomic.",
    `  public static void main(String[] args){
    Map<String,Integer> counts=new LinkedHashMap<>();
    for(String word:List.of("java","queue","java"))counts.merge(word,1,Integer::sum);
    System.out.println(counts);
    Hashtable<String,Integer> legacy=new Hashtable<>();legacy.put("java",2);System.out.println(legacy.get("java"));
    ConcurrentHashMap<String,Integer> shared=new ConcurrentHashMap<>();shared.merge("jobs",1,Integer::sum);
    System.out.println(shared.get("jobs"));
  }`,
    "{java=2, queue=1}\n2\n1",
    [
      ["java", ["java=1"], "Absent merge inserts 1."],
      ["queue", ["java=1", "queue=1"], "LinkedHashMap retains first insertion order."],
      ["java again", ["java=2", "queue=1"], "merge combines the old value and incoming 1."],
      [
        "Concurrent counter",
        ["jobs=1"],
        "ConcurrentHashMap.merge performs this per-key update atomically.",
      ],
    ],
    "Hash-based operations expected O(1); TreeMap O(log n). Iteration costs depend on representation; HashMap scans capacity plus entries.",
    "HashMap permits a null key and null values, so get returning null does not prove absence; use containsKey. Do not assume iteration order. computeIfAbsent is not a transaction over external side effects.",
    "Use ConcurrentHashMap<K,LongAdder> for high-contention approximate monitoring counters; sum is not a transactional snapshot. Use explicit locking or a database transaction for invariants spanning several keys.",
    "Is Hashtable.get followed by Hashtable.put a safe increment?",
    "No. Another thread can change the value between calls. Use a suitable atomic update operation or synchronize the whole compound action.",
  ),
  make(
    "two-sum",
    "Hashing interviews: two sum, duplicates and frequencies",
    "For each value x, ask whether target−x appeared earlier. Checking before inserting prevents reusing the same index. The map stores one representative index per value, sufficient when the contract asks for any one pair.",
    "Before processing index i, the map contains only indices smaller than i.",
    `  static int[] pair(int[] a,int target){
    Map<Long,Integer> seen=new HashMap<>();
    for(int i=0;i<a.length;i++){
      long need=(long)target-a[i];Integer j=seen.get(need);
      if(j!=null)return new int[]{j,i};seen.put((long)a[i],i);
    }return new int[0];
  }
  public static void main(String[] args){System.out.println(Arrays.toString(pair(new int[]{2,7,11,15},9)));System.out.println(Arrays.toString(pair(new int[]{3,3},6)));}`,
    "[0, 1]\n[0, 1]",
    [
      ["i=0, x=2", ["need:7", "seen:empty"], "No match yet."],
      ["Store", ["2 → index 0"], "Only previous indices enter seen."],
      ["i=1, x=7", ["need:2", "seen[2]=0"], "A distinct earlier index exists."],
      ["Return", ["index 0", "index 1"], "2+7=9."],
    ],
    "Expected O(n) time, O(n) space.",
    "Cast before subtracting to avoid int overflow. Clarify any pair versus all pairs and whether output is indices or values.",
    "Frequency maps support inventory aggregation; HashSet supports deduplication. For group anagrams, use a canonical sorted string key or an immutable frequency signature with a stated alphabet.",
    "How do you solve longest consecutive sequence without sorting?",
    "Put values in a set. Start a run only where the predecessor is absent; extend through successors. Guard Integer.MIN_VALUE/MAX_VALUE overflow or store longs. Each run is visited once, giving expected O(n).",
  ),
  make(
    "prefix-map",
    "Prefix sums plus a hash map: count subarrays",
    "If prefix[j]−prefix[i]=k, the subarray from i through j−1 sums to k. Count earlier prefixes equal to current−k. Unlike a simple shrinking window, this method works with negative values and zeros.",
    "Before counting at the current position, freq records exactly the prefixes before that position, including the empty prefix zero.",
    `  static long count(int[] a,long k){
    Map<Long,Long> freq=new HashMap<>();freq.put(0L,1L);long sum=0,total=0;
    for(int x:a){sum+=x;total+=freq.getOrDefault(sum-k,0L);freq.merge(sum,1L,Long::sum);}return total;
  }
  public static void main(String[] args){System.out.println(count(new int[]{1,-1,1},1));System.out.println(count(new int[]{0,0,0},0));}`,
    "3\n6",
    [
      [
        "Seed",
        ["freq[0]=1", "total=0"],
        "The empty prefix permits subarrays beginning at index 0.",
      ],
      ["Read 1", ["sum=1", "need=0", "total=1"], "Count one prior zero, then store prefix 1."],
      ["Read -1", ["sum=0", "need=-1", "total=1"], "No match; freq[0] becomes 2."],
      [
        "Read 1",
        ["sum=1", "need=0", "total=3"],
        "Two prior zeros produce two additional subarrays.",
      ],
    ],
    "Expected O(n) time and O(n) space.",
    "Store frequencies, not just presence. Insert after querying to avoid counting an empty subarray when k=0. long handles ordinary int-array sums/counts; sum-k still needs a bounded k contract to avoid long overflow.",
    "Use prefix counting for offline contiguous balance analysis. For the longest subarray instead of the count, store the earliest index for each prefix rather than a frequency.",
    "Why do three zeros produce six subarrays?",
    "There are 3+2+1 nonempty intervals. The prefix-zero frequency grows from 1 to 4, contributing 1, then 2, then 3.",
  ),
  make(
    "lru",
    "Project capstone: bounded LRU cache",
    "An LRU cache evicts the least recently accessed entry. The classic design combines a map from keys to nodes with a doubly linked recency list: map lookup locates a node and constant-time unlink/relink moves it to the most-recent end. Java LinkedHashMap can maintain access order for this small single-threaded implementation.",
    "After each completed put, size is at most capacity; iteration runs from least recently used to most recently used.",
    `  static class Lru<K,V> extends LinkedHashMap<K,V>{
    final int capacity;
    Lru(int c){super(16,0.75f,true);if(c<1)throw new IllegalArgumentException();capacity=c;}
    protected boolean removeEldestEntry(Map.Entry<K,V> e){return size()>capacity;}
  }
  public static void main(String[] args){
    Lru<String,Integer> c=new Lru<>(2);c.put("A",1);c.put("B",2);c.get("A");c.put("C",3);
    System.out.println(c);System.out.println(c.containsKey("B"));
  }`,
    "{A=1, C=3}\nfalse",
    [
      ["put A,B", ["LRU:A", "MRU:B"], "Both entries fit."],
      ["get A", ["LRU:B", "MRU:A"], "Access moves A to the recent end."],
      ["put C", ["B", "A", "C"], "Insertion temporarily exceeds capacity."],
      ["Evict", ["LRU:A", "MRU:C"], "The eldest entry B is removed."],
    ],
    "Expected O(1) get/put; O(capacity) storage.",
    "An access-order get changes recency and is a mutation. This cache is not thread-safe, has no TTL, and does not coordinate concurrent loads. Entry count is not a byte budget.",
    "Extend the design with expiration, bounded weight, hit/miss metrics and load-failure policy. Use a production cache implementation when those requirements matter; do not retain secrets or mutable shared values accidentally.",
    "Design tests and explain how to implement LRU without LinkedHashMap.",
    "Test capacity one, repeated get, updating a key, eviction and invalid capacity. Use two sentinels in a doubly linked list plus a HashMap<K,Node>; unlink on hit, append at MRU, and remove the LRU node from both structures when full.",
  ),
];

export const javaStructureGroups = [
  ["java-linked-lists", "Linked lists in Java", linked],
  ["java-stacks", "Stacks in Java", stack],
  ["java-queues-deques", "Queues and deques in Java", queue],
  ["java-hash-tables", "Hash tables in Java", hashing],
];
export const javaStructureSections = javaStructureGroups.map(([slug, title, lessons]) => ({
  slug,
  title,
  lessons: lessons.map((item) => ({
    title: item.title,
    slug: `${slug}--${item.id}`,
    sectionSlug: slug,
    time: "20 min",
  })),
}));
export const javaStructureLessons = Object.fromEntries(
  javaStructureGroups.flatMap(([slug, , lessons]) =>
    lessons.map((item) => [`${slug}--${item.id}`, item]),
  ),
);
