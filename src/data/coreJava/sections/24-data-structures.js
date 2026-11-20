import { lesson, section } from "../schema.js";

export default section("data-structures", "Java Data Structures", [
  lesson("Stack: Array-Based, Generic and a Stack of Employee Objects", {
    intro:
      "A stack is a last-in, first-out (LIFO) collection: the last element pushed is the first popped, like a pile of plates. Stacks power undo features, expression evaluation, backtracking and the JVM's own call stack. This lesson implements an array-based int stack, a resizable generic stack, uses it for Employee objects, and solves a classic problem with it.",
    topics: [
      [
        "Stack operations",
        "`push(x)` adds to the top, `pop()` removes and returns the top, `peek()` returns the top without removing it, `isEmpty()` and `size()`. All are O(1). Popping an empty stack is an error (stack underflow); pushing onto a full fixed-size stack is a stack overflow.",
      ],
      [
        "Array-based implementation",
        "Keep an array and a `top` index starting at -1. `push` increments top and stores the value; `pop` returns `a[top--]`. A fixed capacity is simple but can overflow; doubling the array when full gives amortised O(1) pushes.",
      ],
      [
        "Generic stack",
        "`class Stack<T>` stores `Object[]` internally (Java cannot create generic arrays directly) and casts on the way out with `@SuppressWarnings(\"unchecked\")`. After popping, set the slot to null so the object can be garbage collected.",
      ],
      [
        "Stacks of objects and the JDK",
        "A generic stack holds any type, such as `Stack<Employee>` for an undo history of edits. In real code use `ArrayDeque<T>` as a stack (`push`, `pop`, `peek`); the legacy `java.util.Stack` extends Vector and is synchronized and slower.",
      ],
    ],
    code: String.raw`import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;
import java.util.NoSuchElementException;

public class Main {
    static class IntStack {                               // fixed-size array stack
        private final int[] data;
        private int top = -1;
        IntStack(int capacity) { data = new int[capacity]; }
        void push(int x) {
            if (top == data.length - 1) throw new IllegalStateException("stack overflow");
            data[++top] = x;
        }
        int pop() {
            if (top == -1) throw new IllegalStateException("stack underflow");
            return data[top--];
        }
        int peek() { if (top == -1) throw new IllegalStateException("empty"); return data[top]; }
        boolean isEmpty() { return top == -1; }
    }

    static class Stack<T> {                               // resizable generic stack
        private Object[] items = new Object[2];
        private int size;
        void push(T item) {
            if (size == items.length) items = Arrays.copyOf(items, size * 2);
            items[size++] = item;
        }
        @SuppressWarnings("unchecked")
        T pop() {
            if (size == 0) throw new NoSuchElementException("empty stack");
            T item = (T) items[--size];
            items[size] = null;                           // let it be garbage collected
            return item;
        }
        @SuppressWarnings("unchecked") T peek() { return size == 0 ? null : (T) items[size - 1]; }
        int size() { return size; }
        boolean isEmpty() { return size == 0; }
    }

    record Employee(String name, int salary) { }

    static boolean balanced(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if ("([{".indexOf(c) >= 0) stack.push(c);
            else if (")]}".indexOf(c) >= 0) {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ("([{".indexOf(open) != ")]}".indexOf(c)) return false;
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        IntStack ints = new IntStack(3);
        ints.push(10); ints.push(20); ints.push(30);
        try { ints.push(40); } catch (IllegalStateException e) { System.out.println("push on full stack: " + e.getMessage()); }
        System.out.println("peek " + ints.peek() + ", pop " + ints.pop() + ", pop " + ints.pop() + ", pop " + ints.pop());
        try { ints.pop(); } catch (IllegalStateException e) { System.out.println("pop on empty stack: " + e.getMessage()); }

        Stack<Employee> history = new Stack<>();
        history.push(new Employee("Asha", 90));
        history.push(new Employee("Asha", 95));             // edit
        history.push(new Employee("Asha", 120));            // edit
        System.out.println("employee stack size " + history.size() + ", current " + history.peek());
        System.out.println("undo -> " + history.pop() + ", now " + history.peek());

        for (String expr : new String[] {"{[(a+b)*c]}", "(a+b]", "((a)"}) System.out.println("balanced " + expr + ": " + balanced(expr));

        Deque<String> jdkStack = new ArrayDeque<>();
        jdkStack.push("first"); jdkStack.push("second"); jdkStack.push("third");
        System.out.println("ArrayDeque as stack pops: " + jdkStack.pop() + ", " + jdkStack.pop() + ", " + jdkStack.pop());
    }
}`,
    walk:
      "`IntStack` uses an array and a top index: three pushes fill it, the fourth reports overflow, three pops return the values in reverse order (30, 20, 10), and one more pop reports underflow. The generic `Stack<T>` doubles its array when full and nulls out popped slots.\n\nA `Stack<Employee>` keeps an edit history: the top is the latest version, and popping undoes one edit. The bracket checker pushes opening brackets and pops on closing ones, detecting mismatches and leftovers. Finally `ArrayDeque` shows the recommended JDK stack.",
    anim: [
      "Push and pop (LIFO)",
      [
        ["p10", "push 10", "bottom"],
        ["p20", "push 20", "middle"],
        ["p30", "push 30", "top"],
        ["pop", "pop()", "returns 30"],
        ["peek", "peek()", "now 20"],
      ],
      [
        ["p10", "p20", "push", "Each push places a new element on top of the previous one."],
        ["p20", "p30", "push", "After three pushes, 30 is on top."],
        ["p30", "pop", "pop", "pop removes the most recently pushed element: 30 comes out first."],
        ["pop", "peek", "peek", "peek now shows 20 without removing it: last in, first out."],
      ],
    ],
    mistakes: [
      "Not checking for an empty stack before popping.",
      "Leaving references in popped slots (a memory leak in long-lived stacks).",
      "Using java.util.Stack in new code instead of ArrayDeque.",
    ],
    qa: [
      ["What is a stack?", "A LIFO data structure with push, pop and peek operations, all O(1)."],
      ["Why is ArrayDeque preferred over java.util.Stack?", "Stack extends Vector, so every call is synchronized and it exposes index-based methods; ArrayDeque is faster and has a clean deque API."],
      ["Give real uses of a stack.", "Undo/redo, browser back history, expression evaluation and bracket matching, depth-first search and the call stack."],
    ],
    ex: [
      "Reverse a string using the generic stack.",
      "Push every character, then pop them all into a StringBuilder: \"java\" becomes \"avaj\".",
    ],
  }),

  lesson("Queue, Priority Queue and Circular Queue", {
    intro:
      "A queue is first-in, first-out (FIFO): elements leave in the order they arrived, like a line at a ticket counter. A priority queue instead always releases the most important element first, and a circular queue reuses a fixed array efficiently. This lesson implements a generic circular queue and a priority queue (a binary heap), and compares them with the JDK classes.",
    topics: [
      [
        "Queue operations",
        "`enqueue`/`offer` adds at the rear, `dequeue`/`poll` removes from the front, `peek` looks at the front. All O(1) for a well-implemented queue. Uses: task scheduling, print queues, breadth-first search, buffering between producer and consumer.",
      ],
      [
        "Circular queue (ring buffer)",
        "A naive array queue wastes the slots before `front` after dequeues. A circular queue wraps indexes with modulo: `rear = (rear + 1) % capacity`, so freed slots are reused. Track `size` (or keep one slot empty) to tell full from empty. Used for fixed-size buffers such as keyboard input, audio buffers and logging.",
      ],
      [
        "Priority queue",
        "Removes the element with the highest priority (smallest by default) regardless of arrival order. Usually a binary heap stored in an array: children of index i are at 2i + 1 and 2i + 2. `offer` adds at the end and sifts up; `poll` moves the last element to the root and sifts down. Both O(log n), `peek` O(1).",
      ],
      [
        "JDK classes",
        "`ArrayDeque` (fast FIFO queue), `LinkedList` (also a Queue), `PriorityQueue` (min-heap, or max-heap with `Comparator.reverseOrder()` or a custom comparator) and the concurrent `ArrayBlockingQueue` (a bounded circular buffer). PriorityQueue's iterator does not return elements in priority order; only `poll` does.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static class CircularQueue<T> {
        private final Object[] items;
        private int front = 0, rear = -1, size = 0;
        CircularQueue(int capacity) { items = new Object[capacity]; }
        boolean enqueue(T item) {
            if (size == items.length) return false;              // full
            rear = (rear + 1) % items.length;                    // wrap around
            items[rear] = item;
            size++;
            return true;
        }
        @SuppressWarnings("unchecked")
        T dequeue() {
            if (size == 0) return null;
            T item = (T) items[front];
            items[front] = null;
            front = (front + 1) % items.length;
            size--;
            return item;
        }
        String layout() { return Arrays.toString(items) + " front=" + front + " rear=" + rear; }
    }

    static class MinHeap {                                       // priority queue as a binary heap
        private int[] heap = new int[8];
        private int size;
        void offer(int x) {
            if (size == heap.length) heap = Arrays.copyOf(heap, size * 2);
            heap[size] = x;
            int i = size++;
            while (i > 0 && heap[(i - 1) / 2] > heap[i]) { swap(i, (i - 1) / 2); i = (i - 1) / 2; }   // sift up
        }
        int poll() {
            int min = heap[0];
            heap[0] = heap[--size];
            int i = 0;
            while (true) {                                       // sift down
                int l = 2 * i + 1, r = l + 1, smallest = i;
                if (l < size && heap[l] < heap[smallest]) smallest = l;
                if (r < size && heap[r] < heap[smallest]) smallest = r;
                if (smallest == i) break;
                swap(i, smallest);
                i = smallest;
            }
            return min;
        }
        boolean isEmpty() { return size == 0; }
        private void swap(int a, int b) { int t = heap[a]; heap[a] = heap[b]; heap[b] = t; }
    }

    record Task(String name, int priority) { }

    public static void main(String[] args) {
        CircularQueue<String> ring = new CircularQueue<>(3);
        ring.enqueue("A"); ring.enqueue("B"); ring.enqueue("C");
        System.out.println("full queue, enqueue D: " + ring.enqueue("D"));
        System.out.println("dequeue " + ring.dequeue() + ", " + ring.dequeue());
        ring.enqueue("D"); ring.enqueue("E");                    // reuse freed slots
        System.out.println("after wrap-around: " + ring.layout());
        System.out.println("FIFO order: " + ring.dequeue() + " " + ring.dequeue() + " " + ring.dequeue() + ", empty -> " + ring.dequeue());

        MinHeap heap = new MinHeap();
        for (int x : new int[] {42, 7, 19, 3, 88, 25}) heap.offer(x);
        StringBuilder order = new StringBuilder();
        while (!heap.isEmpty()) order.append(heap.poll()).append(' ');
        System.out.println("custom min-heap poll order: " + order.toString().trim());

        PriorityQueue<Task> tasks = new PriorityQueue<>(Comparator.comparingInt(Task::priority).reversed());
        tasks.add(new Task("email", 2)); tasks.add(new Task("outage", 10)); tasks.add(new Task("lunch", 1)); tasks.add(new Task("review", 5));
        System.out.print("JDK PriorityQueue (highest first): ");
        while (!tasks.isEmpty()) System.out.print(tasks.poll().name() + " ");
        System.out.println();

        Queue<String> line = new ArrayDeque<>(List.of("first", "second", "third"));
        line.offer("fourth");
        System.out.println("ArrayDeque FIFO poll: " + line.poll() + ", peek: " + line.peek() + ", size " + line.size());
    }
}`,
    walk:
      "The circular queue holds three items; a fourth `enqueue` is refused. After two dequeues, two new items wrap around into the freed slots at the start of the array, as the layout shows (front at index 2, rear at index 1), and dequeuing returns everything in FIFO order.\n\nThe custom min-heap sifts each new value up and each removal down, so `poll` returns 3, 7, 19, 25, 42, 88 regardless of insertion order. A JDK `PriorityQueue` with a reversed comparator serves the highest-priority task first. `ArrayDeque` provides the ordinary FIFO queue.",
    anim: [
      "Circular queue wrap-around",
      [
        ["s0", "slot 0", "A then D"],
        ["s1", "slot 1", "B then E"],
        ["s2", "slot 2", "C"],
        ["front", "front", "dequeue here"],
        ["rear", "rear", "enqueue here"],
      ],
      [
        ["front", "s0", "dequeue", "Dequeuing A and B moves front forward to slot 2."],
        ["rear", "s2", "full", "rear was at slot 2 when the queue held A, B and C."],
        ["rear", "s0", "wrap", "(rear + 1) % 3 wraps to slot 0, so D reuses A's freed slot."],
        ["rear", "s1", "wrap", "E goes into slot 1; no array space is wasted."],
      ],
    ],
    mistakes: [
      "Implementing an array queue without wrap-around, wasting space and eventually failing.",
      "Confusing full and empty in a circular queue when front == rear; track the size.",
      "Expecting PriorityQueue iteration or toString to be in priority order.",
    ],
    qa: [
      ["What is the difference between a queue and a stack?", "A queue is FIFO (first in, first out); a stack is LIFO (last in, first out)."],
      ["How is a priority queue implemented?", "Usually as a binary heap in an array, giving O(log n) insert and remove-min and O(1) peek."],
      ["What is a circular queue?", "A fixed-size array queue whose indexes wrap around with modulo so freed slots are reused."],
    ],
    ex: [
      "Use a PriorityQueue to find the 3 largest numbers from a stream of 1 million numbers using little memory.",
      "Keep a min-heap of size 3: offer each number, and if the size exceeds 3, poll the smallest. At the end the heap holds the 3 largest. O(n log 3) time, O(3) memory.",
    ],
  }),

  lesson("Singly Linked List: Insert, Delete, Sorted Insert and Objects", {
    intro:
      "A singly linked list is a chain of nodes where each node holds a value and a reference to the next node. It supports cheap insertion and deletion at the front and anywhere you already have a reference, at the cost of no random access. This lesson implements a generic singly linked list with insert and delete at first and last, sorted insertion, deletion of a specific value, and stores Employee objects in it.",
    topics: [
      [
        "Structure",
        "Each `Node<T>` has `data` and `next`; the list keeps `head` (and optionally `tail` and `size`). The last node's `next` is null. Traversal starts at head and follows `next` until null: O(n).",
      ],
      [
        "Insert and delete at first",
        "Insert first: `newNode.next = head; head = newNode`. Delete first: `head = head.next`. Both O(1). This makes a singly linked list a natural stack.",
      ],
      [
        "Insert and delete at last",
        "With a `tail` reference, insert at last is O(1): `tail.next = newNode; tail = newNode`. Deleting the last node is O(n) in a singly linked list, because you must walk to the node before it to set its `next` to null.",
      ],
      [
        "Sorted insert and deleting a specific node",
        "Sorted insert walks until the next node's value is greater, then links the new node in between, keeping the list ordered. Deleting a specific value walks with a `prev` pointer and unlinks the match with `prev.next = current.next`, handling head and tail as special cases.",
      ],
      [
        "Generic lists and objects",
        "With `Node<T>` the same code stores Integers, Strings or `Employee` objects; sorted insertion then takes a `Comparator<T>`.",
      ],
    ],
    code: String.raw`import java.util.Comparator;
import java.util.function.Predicate;

public class Main {
    static class SinglyLinkedList<T> {
        private static class Node<T> { T data; Node<T> next; Node(T d) { data = d; } }
        private Node<T> head, tail;
        private int size;

        void insertFirst(T value) {
            Node<T> n = new Node<>(value);
            n.next = head;
            head = n;
            if (tail == null) tail = n;
            size++;
        }

        void insertLast(T value) {
            Node<T> n = new Node<>(value);
            if (tail == null) head = tail = n; else { tail.next = n; tail = n; }
            size++;
        }

        T deleteFirst() {
            if (head == null) return null;
            T v = head.data;
            head = head.next;
            if (head == null) tail = null;
            size--;
            return v;
        }

        T deleteLast() {                                     // O(n): need the node before tail
            if (head == null) return null;
            if (head == tail) return deleteFirst();
            Node<T> cur = head;
            while (cur.next != tail) cur = cur.next;
            T v = tail.data;
            cur.next = null;
            tail = cur;
            size--;
            return v;
        }

        void insertSorted(T value, Comparator<T> cmp) {
            if (head == null || cmp.compare(value, head.data) <= 0) { insertFirst(value); return; }
            Node<T> cur = head;
            while (cur.next != null && cmp.compare(cur.next.data, value) < 0) cur = cur.next;
            Node<T> n = new Node<>(value);
            n.next = cur.next;
            cur.next = n;
            if (n.next == null) tail = n;
            size++;
        }

        boolean delete(Predicate<T> match) {                 // delete a specific node
            Node<T> prev = null, cur = head;
            while (cur != null && !match.test(cur.data)) { prev = cur; cur = cur.next; }
            if (cur == null) return false;
            if (prev == null) head = cur.next; else prev.next = cur.next;
            if (cur == tail) tail = prev;
            size--;
            return true;
        }

        public String toString() {
            StringBuilder sb = new StringBuilder();
            for (Node<T> n = head; n != null; n = n.next) sb.append(n.data).append(n.next != null ? " -> " : "");
            return sb.append(" (size ").append(size).append(")").toString();
        }
    }

    record Employee(int id, String name) { public String toString() { return name + "#" + id; } }

    public static void main(String[] args) {
        SinglyLinkedList<Integer> list = new SinglyLinkedList<>();
        list.insertFirst(20); list.insertFirst(10); list.insertLast(30); list.insertLast(40);
        System.out.println("after inserts: " + list);
        System.out.println("deleteFirst " + list.deleteFirst() + ", deleteLast " + list.deleteLast() + " -> " + list);

        SinglyLinkedList<Integer> sorted = new SinglyLinkedList<>();
        for (int v : new int[] {50, 10, 40, 20, 30, 5}) sorted.insertSorted(v, Integer::compare);
        System.out.println("sorted inserts: " + sorted);
        System.out.println("delete 30: " + sorted.delete(v -> v == 30) + ", delete 99: " + sorted.delete(v -> v == 99) + " -> " + sorted);
        sorted.delete(v -> v == 5);
        sorted.delete(v -> v == 50);
        System.out.println("delete head and tail: " + sorted);

        SinglyLinkedList<Employee> staff = new SinglyLinkedList<>();
        Comparator<Employee> byId = Comparator.comparingInt(Employee::id);
        staff.insertSorted(new Employee(30, "Ravi"), byId);
        staff.insertSorted(new Employee(10, "Asha"), byId);
        staff.insertSorted(new Employee(20, "Meera"), byId);
        System.out.println("employees sorted by id: " + staff);
        staff.delete(e -> e.name().equals("Meera"));
        System.out.println("after deleting Meera: " + staff);
    }
}`,
    walk:
      "`insertFirst` links new nodes at the head and `insertLast` uses the tail reference, so the list becomes 10, 20, 30, 40. `deleteFirst` is O(1), while `deleteLast` walks to the second-to-last node to unlink the tail.\n\n`insertSorted` walks to the right position for each value, producing an ordered list from unordered input. `delete` with a predicate tracks the previous node to unlink a match, returns false when nothing matches, and correctly updates head and tail when the first or last node is removed. The same generic class stores `Employee` records sorted by id.",
    anim: [
      "Unlinking a node",
      [
        ["head", "head", "10"],
        ["prev", "prev: 20", "node before"],
        ["cur", "cur: 30", "to delete"],
        ["next", "40", "node after"],
        ["gc", "garbage", "30 unreachable"],
      ],
      [
        ["head", "prev", "walk", "Traversal moves prev and cur forward until cur holds 30."],
        ["prev", "next", "relink", "prev.next = cur.next makes 20 point directly to 40."],
        ["cur", "gc", "drop", "Nothing references the 30 node any more, so it becomes garbage."],
        ["head", "next", "result", "The list is now 10 -> 20 -> 40 with no shifting of elements."],
      ],
    ],
    mistakes: [
      "Forgetting to update `tail` when deleting the last node or inserting into an empty list.",
      "Losing the rest of the list by overwriting `next` before saving it.",
      "Using `==` to compare node data objects instead of equals or a predicate.",
    ],
    qa: [
      ["What is the time complexity of inserting at the head of a singly linked list?", "O(1)."],
      ["Why is deleting the last node O(n) in a singly linked list?", "You must reach the node before the tail to set its next to null, which requires traversal."],
      ["What are the advantages of a linked list over an array?", "O(1) insertion and deletion at known positions and no resizing; the drawbacks are O(n) access by index and extra memory per node."],
    ],
    ex: [
      "Add a method `T get(int index)` to the list. What is its complexity?",
      "Walk `index` steps from head and return that node's data, throwing IndexOutOfBoundsException if out of range: O(n).",
    ],
  }),

  lesson("Doubly Linked List: Insert, Delete and Sorted Insert", {
    intro:
      "A doubly linked list gives every node a `prev` pointer as well as `next`, so the list can be traversed in both directions and a node can be removed in O(1) when you have a reference to it. `java.util.LinkedList` is a doubly linked list. This lesson implements insert and delete at first, sorted insertion and deletion of a specific node.",
    topics: [
      [
        "Structure",
        "Each node has `prev`, `data` and `next`; the list keeps `head` and `tail`. The head's `prev` and the tail's `next` are null. Extra memory per node buys bidirectional traversal and O(1) deletion at both ends.",
      ],
      [
        "Insert and delete at first",
        "Insert first: `n.next = head; if (head != null) head.prev = n; head = n` (and set tail for an empty list). Delete first: `head = head.next; if (head != null) head.prev = null`. Both O(1). Delete last is also O(1) through `tail.prev`.",
      ],
      [
        "Sorted insert",
        "Walk until the next node is greater, then link the new node with four pointer updates: `n.prev = cur; n.next = cur.next; cur.next.prev = n; cur.next = n` (careful with the end of the list).",
      ],
      [
        "Deleting a specific node",
        "Find it, then `node.prev.next = node.next` and `node.next.prev = node.prev`, handling head and tail. No `prev` variable is needed during the search, unlike a singly linked list. LRU caches and LinkedHashMap rely on this O(1) unlink.",
      ],
    ],
    code: String.raw`public class Main {
    static class DoublyLinkedList {
        static class Node { int data; Node prev, next; Node(int d) { data = d; } }
        Node head, tail;

        void insertFirst(int value) {
            Node n = new Node(value);
            n.next = head;
            if (head != null) head.prev = n; else tail = n;
            head = n;
        }

        Integer deleteFirst() {
            if (head == null) return null;
            int v = head.data;
            head = head.next;
            if (head != null) head.prev = null; else tail = null;
            return v;
        }

        Integer deleteLast() {                                // O(1) thanks to prev
            if (tail == null) return null;
            int v = tail.data;
            tail = tail.prev;
            if (tail != null) tail.next = null; else head = null;
            return v;
        }

        void insertSorted(int value) {
            if (head == null || value <= head.data) { insertFirst(value); return; }
            Node cur = head;
            while (cur.next != null && cur.next.data < value) cur = cur.next;
            Node n = new Node(value);
            n.prev = cur;
            n.next = cur.next;
            if (cur.next != null) cur.next.prev = n; else tail = n;
            cur.next = n;
        }

        boolean delete(int value) {
            Node n = head;
            while (n != null && n.data != value) n = n.next;
            if (n == null) return false;
            if (n.prev != null) n.prev.next = n.next; else head = n.next;
            if (n.next != null) n.next.prev = n.prev; else tail = n.prev;
            return true;
        }

        String forward() {
            StringBuilder sb = new StringBuilder();
            for (Node n = head; n != null; n = n.next) sb.append(n.data).append(n.next != null ? " <-> " : "");
            return sb.toString();
        }

        String backward() {
            StringBuilder sb = new StringBuilder();
            for (Node n = tail; n != null; n = n.prev) sb.append(n.data).append(n.prev != null ? " <-> " : "");
            return sb.toString();
        }
    }

    public static void main(String[] args) {
        DoublyLinkedList list = new DoublyLinkedList();
        list.insertFirst(30); list.insertFirst(20); list.insertFirst(10);
        System.out.println("insertFirst x3: " + list.forward());
        System.out.println("deleteFirst " + list.deleteFirst() + ", deleteLast " + list.deleteLast() + " -> " + list.forward());

        DoublyLinkedList sorted = new DoublyLinkedList();
        for (int v : new int[] {40, 10, 30, 20, 50, 5}) sorted.insertSorted(v);
        System.out.println("sorted insert forward:  " + sorted.forward());
        System.out.println("sorted insert backward: " + sorted.backward());

        System.out.println("delete 30: " + sorted.delete(30) + " -> " + sorted.forward());
        sorted.delete(5);
        sorted.delete(50);
        System.out.println("delete head and tail: " + sorted.forward() + " | backward: " + sorted.backward());
        System.out.println("delete missing 99: " + sorted.delete(99));
    }
}`,
    walk:
      "Three `insertFirst` calls build 10 <-> 20 <-> 30, maintaining both `next` and `prev` pointers. Unlike in a singly linked list, `deleteLast` is O(1): it simply follows `tail.prev`.\n\n`insertSorted` links each value into place with four pointer updates, and printing the list forwards and backwards proves both directions are consistent. `delete` finds the node and splices it out using its own `prev` and `next`, including the special cases of the head (5) and the tail (50).",
    anim: [
      "Sorted insert in a doubly linked list",
      [
        ["a", "20", "cur"],
        ["n", "25 (new)", "to insert"],
        ["b", "30", "cur.next"],
        ["links", "4 pointers", "update"],
        ["res", "20 <-> 25 <-> 30", "linked"],
      ],
      [
        ["a", "b", "find", "Walk until the next node (30) is greater than the new value 25."],
        ["n", "a", "prev", "Set new.prev to 20 and new.next to 30."],
        ["b", "n", "back link", "Set 30.prev to the new node."],
        ["a", "res", "forward link", "Finally set 20.next to the new node: both directions stay consistent."],
      ],
    ],
    mistakes: [
      "Updating `next` but forgetting the matching `prev` (or the reverse), corrupting backward traversal.",
      "Forgetting to update head or tail when inserting or deleting at the ends.",
    ],
    qa: [
      ["What is the advantage of a doubly linked list over a singly linked list?", "Bidirectional traversal and O(1) deletion of a node (and of the last node) given a reference, at the cost of an extra pointer per node."],
      ["Is java.util.LinkedList singly or doubly linked?", "Doubly linked."],
      ["How many pointer updates does inserting in the middle require?", "Four: new.prev, new.next, next.prev and prev.next."],
    ],
    ex: [
      "Write `void reverse()` for the doubly linked list.",
      "For each node swap its prev and next pointers, then swap head and tail. Traversing forward afterwards gives the elements in reverse order.",
    ],
  }),

  lesson("Stack and Queue Implemented with a Linked List", {
    intro:
      "Arrays are not the only way to build stacks and queues. A linked list implementation grows without resizing and never wastes capacity: a stack pushes and pops at the head, and a queue adds at the tail and removes at the head. This lesson implements both generically and compares them with the array versions.",
    topics: [
      [
        "Linked stack",
        "Push creates a node whose `next` is the old head and makes it the new head; pop returns the head's data and moves head to `head.next`. Both O(1), with no capacity limit and no resizing, at the cost of one node object per element.",
      ],
      [
        "Linked queue",
        "Keep `head` (front) and `tail` (rear). Enqueue links a node after tail and moves tail; dequeue removes from head. Both O(1). When the queue becomes empty, set tail to null as well.",
      ],
      [
        "Linked vs array implementations",
        "Linked: no resizing, unbounded, O(1) worst case per operation, but more memory and poorer cache locality. Array: compact and cache friendly, amortised O(1) with occasional O(n) resizes (or a fixed capacity for circular buffers). `ArrayDeque` (array) is usually faster in Java; linked versions are clearer and useful in lock-free designs such as `ConcurrentLinkedQueue`.",
      ],
      [
        "Iteration",
        "Implementing `Iterable<T>` lets for-each loops walk the structure from head to tail without exposing nodes.",
      ],
    ],
    code: String.raw`import java.util.Iterator;
import java.util.NoSuchElementException;

public class Main {
    static class Node<T> { final T data; Node<T> next; Node(T d, Node<T> n) { data = d; next = n; } }

    static class LinkedStack<T> implements Iterable<T> {
        private Node<T> head;
        private int size;
        void push(T item) { head = new Node<>(item, head); size++; }
        T pop() {
            if (head == null) throw new NoSuchElementException("stack underflow");
            T item = head.data;
            head = head.next;
            size--;
            return item;
        }
        T peek() { return head == null ? null : head.data; }
        int size() { return size; }
        public Iterator<T> iterator() {
            return new Iterator<>() {
                Node<T> cur = head;
                public boolean hasNext() { return cur != null; }
                public T next() { T d = cur.data; cur = cur.next; return d; }
            };
        }
    }

    static class LinkedQueue<T> {
        private Node<T> head, tail;
        private int size;
        void enqueue(T item) {
            Node<T> n = new Node<>(item, null);
            if (tail == null) head = tail = n; else { tail.next = n; tail = n; }
            size++;
        }
        T dequeue() {
            if (head == null) throw new NoSuchElementException("queue underflow");
            T item = head.data;
            head = head.next;
            if (head == null) tail = null;                    // queue became empty
            size--;
            return item;
        }
        T peek() { return head == null ? null : head.data; }
        int size() { return size; }
        boolean isEmpty() { return size == 0; }
    }

    public static void main(String[] args) {
        LinkedStack<String> pages = new LinkedStack<>();
        for (String p : new String[] {"home", "products", "cart", "checkout"}) pages.push(p);
        System.out.print("browser history (top first): ");
        for (String p : pages) System.out.print(p + " ");
        System.out.println();
        System.out.println("back: " + pages.pop() + ", back: " + pages.pop() + ", now on " + pages.peek() + ", size " + pages.size());

        LinkedQueue<String> printer = new LinkedQueue<>();
        printer.enqueue("report.pdf"); printer.enqueue("photo.png"); printer.enqueue("invoice.pdf");
        System.out.println("printing " + printer.dequeue() + ", next " + printer.peek() + ", waiting " + printer.size());
        printer.enqueue("letter.docx");
        StringBuilder rest = new StringBuilder();
        while (!printer.isEmpty()) rest.append(printer.dequeue()).append(' ');
        System.out.println("remaining in FIFO order: " + rest.toString().trim());
        try { printer.dequeue(); } catch (NoSuchElementException e) { System.out.println("empty queue: " + e.getMessage()); }

        LinkedStack<Integer> big = new LinkedStack<>();
        for (int i = 0; i < 1_000_000; i++) big.push(i);       // no capacity, no resizing
        System.out.println("pushed a million items without resizing, top = " + big.peek());
    }
}`,
    walk:
      "`LinkedStack` pushes by creating a node that points to the old head, so the newest page is always on top; iterating from head shows the history newest first, and `pop` implements a back button. `LinkedQueue` adds at the tail and removes at the head, so print jobs come out in arrival order, and setting `tail = null` when the last job is removed keeps the queue consistent.\n\nDequeuing from an empty queue throws a clear exception. Pushing a million items never triggers a resize, because each element simply gets its own node.",
    anim: [
      "Linked queue: enqueue at tail",
      [
        ["head", "head", "report.pdf"],
        ["mid", "photo.png", "middle"],
        ["tail", "tail", "invoice.pdf"],
        ["new", "letter.docx", "new node"],
        ["out", "dequeue()", "from head"],
      ],
      [
        ["tail", "new", "link", "enqueue sets tail.next to the new node..."],
        ["new", "tail", "move", "...and moves tail to it: O(1), no traversal."],
        ["head", "out", "remove", "dequeue takes the item at head and moves head to the next node."],
        ["mid", "head", "advance", "The next job becomes the new head: first in, first out."],
      ],
    ],
    mistakes: [
      "Forgetting to reset `tail` to null when the queue becomes empty, leaving a dangling reference.",
      "Adding at the head and removing at the tail in a singly linked queue (O(n) removal).",
    ],
    qa: [
      ["How do you implement a stack with a linked list?", "Push and pop at the head: push creates a node pointing to the old head; pop removes the head."],
      ["How do you implement a queue with a linked list?", "Keep head and tail references; enqueue appends after tail and dequeue removes from head."],
      ["Array-based or linked stack: which is faster in Java?", "Usually the array-based ArrayDeque, thanks to better memory locality and fewer objects."],
    ],
    ex: [
      "Implement a queue using two LinkedStacks. What is the amortised cost of dequeue?",
      "Push incoming items onto stack A; to dequeue, if stack B is empty pop everything from A onto B, then pop B. Each element moves at most twice, so dequeue is amortised O(1).",
    ],
  }),

  lesson("Linked List Tricks: Reverse, Merge, Intersection and Cycles", {
    intro:
      "Linked list puzzles are interview classics because they test pointer manipulation under pressure. This lesson solves the most common ones: reversing a singly linked list, checking whether two lists merge (intersect) and finding the merge point, detecting a cycle with Floyd's algorithm, finding where a cycle starts (the intersection point in a circular list), and counting the nodes in a circular list.",
    topics: [
      [
        "Reversing a singly linked list",
        "Iteratively walk the list with three pointers (`prev`, `cur`, `next`): save `next`, point `cur.next` back to `prev`, advance. O(n) time, O(1) space. Recursively: reverse the rest, then make the next node point back to the current one.",
      ],
      [
        "Do two lists merge or intersect?",
        "If two singly linked lists share nodes, they share the same tail. Compare the tails (O(n + m)). To find the merge point, advance the longer list by the length difference, then walk both together until the nodes are identical (`==`); or use the two-pointer trick of switching heads when reaching the end.",
      ],
      [
        "Detecting a cycle",
        "Floyd's tortoise and hare: a slow pointer moves one step and a fast pointer two steps; if there is a cycle they eventually meet, otherwise fast reaches null. O(n) time, O(1) space (a HashSet of visited nodes also works with O(n) memory).",
      ],
      [
        "Where the cycle starts and its length",
        "After slow and fast meet, move one pointer back to head and advance both one step at a time; they meet at the start of the cycle, which is the intersection point of the circular part. Counting steps around the cycle from the meeting point gives its length; the total node count of a list with a loop is the tail length plus the cycle length.",
      ],
      [
        "Counting nodes in a circular list",
        "For a fully circular list, start at any node and count until you return to it with a do-while loop. Using a simple `while (cur != null)` would loop forever.",
      ],
    ],
    code: String.raw`public class Main {
    static class Node { int val; Node next; Node(int v) { val = v; } }

    static Node build(int... values) {
        Node dummy = new Node(0), cur = dummy;
        for (int v : values) { cur.next = new Node(v); cur = cur.next; }
        return dummy.next;
    }

    static String str(Node head) {
        StringBuilder sb = new StringBuilder();
        for (Node n = head; n != null; n = n.next) sb.append(n.val).append(n.next != null ? "->" : "");
        return sb.toString();
    }

    static Node reverse(Node head) {
        Node prev = null, cur = head;
        while (cur != null) { Node next = cur.next; cur.next = prev; prev = cur; cur = next; }
        return prev;
    }

    static Node reverseRecursive(Node head) {
        if (head == null || head.next == null) return head;
        Node rest = reverseRecursive(head.next);
        head.next.next = head;
        head.next = null;
        return rest;
    }

    static Node mergePoint(Node a, Node b) {                  // two-pointer switch trick
        Node p = a, q = b;
        while (p != q) { p = p == null ? b : p.next; q = q == null ? a : q.next; }
        return p;                                             // null if the lists never meet
    }

    static Node cycleStart(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next; fast = fast.next.next;
            if (slow == fast) {                               // cycle detected
                Node p = head;
                while (p != slow) { p = p.next; slow = slow.next; }
                return p;
            }
        }
        return null;
    }

    static int cycleLength(Node start) {
        int count = 0;
        Node cur = start;
        do { count++; cur = cur.next; } while (cur != start);  // do-while for circular lists
        return count;
    }

    public static void main(String[] args) {
        Node list = build(1, 2, 3, 4, 5);
        System.out.println("original " + str(list));
        list = reverse(list);
        System.out.println("reversed " + str(list));
        System.out.println("reversed back recursively " + str(reverseRecursive(list)));

        Node shared = build(8, 9, 10);
        Node a = build(1, 2, 3); a.next.next.next = shared;  // 1->2->3->8->9->10
        Node b = build(7);       b.next = shared;            // 7->8->9->10
        Node c = build(4, 5);
        System.out.println("A " + str(a) + ", B " + str(b) + " merge at node " + mergePoint(a, b).val);
        System.out.println("A and C merge point: " + mergePoint(a, c));

        Node loop = build(1, 2, 3, 4, 5, 6);                  // make 6 point back to 3
        Node three = loop.next.next, six = three.next.next.next;
        six.next = three;
        Node start = cycleStart(loop);
        System.out.println("cycle detected: " + (start != null) + ", cycle starts (intersection point) at " + start.val
                + ", cycle length " + cycleLength(start) + ", total nodes " + (2 + cycleLength(start)));
        System.out.println("acyclic list has cycle: " + (cycleStart(build(1, 2, 3)) != null));

        Node circular = build(10, 20, 30, 40);
        circular.next.next.next.next = circular;              // fully circular
        System.out.println("nodes in circular list: " + cycleLength(circular));
    }
}`,
    walk:
      "The iterative `reverse` flips each `next` pointer with three variables, and the recursive version reverses the rest of the list and then hooks the current node onto its end, restoring the original order.\n\nLists A and B share the nodes 8, 9, 10. The two-pointer trick walks each list and then the other, so both pointers travel the same total distance and meet at node 8; lists that never merge meet at null. A loop is created from 6 back to 3: Floyd's slow and fast pointers meet inside it, and restarting one from the head finds the cycle's start, node 3; the cycle has 4 nodes and the list 6 in total. A do-while counts the 4 nodes of a fully circular list.",
    anim: [
      "Floyd's cycle detection",
      [
        ["head", "1 -> 2", "tail part"],
        ["start", "3", "cycle start"],
        ["ring", "4 -> 5 -> 6", "loop back to 3"],
        ["meet", "slow == fast", "meeting point"],
        ["found", "start = 3", "reset and walk"],
      ],
      [
        ["head", "start", "enter", "Both pointers start at the head; fast moves two steps for every step of slow."],
        ["start", "ring", "loop", "Inside the cycle, fast gains one node per step on slow."],
        ["ring", "meet", "meet", "Eventually fast catches slow inside the loop: a cycle exists."],
        ["meet", "found", "start", "Moving one pointer back to the head and stepping both by one, they meet at node 3."],
      ],
    ],
    mistakes: [
      "Losing the rest of the list during reversal by overwriting `next` before saving it.",
      "Comparing node values instead of node identity when finding merge points.",
      "Iterating a circular list with `while (cur != null)`, which never terminates.",
    ],
    qa: [
      ["How do you reverse a singly linked list?", "Iterate with prev, cur and next pointers, redirecting each cur.next to prev; O(n) time and O(1) space."],
      ["How do you detect a cycle in a linked list?", "Floyd's algorithm: slow moves one step, fast two; they meet if and only if there is a cycle."],
      ["How do you find where two linked lists intersect?", "Align them by length difference (or switch heads at the end) and walk together until the nodes are the same object."],
      ["How do you find the start of a cycle?", "After the pointers meet, reset one to the head and advance both one step at a time; they meet at the cycle start."],
    ],
    ex: [
      "Find the middle node of a singly linked list in one pass.",
      "Use slow and fast pointers: when fast reaches the end (or null), slow is at the middle. For 1->2->3->4->5 it returns 3.",
    ],
  }),

  lesson("Binary Tree Traversals: Preorder, Inorder and Postorder", {
    intro:
      "A binary tree stores data in nodes with up to two children, left and right. Visiting every node in a defined order, called traversal, is the basis of printing, copying, evaluating and deleting trees. This lesson builds a binary search tree and implements preorder, inorder and postorder traversal recursively and iteratively, plus level order.",
    topics: [
      [
        "Binary trees and binary search trees",
        "Each node has `left` and `right` references. In a binary search tree (BST), everything in the left subtree is smaller and everything in the right subtree larger, so search and insertion take O(height): O(log n) for balanced trees and O(n) for degenerate ones.",
      ],
      [
        "Preorder (root, left, right)",
        "Visit the node first, then its subtrees. Used to copy or serialise a tree, because the root comes before its children.",
      ],
      [
        "Inorder (left, root, right)",
        "Visit the left subtree, the node, then the right subtree. For a BST this produces the keys in sorted order.",
      ],
      [
        "Postorder (left, right, root)",
        "Visit both subtrees before the node. Used to delete or free a tree and to evaluate expression trees, because children are processed before parents.",
      ],
      [
        "Iterative traversal and level order",
        "Recursion uses the call stack; an explicit `Deque` stack gives iterative versions that avoid stack overflow on very deep trees. Level order (breadth-first) visits nodes level by level with a queue.",
      ],
    ],
    code: String.raw`import java.util.*;

public class Main {
    static class Node {
        int key; Node left, right;
        Node(int k) { key = k; }
    }

    static Node insert(Node root, int key) {                 // binary search tree insert
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else root.right = insert(root.right, key);
        return root;
    }

    static void preorder(Node n, List<Integer> out) { if (n == null) return; out.add(n.key); preorder(n.left, out); preorder(n.right, out); }
    static void inorder(Node n, List<Integer> out) { if (n == null) return; inorder(n.left, out); out.add(n.key); inorder(n.right, out); }
    static void postorder(Node n, List<Integer> out) { if (n == null) return; postorder(n.left, out); postorder(n.right, out); out.add(n.key); }

    static List<Integer> inorderIterative(Node root) {
        List<Integer> out = new ArrayList<>();
        Deque<Node> stack = new ArrayDeque<>();
        Node cur = root;
        while (cur != null || !stack.isEmpty()) {
            while (cur != null) { stack.push(cur); cur = cur.left; }   // go as far left as possible
            cur = stack.pop();
            out.add(cur.key);
            cur = cur.right;
        }
        return out;
    }

    static List<Integer> preorderIterative(Node root) {
        List<Integer> out = new ArrayList<>();
        Deque<Node> stack = new ArrayDeque<>();
        if (root != null) stack.push(root);
        while (!stack.isEmpty()) {
            Node n = stack.pop();
            out.add(n.key);
            if (n.right != null) stack.push(n.right);                  // right first so left is processed first
            if (n.left != null) stack.push(n.left);
        }
        return out;
    }

    static List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> levels = new ArrayList<>();
        Queue<Node> queue = new ArrayDeque<>(List.of(root));
        while (!queue.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int i = queue.size(); i > 0; i--) {
                Node n = queue.poll();
                level.add(n.key);
                if (n.left != null) queue.add(n.left);
                if (n.right != null) queue.add(n.right);
            }
            levels.add(level);
        }
        return levels;
    }

    static int height(Node n) { return n == null ? 0 : 1 + Math.max(height(n.left), height(n.right)); }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[] {50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        //            50
        //          /    \
        //        30      70
        //       /  \    /  \
        //     20   40  60   80
        List<Integer> pre = new ArrayList<>(), in = new ArrayList<>(), post = new ArrayList<>();
        preorder(root, pre); inorder(root, in); postorder(root, post);
        System.out.println("preorder  (root, left, right): " + pre);
        System.out.println("inorder   (left, root, right): " + in + "  <- sorted for a BST");
        System.out.println("postorder (left, right, root): " + post);
        System.out.println("iterative inorder matches: " + inorderIterative(root).equals(in)
                + ", iterative preorder matches: " + preorderIterative(root).equals(pre));
        System.out.println("level order: " + levelOrder(root) + ", height " + height(root));

        Node degenerate = null;
        for (int k = 1; k <= 7; k++) degenerate = insert(degenerate, k);   // sorted input
        System.out.println("BST built from sorted input has height " + height(degenerate) + " (a linked list in disguise)");
    }
}`,
    walk:
      "Inserting 50, 30, 70, 20, 40, 60 and 80 builds the balanced BST drawn in the comment. Preorder visits each node before its children (50, 30, 20, 40, 70, 60, 80), inorder visits left, node, right and therefore prints the keys sorted, and postorder visits children first, ending with the root.\n\nThe iterative inorder pushes nodes while walking left and pops to visit, and the iterative preorder pushes the right child before the left; both match the recursive results. Level order uses a queue to group nodes by depth, giving height 3. Inserting already sorted keys produces a degenerate tree of height 7, which is why balanced trees such as red-black trees exist.",
    anim: [
      "Inorder traversal of a BST",
      [
        ["root", "50", "root"],
        ["l", "30", "left subtree"],
        ["ll", "20", "leftmost"],
        ["lr", "40", "after 30"],
        ["r", "70", "right subtree"],
      ],
      [
        ["root", "l", "go left", "Inorder first descends to the left subtree of 50."],
        ["l", "ll", "go left", "From 30 it keeps going left to 20, the smallest key, and visits it first."],
        ["ll", "lr", "visit", "Then 30 itself and its right child 40 are visited."],
        ["root", "r", "then right", "Only after the whole left subtree is 50 visited, then 60, 70 and 80: sorted order."],
      ],
    ],
    mistakes: [
      "Forgetting the null base case in recursive traversals.",
      "Pushing the left child before the right in iterative preorder (which reverses the order).",
      "Assuming a BST is balanced; sorted input creates an O(n) height tree.",
    ],
    qa: [
      ["What are the three depth-first traversals?", "Preorder (root, left, right), inorder (left, root, right) and postorder (left, right, root)."],
      ["Which traversal gives sorted output for a BST?", "Inorder."],
      ["When would you use postorder?", "When children must be processed before the parent, such as deleting a tree or evaluating an expression tree."],
      ["How do you traverse a tree level by level?", "Breadth-first search with a queue."],
    ],
    ex: [
      "Write the preorder, inorder and postorder of the tree with root 1, left child 2 (with children 4 and 5) and right child 3.",
      "Preorder 1 2 4 5 3; inorder 4 2 5 1 3; postorder 4 5 2 3 1.",
    ],
  }),
]);
