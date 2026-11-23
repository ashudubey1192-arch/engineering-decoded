// Original examples; reference links are reading guides, not copied implementations.
const topic = (title, text, snippet) => [title, text, snippet];
export const futureTopics = [
 topic('Future, CompletionStage and manual completion', 'A Future is a receipt for work. CompletionStage describes what should happen after that work. CompletableFuture implements both. A new instance starts pending; complete(value), completeExceptionally(error), or cancel(false) settles it. The first successful completion wins. This is useful when adapting an existing callback API.', 'CompletableFuture<Integer> receipt = new CompletableFuture<>();\nreceipt.complete(42);\nSystem.out.println(receipt.join()); // 42'),
 topic('Creating work: runAsync, supplyAsync and completedFuture', 'Use runAsync for an action with no result (Runnable), supplyAsync for a calculation (Supplier), and completedFuture for a cached value. Scheduling work is different from waiting for it. Keep the returned future so you can observe failures and wait at an application boundary.', 'CompletableFuture<Void> audit = CompletableFuture.runAsync(() -> {});\nCompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 120);\nCompletableFuture<Integer> cached = CompletableFuture.completedFuture(120);'),
 topic('Transform, consume and continue', 'thenApply changes a value. thenAccept reads a value and returns Void. thenRun needs neither an input nor a result. Each creates a dependent stage: a failure skips ordinary success callbacks. Keep the final stage, because waiting for the original does not wait for its dependents.', 'CompletableFuture.completedFuture(120)\n    .thenApply(n -> n - 20)\n    .thenAccept(System.out::println)\n    .thenRun(() -> System.out.println("receipt ready"))\n    .join();'),
 topic('thenApply versus thenCompose', 'A transformation returning a plain value belongs in thenApply. If it returns another future, thenCompose connects that future to the pipeline. Using thenApply for an asynchronous lookup produces a nested future and waiting for the outer one does not guarantee the inner work finished.', 'CompletableFuture<Integer> total = CompletableFuture.completedFuture(100)\n    .thenCompose(n -> CompletableFuture.supplyAsync(() -> n + 18));'),
 topic('Independent branches: thenCombine and thenAcceptBoth', 'Start independent jobs before joining them. thenCombine waits for both successful values and computes a result. thenAcceptBoth consumes both values without producing a new value. These operations express dependencies; they do not by themselves create worker threads.', 'var base = CompletableFuture.completedFuture(100);\nvar delivery = CompletableFuture.completedFuture(25);\nSystem.out.println(base.thenCombine(delivery, Integer::sum).join());\nbase.thenAcceptBoth(delivery, (a, b) -> System.out.println(a + b)).join();'),
 topic('allOf, collecting results and anyOf', 'allOf is a completion barrier with a Void result; collect each value after the barrier succeeds. It waits for all inputs, including when one fails. anyOf returns Object and follows the first completion, including failure. Neither method cancels losing or sibling tasks. An empty allOf completes immediately; an empty anyOf stays pending.', 'var jobs = java.util.List.of(CompletableFuture.completedFuture(3), CompletableFuture.completedFuture(7));\nvar values = CompletableFuture.allOf(jobs.toArray(CompletableFuture[]::new))\n    .thenApply(v -> jobs.stream().map(CompletableFuture::join).toList());\nSystem.out.println(values.join()); // [3, 7]\nSystem.out.println(CompletableFuture.anyOf(jobs.get(0)).join()); // 3'),
 topic('get, join and cancellation', 'get waits interruptibly and reports checked InterruptedException or ExecutionException; its timed overload can stop waiting without changing the future. join also blocks, but reports completion failure through unchecked CompletionException. Cancellation is reported by CancellationException. cancel(true) on CompletableFuture does not interrupt its running supplier: cancellation of the result and cancellation of the operation are separate concerns.', 'var cancelled = new CompletableFuture<String>();\ncancelled.cancel(true);\nSystem.out.println(cancelled.isCancelled()); // true'),
 topic('Recovery and observation', 'exceptionally replaces only failures with a fallback. handle transforms either success or failure. whenComplete observes both and normally preserves the outcome; throwing from an observer can turn success into failure. completeExceptionally bridges a failing callback. Log the underlying cause and do not silently convert every failure into a misleading success.', 'CompletableFuture.<Integer>failedFuture(new IllegalStateException("offline"))\n    .whenComplete((value, error) -> System.out.println("observed failure"))\n    .exceptionally(error -> 0)\n    .thenAccept(System.out::println).join();\nSystem.out.println(CompletableFuture.completedFuture(8).handle((v, e) -> e == null ? v * 2 : 0).join());'),
 topic('Async variants and choosing an executor', 'Non-async callbacks may run on the completing thread or on the caller attaching a callback to an already completed stage. Async variants submit to an executor; the default is normally the common ForkJoinPool (with a thread-per-task fallback when its parallelism is below two). An explicit executor controls scheduling, not automatic parallelism between dependent stages. Use a separate executor for blocking operations and close executors you own.', 'try (var pool = Executors.newFixedThreadPool(2)) {\n    System.out.println(CompletableFuture.supplyAsync(() -> 6, pool)\n        .thenApplyAsync(n -> n * 7, pool).join());\n} // ExecutorService.close requires Java 19+'),
 topic('Timeouts and delayed execution (Java 9+)', 'orTimeout completes the same future exceptionally when its deadline wins. completeOnTimeout completes the same future with a fallback. They do not stop the underlying I/O. A timed get only limits the caller waiting. delayedExecutor delays submission to a base executor; it does not hold a worker asleep. Configure connection and request deadlines separately.', 'var pending = new CompletableFuture<String>();\nSystem.out.println(pending.completeOnTimeout("cached", 1, TimeUnit.MILLISECONDS).join());\nvar expired = new CompletableFuture<String>();\nSystem.out.println(expired.orTimeout(1, TimeUnit.MILLISECONDS)\n    .exceptionally(e -> "deadline reached").join());\nCompletableFuture.runAsync(() -> {}, CompletableFuture.delayedExecutor(1, TimeUnit.MILLISECONDS)).join();'),
 topic('Java 9 completion and restricted views', 'completeAsync schedules a supplier to complete an existing future, using either its default executor or the supplied one. copy gives consumers an independently completable future reflecting the original; consumers cannot complete the original through the copy. minimalCompletionStage exposes composition operations; call toCompletableFuture to obtain a usable independent future for waiting. completedStage and failedStage create restricted already-settled stages; failedFuture creates an exceptional CompletableFuture.', 'var owner = new CompletableFuture<Integer>();\nvar copy = owner.copy();\nCompletionStage<Integer> view = owner.minimalCompletionStage();\nowner.completeAsync(() -> 9).join();\nSystem.out.println(copy.join());\nSystem.out.println(view.toCompletableFuture().join());\nCompletionStage<Integer> ok = CompletableFuture.completedStage(9);\nCompletionStage<Integer> bad = CompletableFuture.failedStage(new IllegalArgumentException("id"));'),
 topic('Subclass hooks: defaultExecutor and newIncompleteFuture', 'defaultExecutor chooses the executor for instance Async methods without an explicit executor. newIncompleteFuture is a factory hook used when dependent futures are created; overriding it preserves a custom subtype. It creates a fresh pending future, not a copy of the current result. Static supplyAsync is unaffected by an instance override. Prefer ordinary composition unless a library really needs a specialized future.', 'class LocalFuture<T> extends CompletableFuture<T> {\n    public Executor defaultExecutor() { return Runnable::run; } // inline, for demonstration\n    public <U> CompletableFuture<U> newIncompleteFuture() { return new LocalFuture<U>(); }\n}'),
 topic('Virtual threads, structured concurrency and choosing an approach', 'On Java 21+, a virtual-thread-per-task executor works well for many blocking I/O tasks. It does not make CPU calculations faster or remove database connection limits. Structured concurrency groups child tasks under a parent lifetime, with explicit joining and failure policies; its API is release-specific and was preview in JDK 25, so check the target JDK before using it. CompletableFuture remains useful for callback adapters and dependency graphs. Do not assume it automatically cancels siblings or propagates thread-local context.', 'try (var io = Executors.newVirtualThreadPerTaskExecutor()) {\n    var first = CompletableFuture.supplyAsync(() -> "stock", io);\n    var second = CompletableFuture.supplyAsync(() -> "delivery", io);\n    System.out.println(first.thenCombine(second, (a, b) -> a + " + " + b).join());\n}'),
 topic('Retries and production boundaries', 'Retry only transient failures and only when repeating an operation is safe. Bound attempts, use delayed scheduling with backoff, and keep a total deadline. Avoid join inside the same small pool that must execute the joined task. Put joins at the outer boundary; carry request identifiers explicitly, measure executor saturation, and define whether missing data should fail the request or use a fallback.', 'static CompletableFuture<String> retry(java.util.function.Supplier<CompletableFuture<String>> call, int left) {\n    return call.get().handle((v, e) -> {\n        if (e == null) return CompletableFuture.completedFuture(v);\n        if (left == 0) return CompletableFuture.<String>failedFuture(e);\n        return CompletableFuture.supplyAsync(() -> 0,\n            CompletableFuture.delayedExecutor(20, TimeUnit.MILLISECONDS))\n            .thenCompose(ignored -> retry(call, left - 1));\n    }).thenCompose(stage -> stage);\n} // supplier must return a future; validate retryable failures before calling')
];
export const depthTopics = {
 collections: [
 topic('Choosing by the operation, not the name', 'Write down ordering, duplicates, null support and dominant operations first. ArrayList gives constant-time indexing and amortized constant-time append; middle deletion shifts elements. LinkedList indexed access walks nodes. HashMap lookup is expected constant time with suitable hashing, while TreeMap maintains sorted keys with logarithmic operations. Benchmark realistic sizes; object allocation and cache locality matter.'),
 topic('Views, copies and compound operations', 'subList and unmodifiableList can remain backed by another list: changes through the owner may be visible. List.copyOf creates an unmodifiable snapshot and rejects nulls; neither choice deeply copies mutable elements. A synchronized collection protects individual calls, not a check-then-act sequence. ConcurrentHashMap.computeIfAbsent performs an atomic per-key computation; keep its mapping function short and avoid recursive updates.', 'var source = new java.util.ArrayList<>(java.util.List.of("A"));\nvar view = java.util.Collections.unmodifiableList(source);\nvar snapshot = java.util.List.copyOf(source);\nsource.add("B");\nSystem.out.println(view); // [A, B]\nSystem.out.println(snapshot); // [A]'),
 topic('Hash keys, equality and iterator contracts', 'Equal keys must have equal hash codes. Do not change fields involved in equality while an object is a map key. Collisions are normal and require equality checks. Fail-fast iteration detects some structural changes on a best-effort basis; it is not a thread-safety guarantee. Concurrent iterators may be weakly consistent, whereas CopyOnWriteArrayList iterators see a snapshot. Choose deliberately rather than calling every concurrent iterator fail-safe.')],
 exceptions: [
 topic('Preserve causes and suppressed cleanup failures', 'Catch an exception where you can recover or add useful context. Preserve its cause when translating it. In try-with-resources, resources close in reverse declaration order; if the body fails and close also fails, the body failure stays primary and cleanup failures are suppressed. A return in finally can hide both a result and an exception, so avoid it.', 'try {\n    Integer.parseInt("twelve");\n} catch (NumberFormatException cause) {\n    throw new IllegalArgumentException("quantity must be numeric", cause);\n}'),
 topic('Designing a failure contract', 'Use checked exceptions when callers should explicitly handle a recoverable condition in the API contract. Unchecked exceptions suit invalid arguments and invariant violations. Error usually indicates a serious runtime problem and is not a routine retry signal. Include useful identifiers without exposing secrets. Validate inputs before changing state, and test both the exception type and whether partial state escaped.')],
 threads: [
 topic('Interruption is cooperative cancellation', 'interrupt sets a request; it does not forcibly kill a thread. Blocking operations such as sleep and wait may throw InterruptedException and clear the flag. Propagate the exception if possible; otherwise restore the flag and leave the task. Do not restore it and continue an infinite blocking loop. Use join or a completion signal to observe shutdown; sleep is not a correctness mechanism.', 'Thread worker = new Thread(() -> {\n    try { Thread.sleep(10000); }\n    catch (InterruptedException e) { Thread.currentThread().interrupt(); }\n});\nworker.start();\nworker.interrupt();\nworker.join();'),
 topic('Visibility, atomicity and ordering are different', 'A volatile flag publishes writes performed before it, but volatile count++ still reads, adds and writes separately. Use an atomic counter for independent increments, or one lock for an invariant spanning several fields. A monitor unlock happens-before a later lock on that same monitor. Starting a thread publishes preceding writes; successfully joining it makes its completed actions visible.')],
 concurrency: [
 topic('Bound queues and define overload behavior', 'A pool is an admission-control decision as well as a thread count. An unbounded queue can grow while latency and memory usage climb. Use bounded queues and choose rejection, caller-runs or load shedding deliberately. Caller-runs can slow producers but may block an event-loop caller. Keep CPU work sized to available processors and bound external I/O by downstream capacity.'),
 topic('Locks, cancellation and invariants', 'Use try/finally to release locks and permits. Acquire multiple locks in a consistent order. Prefer interruptible waits when cancellation matters. A semaphore limits simultaneous access, a latch waits for one terminal milestone, and a barrier coordinates repeated phases. Test invariants with many interleavings instead of asserting a single print order.')]
};

const makeLesson = (title, topics, code, intro) => ({
 title, intro, topics, code,
 walk: 'Run this program with JDK 21 or newer. Follow each printed result back to its operation. The examples use small deterministic inputs so you can verify the invariant before trying larger inputs. Each resource owned by the example is closed before main returns.',
 anim: [title, [['in','Input','request'],['work','Operation','apply rule'],['out','Result','verify invariant']], [['in','work','submit','The input enters the operation with its initial state.'],['work','work','check','Check the contract before changing state or creating dependent work.'],['work','out','complete','Publish the result after the operation has completed successfully.'],['out','in','verify','Compare the observed result with the expected invariant before the next operation.']]],
 mistakes: ['Do not confuse an educational implementation with the full JDK contract; read the stated limits before adapting it.', 'Do not rely on one successful example: test empty inputs, failures and repeated operations too.'],
 qa: [['Why use small examples?', 'They make each state change and invariant easy to inspect before adding production concerns.'], ['How should failures be tested?', 'Exercise invalid inputs and confirm that errors preserve the original cause and leave state consistent.'], ['What should be measured?', 'Measure the operations and resource usage that dominate your actual workload rather than trusting a single timing.']],
 ex: ['Change one input and predict the printed output before running it. Add a failure case and explain which invariant must still hold.', 'Compare the changed result with the contract for that operation. A failure should be observable, and resources or data structures must remain in a valid state.']
});
export const completableLesson = makeLesson('CompletableFuture: From First Result to Reliable Pipelines', futureTopics, String.raw`import java.util.*;
import java.util.concurrent.*;
public class Main {
    public static void main(String[] args) throws Exception {
        try (var workers = Executors.newFixedThreadPool(2)) {
            var manual = new CompletableFuture<Integer>();
            manual.complete(10);
            System.out.println("manual=" + manual.get());
            var price = CompletableFuture.supplyAsync(() -> 100, workers);
            var shipping = CompletableFuture.supplyAsync(() -> 25, workers);
            var total = price.thenCombine(shipping, Integer::sum)
                .thenCompose(n -> CompletableFuture.supplyAsync(() -> n - 5, workers));
            total.thenAccept(n -> System.out.println("total=" + n))
                .thenRun(() -> System.out.println("receipt ready")).join();
            var jobs = List.of(price, shipping);
            System.out.println("all=" + CompletableFuture.allOf(jobs.toArray(CompletableFuture[]::new))
                .thenApply(v -> jobs.stream().map(CompletableFuture::join).toList()).join());
            System.out.println("any=" + CompletableFuture.anyOf(price).join());
            var broken = CompletableFuture.<Integer>failedFuture(new IllegalStateException("offline"));
            System.out.println("fallback=" + broken.exceptionally(e -> 0).join());
            System.out.println("handled=" + broken.handle((v, e) -> e == null ? v : -1).join());
            var pending = new CompletableFuture<String>();
            System.out.println("timeout=" + pending.completeOnTimeout("cached", 1, TimeUnit.MILLISECONDS).join());
            System.out.println("deadline=" + new CompletableFuture<String>().orTimeout(1, TimeUnit.MILLISECONDS)
                .exceptionally(e -> e.getClass().getSimpleName()).join());
            var owner = new CompletableFuture<Integer>();
            var copy = owner.copy();
            var view = owner.minimalCompletionStage();
            owner.completeAsync(() -> 9, workers).join();
            System.out.println("views=" + copy.join() + ":" + view.toCompletableFuture().join());
            CompletableFuture.runAsync(() -> {}, CompletableFuture.delayedExecutor(1, TimeUnit.MILLISECONDS, workers)).join();
            var cancelled = new CompletableFuture<Integer>();
            cancelled.cancel(true);
            System.out.println("cancelled=" + cancelled.isCancelled());
        }
        try (var io = Executors.newVirtualThreadPerTaskExecutor()) {
            System.out.println("virtual=" + CompletableFuture.supplyAsync(() -> Thread.currentThread().isVirtual(), io).join());
        }
    }
}`, 'Build a small checkout pipeline while learning how futures represent pending results, connect dependent work, combine independent calls and report failures. This guide uses original examples and covers every CompletableFuture API family, including the Java 9 additions and modern execution choices.');
completableLesson.references = [
 ['Java 21 CompletableFuture API contract', 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html']
];
export const customLesson = makeLesson('Build Your Own ArrayList, Vector, HashMap, LinkedHashMap, HashSet and LinkedHashSet', [
 topic('Dynamic array and synchronized vector', 'Keep size separate from capacity. Append grows the array when full, indexed access checks bounds, and removal shifts the suffix left and clears the old last slot. Doubling gives amortized constant-time append, though an individual resize is linear. The vector below synchronizes each operation on the same object; compound client operations still need a shared lock.'),
 topic('Hash map with separate chaining', 'Spread a key hash into a bucket index, then compare keys along that bucket chain. Equal keys replace the existing value. Removing a node reconnects its predecessor. Resize above a load factor of 0.75 and rehash every entry because bucket positions depend on capacity. This implementation allows a null key and null values, so containsKey must not infer presence from get returning null.'),
 topic('Linked hash map: two independent orders', 'The same node participates in a bucket chain and a doubly linked insertion-order chain. Rehashing changes bucket links but leaves insertion-order links intact. Replacing a value keeps its position; removing and reinserting appends at the end. This educational implementation supports insertion order only, not the JDK access-order mode or treeified collision bins.'),
 topic('Sets reuse map membership', 'A set stores each element as a map key with a constant dummy value. add checks key presence, contains searches for the key, and remove deletes it. A plain hash set has no ordering contract; an ordered set uses the insertion chain. The code returns snapshots for inspection, not live views or JDK-compatible iterators.'),
 topic('Custom object keys and collision tests', 'The Key record deliberately returns the same hash for every key so the program exercises collision chains. Record equality still distinguishes its id values. Tests cover replacement, null keys, absent deletion, resizing, order preservation and duplicate insertion. These classes are teaching tools: only TinyVector synchronizes, and none implements the full java.util interfaces.')
], String.raw`import java.util.*;
public class Main {
    static class TinyList<E> {
        private Object[] data = new Object[2];
        private int size;
        public int size() { return size; }
        public void add(E value) {
            if (size == data.length) data = Arrays.copyOf(data, data.length * 2);
            data[size++] = value;
        }
        private void check(int i) { if (i < 0 || i >= size) throw new IndexOutOfBoundsException(i); }
        @SuppressWarnings("unchecked") public E get(int i) { check(i); return (E) data[i]; }
        public E remove(int i) {
            E old = get(i);
            System.arraycopy(data, i + 1, data, i, size - i - 1);
            data[--size] = null;
            return old;
        }
    }
    static class TinyVector<E> {
        private final TinyList<E> list = new TinyList<>();
        public synchronized void add(E value) { list.add(value); }
        public synchronized E get(int i) { return list.get(i); }
        public synchronized E remove(int i) { return list.remove(i); }
        public synchronized int size() { return list.size(); }
    }
    static class TinyMap<K,V> {
        static class Node<K,V> {
            final K key; V value; Node<K,V> bucketNext, before, after;
            Node(K k, V v, Node<K,V> next) { key=k; value=v; bucketNext=next; }
        }
        private Node<K,V>[] table;
        private int size;
        private final boolean ordered;
        private Node<K,V> first, last;
        @SuppressWarnings("unchecked") TinyMap(boolean ordered) {
            this.ordered = ordered; table = (Node<K,V>[]) new Node[4];
        }
        private int index(K key) { int h=Objects.hashCode(key); return (h ^ (h >>> 16)) & (table.length-1); }
        private Node<K,V> find(K key) {
            for (var n=table[index(key)]; n!=null; n=n.bucketNext) if (Objects.equals(key,n.key)) return n;
            return null;
        }
        public int size() { return size; }
        public boolean containsKey(K key) { return find(key)!=null; }
        public V get(K key) { var n=find(key); return n==null ? null : n.value; }
        public V put(K key,V value) {
            var existing=find(key);
            if (existing!=null) { V old=existing.value; existing.value=value; return old; }
            int i=index(key); var n=new Node<K,V>(key,value,table[i]); table[i]=n;
            if (ordered) {
                n.before=last;
                if (last==null) first=n; else last.after=n;
                last=n;
            }
            if (++size > table.length*0.75) grow();
            return null;
        }
        @SuppressWarnings("unchecked") private void grow() {
            var old=table; table=(Node<K,V>[]) new Node[old.length*2];
            for (var head:old) for (var n=head; n!=null;) {
                var next=n.bucketNext; int i=index(n.key);
                n.bucketNext=table[i]; table[i]=n; n=next;
            }
        }
        public V remove(K key) {
            int i=index(key); Node<K,V> previous=null;
            for(var n=table[i]; n!=null; n=n.bucketNext) {
                if (Objects.equals(n.key,key)) {
                    if(previous==null) table[i]=n.bucketNext; else previous.bucketNext=n.bucketNext;
                    if(ordered) {
                        if(n.before==null) first=n.after; else n.before.after=n.after;
                        if(n.after==null) last=n.before; else n.after.before=n.before;
                    }
                    size--; return n.value;
                }
                previous=n;
            }
            return null;
        }
        public List<K> keys() {
            var result=new ArrayList<K>();
            if(ordered) { for(var n=first;n!=null;n=n.after) result.add(n.key); }
            else { for(var head:table) for(var n=head;n!=null;n=n.bucketNext) result.add(n.key); }
            return result;
        }
    }
    static class TinyLinkedMap<K,V> extends TinyMap<K,V> { TinyLinkedMap() { super(true); } }
    static class TinySet<E> {
        private final TinyMap<E,Boolean> map;
        TinySet(boolean ordered) { map=new TinyMap<>(ordered); }
        public boolean add(E e) { if(map.containsKey(e)) return false; map.put(e,true); return true; }
        public boolean contains(E e) { return map.containsKey(e); }
        public boolean remove(E e) { return map.remove(e)!=null; }
        public List<E> values() { return map.keys(); }
    }
    static class TinyLinkedSet<E> extends TinySet<E> { TinyLinkedSet() { super(true); } }
    record Key(int id) { public int hashCode() { return 7; } }
    static void require(boolean ok) { if(!ok) throw new AssertionError("invariant failed"); }
    public static void main(String[] args) {
        var list=new TinyList<String>(); list.add("A"); list.add("B"); list.add("C");
        require(list.remove(1).equals("B") && list.get(1).equals("C"));
        try { list.get(9); throw new AssertionError(); } catch(IndexOutOfBoundsException expected) {}
        var vector=new TinyVector<Integer>(); vector.add(4); require(vector.remove(0)==4 && vector.size()==0);
        var map=new TinyMap<Key,String>(false);
        for(int i=0;i<20;i++) map.put(new Key(i),"v"+i);
        require(map.size()==20 && map.get(new Key(19)).equals("v19"));
        require(map.put(new Key(3),"updated").equals("v3"));
        require(map.remove(new Key(3)).equals("updated") && !map.containsKey(new Key(3)));
        map.put(null,null); require(map.containsKey(null)); map.remove(null); require(!map.containsKey(null));
        require(map.remove(new Key(99))==null);
        var linked=new TinyLinkedMap<Integer,String>();
        for(int i=0;i<20;i++) linked.put(i,"x");
        linked.put(0,"updated"); linked.remove(1); linked.put(1,"again");
        require(linked.keys().get(0)==0 && linked.keys().get(19)==1);
        var set=new TinySet<String>(false); require(set.add("A") && !set.add("A") && set.contains("A"));
        require(set.remove("A") && !set.remove("A"));
        var ordered=new TinyLinkedSet<String>(); ordered.add("B"); ordered.add("A"); ordered.add("B");
        require(ordered.values().equals(List.of("B","A")));
        System.out.println("All six custom collection checks passed");
        System.out.println("ordered set="+ordered.values());
    }
}`, 'Implement six familiar collection designs with original, small Java classes. Learn which invariants make growth, collision handling, insertion order and uniqueness work. Each one is a small teaching implementation with explicit limits and executable checks.');
