// Every lesson is a complete, independent Java 21 source-file program.
const prelude = `import java.util.*;
import java.io.*;
import java.net.*;
import java.net.http.*;
import java.time.Duration;
import java.nio.charset.StandardCharsets;

public class Main {
  static class Node {
    int value; Node left, right;
    Node(int value) { this.value = value; }
    Node(int value, Node left, Node right) {
      this.value = value; this.left = left; this.right = right;
    }
  }
  static Node tree() {
    return new Node(4, new Node(2, new Node(1), new Node(3)), new Node(7));
  }
`;
const program = (methods, main) => `${prelude}${methods}\n  public static void main(String[] args) throws Exception {\n${main}\n  }\n}\n`;

export const javaNetworkPrograms = {
  model: program(`  static int size(Node n) {
    return n == null ? 0 : 1 + size(n.left) + size(n.right);
  }`, `    System.out.println(size(tree()));`),
  dfs: program(`  static void inorder(Node n, List<Integer> out) {
    Deque<Node> stack = new ArrayDeque<>();
    while (n != null || !stack.isEmpty()) {
      while (n != null) { stack.push(n); n = n.left; }
      n = stack.pop(); out.add(n.value); n = n.right;
    }
  }`, `    List<Integer> out = new ArrayList<>();
    inorder(tree(), out); System.out.println(out);`),
  levels: program(`  static List<List<Integer>> levels(Node root) {
    List<List<Integer>> out = new ArrayList<>();
    if (root == null) return out;
    Deque<Node> q = new ArrayDeque<>(); q.add(root);
    while (!q.isEmpty()) {
      int count = q.size(); List<Integer> level = new ArrayList<>();
      for (int i = 0; i < count; i++) {
        Node n = q.remove(); level.add(n.value);
        if (n.left != null) q.add(n.left);
        if (n.right != null) q.add(n.right);
      }
      out.add(level);
    }
    return out;
  }`, `    System.out.println(levels(tree()));`),
  bst: program(`  static Node insert(Node n, int x) {
    if (n == null) return new Node(x);
    if (x < n.value) n.left = insert(n.left, x);
    else if (x > n.value) n.right = insert(n.right, x);
    return n; // Set semantics: duplicates are ignored.
  }
  static Node delete(Node n, int x) {
    if (n == null) return null;
    if (x < n.value) n.left = delete(n.left, x);
    else if (x > n.value) n.right = delete(n.right, x);
    else {
      if (n.left == null) return n.right;
      if (n.right == null) return n.left;
      Node next = n.right;
      while (next.left != null) next = next.left;
      n.value = next.value; n.right = delete(n.right, next.value);
    }
    return n;
  }
  static boolean valid(Node n, long low, long high) {
    return n == null || (low < n.value && n.value < high
      && valid(n.left, low, n.value) && valid(n.right, n.value, high));
  }`, `    Node root = insert(tree(), 6); root = delete(root, 4);
    System.out.println(root.value + " " + valid(root, Long.MIN_VALUE, Long.MAX_VALUE));`),
  balance: program(`  // Returns height in nodes, or -1 when the subtree is unbalanced.
  static int height(Node n) {
    if (n == null) return 0;
    int l = height(n.left); if (l == -1) return -1;
    int r = height(n.right);
    if (r == -1 || Math.abs(l-r) > 1) return -1;
    return 1 + Math.max(l, r);
  }
  static Node rotateRight(Node y) {
    Node x = y.left; Node middle = x.right;
    x.right = y; y.left = middle; return x;
  }`, `    Node root = new Node(3, new Node(2, new Node(1), null), null);
    System.out.println(height(root));
    root = rotateRight(root); System.out.println(root.value + " " + height(root));`),
  paths: program(`  static int depth(Node n, int[] diameter) {
    if (n == null) return 0;
    int l = depth(n.left, diameter), r = depth(n.right, diameter);
    diameter[0] = Math.max(diameter[0], l + r); // Edges, not nodes.
    return 1 + Math.max(l, r);
  }
  static boolean pathSum(Node n, long remaining) {
    if (n == null) return false;
    remaining -= n.value;
    if (n.left == null && n.right == null) return remaining == 0;
    return pathSum(n.left, remaining) || pathSum(n.right, remaining);
  }`, `    int[] d = {0}; depth(tree(), d);
    System.out.println(d[0] + " " + pathSum(tree(), 7));`),
  lca: program(`  // Contract: both node references exist in the tree.
  static Node lca(Node n, Node a, Node b) {
    if (n == null || n == a || n == b) return n;
    Node l = lca(n.left, a, b), r = lca(n.right, a, b);
    return l != null && r != null ? n : (l != null ? l : r);
  }`, `    Node root = tree();
    System.out.println(lca(root, root.left.left, root.left.right).value);`),
  codec: program(`  static void encode(Node n, List<String> tokens) {
    if (n == null) { tokens.add("#"); return; }
    tokens.add(Integer.toString(n.value)); encode(n.left, tokens); encode(n.right, tokens);
  }
  static Node decode(Deque<String> tokens) {
    if (tokens.isEmpty()) throw new IllegalArgumentException("Truncated tree");
    String t = tokens.remove(); if (t.equals("#")) return null;
    return new Node(Integer.parseInt(t), decode(tokens), decode(tokens));
  }`, `    List<String> tokens = new ArrayList<>(); encode(tree(), tokens);
    System.out.println(String.join(",", tokens));
    Deque<String> input = new ArrayDeque<>(tokens); Node copy = decode(input);
    if (!input.isEmpty()) throw new IllegalArgumentException("Extra tokens");
    System.out.println(copy.left.right.value);`),
  trie: program(`  static class Trie {
    Map<Character, Trie> children = new HashMap<>(); boolean end;
    void add(String word) {
      Trie n = this;
      for (char c : word.toCharArray()) n = n.children.computeIfAbsent(c, k -> new Trie());
      n.end = true;
    }
    Trie walk(String prefix) {
      Trie n = this;
      for (char c : prefix.toCharArray()) {
        n = n.children.get(c); if (n == null) return null;
      }
      return n;
    }
  }`, `    Trie t = new Trie(); t.add("car"); t.add("cat");
    System.out.println(t.walk("ca") != null);
    System.out.println(t.walk("ca").end);`),
  indexes: program(`  static class Fenwick {
    long[] bit;
    Fenwick(int n) { bit = new long[n+1]; }
    void add(int i, long delta) {
      if (i <= 0 || i >= bit.length) throw new IllegalArgumentException();
      for (; i < bit.length; i += i & -i) bit[i] += delta;
    }
    long prefix(int i) {
      if (i < 0 || i >= bit.length) throw new IllegalArgumentException();
      long sum = 0; for (; i > 0; i -= i & -i) sum += bit[i]; return sum;
    }
  }`, `    Fenwick f = new Fenwick(4); int[] a = {2, 1, 4, 3};
    for (int i = 0; i < a.length; i++) f.add(i+1, a[i]);
    System.out.println(f.prefix(4)-f.prefix(1));
    TreeMap<Integer, String> prices = new TreeMap<>();
    prices.put(10, "small"); prices.put(20, "large");
    System.out.println(prices.ceilingEntry(12));
    PriorityQueue<Integer> heap = new PriorityQueue<>(List.of(4, 1, 7));
    System.out.println(heap.remove());`),
  graph: program(`  static List<List<Integer>> graph(int n, int[][] edges, boolean directed) {
    List<List<Integer>> g = new ArrayList<>();
    for (int i = 0; i < n; i++) g.add(new ArrayList<>());
    for (int[] e : edges) {
      if (e[0] < 0 || e[0] >= n || e[1] < 0 || e[1] >= n) throw new IllegalArgumentException();
      g.get(e[0]).add(e[1]); if (!directed) g.get(e[1]).add(e[0]);
    }
    return g;
  }`, `    System.out.println(graph(4, new int[][]{{0,1},{0,2},{1,3}}, false));`),
  bfs: program(`  static List<Integer> shortest(List<List<Integer>> g, int source, int target) {
    int[] parent = new int[g.size()]; Arrays.fill(parent, -1);
    Deque<Integer> q = new ArrayDeque<>(); q.add(source); parent[source] = source;
    while (!q.isEmpty()) {
      int u = q.remove();
      for (int v : g.get(u)) if (parent[v] == -1) { parent[v] = u; q.add(v); }
    }
    if (parent[target] == -1) return List.of();
    List<Integer> path = new ArrayList<>();
    for (int v = target; ; v = parent[v]) { path.add(v); if (v == source) break; }
    Collections.reverse(path); return path;
  }`, `    var g = List.of(List.of(1,2), List.of(3), List.of(3), List.<Integer>of());
    System.out.println(shortest(g, 0, 3));`),
  components: program(`  static void flood(int[][] a, int row, int col) {
    if (row < 0 || col < 0 || row >= a.length || col >= a[0].length || a[row][col] == 0) return;
    a[row][col] = 0;
    flood(a,row+1,col); flood(a,row-1,col); flood(a,row,col+1); flood(a,row,col-1);
  }
  static int islands(int[][] a) {
    int count = 0;
    for (int r = 0; r < a.length; r++) for (int c = 0; c < a[r].length; c++)
      if (a[r][c] == 1) { count++; flood(a,r,c); }
    return count;
  }`, `    System.out.println(islands(new int[][]{{1,1,0},{0,0,1},{1,0,1}}));`),
  topo: program(`  static List<Integer> order(List<List<Integer>> g) {
    int[] degree = new int[g.size()];
    for (var list : g) for (int v : list) degree[v]++;
    Deque<Integer> q = new ArrayDeque<>();
    for (int i = 0; i < g.size(); i++) if (degree[i] == 0) q.add(i);
    List<Integer> out = new ArrayList<>();
    while (!q.isEmpty()) {
      int u = q.remove(); out.add(u);
      for (int v : g.get(u)) if (--degree[v] == 0) q.add(v);
    }
    if (out.size() != g.size()) throw new IllegalArgumentException("Cycle");
    return out;
  }`, `    System.out.println(order(List.of(List.of(1,2), List.of(3), List.of(3), List.of())));`),
  bipartite: program(`  static boolean bipartite(List<List<Integer>> g) {
    int[] color = new int[g.size()]; Arrays.fill(color, -1);
    for (int s = 0; s < g.size(); s++) if (color[s] == -1) {
      Deque<Integer> q = new ArrayDeque<>(); q.add(s); color[s] = 0;
      while (!q.isEmpty()) {
        int u = q.remove();
        for (int v : g.get(u)) {
          if (color[v] == -1) { color[v] = 1-color[u]; q.add(v); }
          else if (color[v] == color[u]) return false;
        }
      }
    }
    return true;
  }`, `    System.out.println(bipartite(List.of(List.of(1,2), List.of(0,2), List.of(0,1))));`),
  dijkstra: program(`  record Edge(int to, int weight) {}
  record State(int vertex, long cost) {}
  static long[] distances(List<List<Edge>> g, int source) {
    for (var edges : g) for (Edge e : edges) if (e.weight < 0) throw new IllegalArgumentException("Negative weight");
    long[] d = new long[g.size()]; Arrays.fill(d, Long.MAX_VALUE); d[source] = 0;
    PriorityQueue<State> q = new PriorityQueue<>(Comparator.comparingLong(State::cost));
    q.add(new State(source,0));
    while (!q.isEmpty()) {
      State s = q.remove(); if (s.cost != d[s.vertex]) continue;
      for (Edge e : g.get(s.vertex)) {
        long candidate = Math.addExact(s.cost, e.weight);
        if (candidate < d[e.to]) { d[e.to] = candidate; q.add(new State(e.to,candidate)); }
      }
    }
    return d;
  }`, `    var g = List.of(List.of(new Edge(1,4),new Edge(2,1)), List.<Edge>of(), List.of(new Edge(1,2)));
    System.out.println(Arrays.toString(distances(g,0)));`),
  bellman: program(`  static long[] bellman(int n, int[][] edges, int source) {
    long inf = Long.MAX_VALUE; long[] d = new long[n]; Arrays.fill(d,inf); d[source] = 0;
    for (int pass = 0; pass < n; pass++) {
      boolean changed = false;
      for (int[] e : edges) if (d[e[0]] != inf) {
        long next = Math.addExact(d[e[0]], e[2]);
        if (next < d[e[1]]) {
          if (pass == n-1) throw new IllegalArgumentException("Reachable negative cycle");
          d[e[1]] = next; changed = true;
        }
      }
      if (!changed) break;
    }
    return d;
  }`, `    System.out.println(Arrays.toString(bellman(3,new int[][]{{0,1,4},{0,2,5},{1,2,-2}},0)));`),
  mst: program(`  static class DSU {
    int[] p, size;
    DSU(int n) { p = new int[n]; size = new int[n]; for(int i=0;i<n;i++){p[i]=i;size[i]=1;} }
    int find(int x) { while(x != p[x]) { p[x] = p[p[x]]; x = p[x]; } return x; }
    boolean union(int a, int b) {
      a = find(a); b = find(b); if(a == b) return false;
      if(size[a] < size[b]) { int t=a; a=b; b=t; }
      p[b] = a; size[a] += size[b]; return true;
    }
  }
  static long mst(int n, int[][] edges) {
    Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
    DSU dsu = new DSU(n); long cost=0; int used=0;
    for(int[] e : edges) if(dsu.union(e[0],e[1])) { cost += e[2]; used++; }
    if(n > 0 && used != n-1) throw new IllegalArgumentException("Disconnected");
    return cost;
  }`, `    System.out.println(mst(4,new int[][]{{0,1,1},{1,2,2},{0,2,4},{2,3,3}}));`),
  scc: program(`  static void finish(int u, List<List<Integer>> g, boolean[] seen, List<Integer> order) {
    seen[u] = true;
    for (int v : g.get(u)) if (!seen[v]) finish(v,g,seen,order);
    order.add(u);
  }
  static List<List<Integer>> scc(List<List<Integer>> g) {
    int n=g.size(); boolean[] seen=new boolean[n]; List<Integer> order=new ArrayList<>();
    for(int u=0;u<n;u++) if(!seen[u]) finish(u,g,seen,order);
    List<List<Integer>> reverse=new ArrayList<>(); for(int u=0;u<n;u++) reverse.add(new ArrayList<>());
    for(int u=0;u<n;u++) for(int v:g.get(u)) reverse.get(v).add(u);
    Arrays.fill(seen,false); Collections.reverse(order); List<List<Integer>> out=new ArrayList<>();
    for(int u:order) if(!seen[u]) { List<Integer> group=new ArrayList<>(); finish(u,reverse,seen,group); Collections.sort(group); out.add(group); }
    return out;
  }`, `    System.out.println(scc(List.of(List.of(1),List.of(0,2),List.of(3),List.of(2))));`),
  flow: program(`  // Capacity matrix is copied into residual capacity; input is not mutated.
  static long flow(int[][] capacity, int source, int sink) {
    if(source == sink) throw new IllegalArgumentException();
    int n=capacity.length; long[][] r=new long[n][n];
    for(int i=0;i<n;i++) for(int j=0;j<n;j++) { if(capacity[i][j]<0) throw new IllegalArgumentException(); r[i][j]=capacity[i][j]; }
    long total=0;
    while(true) {
      int[] p=new int[n]; Arrays.fill(p,-1); p[source]=source;
      Deque<Integer> q=new ArrayDeque<>(); q.add(source);
      while(!q.isEmpty() && p[sink]==-1) {
        int u=q.remove();
        for(int v=0;v<n;v++) if(p[v]==-1 && r[u][v]>0) { p[v]=u; q.add(v); }
      }
      if(p[sink]==-1) return total;
      long add=Long.MAX_VALUE;
      for(int v=sink;v!=source;v=p[v]) add=Math.min(add,r[p[v]][v]);
      for(int v=sink;v!=source;v=p[v]) { r[p[v]][v]-=add; r[v][p[v]]+=add; }
      total+=add;
    }
  }`, `    System.out.println(flow(new int[][]{{0,3,2,0},{0,0,1,2},{0,0,0,3},{0,0,0,0}},0,3));`),
  tcp: program(``, `    // One loopback connection; int length prefix bounds each frame to 1024 bytes.
    try (ServerSocket server = new ServerSocket(0, 1, InetAddress.getByName("127.0.0.1"))) {
      server.setSoTimeout(2000);
      try (Socket client = new Socket()) {
        client.connect(new InetSocketAddress("127.0.0.1",server.getLocalPort()),2000);
        client.setSoTimeout(2000);
        try (Socket peer = server.accept()) {
          peer.setSoTimeout(2000);
          byte[] body = "hello".getBytes(StandardCharsets.UTF_8);
          DataOutputStream out = new DataOutputStream(client.getOutputStream());
          out.writeInt(body.length); out.write(body); out.flush();
          DataInputStream in = new DataInputStream(peer.getInputStream());
          int length = in.readInt();
          if (length < 0 || length > 1024) throw new IOException("Invalid frame");
          byte[] received = new byte[length]; in.readFully(received);
          System.out.println(new String(received,StandardCharsets.UTF_8));
        }
      }
    }`),
  http: program(``, `    // Local, deterministic fixture; no external endpoint or credentials required.
    var server = com.sun.net.httpserver.HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
    server.createContext("/health", exchange -> {
      byte[] body = "ok".getBytes(StandardCharsets.UTF_8);
      exchange.sendResponseHeaders(200,body.length);
      try (var output = exchange.getResponseBody()) { output.write(body); }
      finally { exchange.close(); }
    });
    server.start();
    try (HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()) {
      var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:"+server.getAddress().getPort()+"/health"))
        .timeout(Duration.ofSeconds(3)).GET().build();
      var response = client.send(request,HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() != 200) throw new IOException("Unexpected status " + response.statusCode());
      System.out.println(response.statusCode()+" "+response.body());
    } finally { server.stop(0); }`),
  reliability: program(`  // Pure scheduling example: callers must apply deadlines and server Retry-After.
  static long delay(int attempt, long randomMillis) {
    if(attempt < 0 || attempt > 4 || randomMillis < 0 || randomMillis >= 100) throw new IllegalArgumentException();
    return Math.min(1600, 100L << attempt) + randomMillis;
  }
  static boolean retryable(String method, int status, int attempt) {
    return method.equals("GET") && attempt < 4 && (status == 429 || status == 503);
  }`, `    System.out.println(retryable("GET",503,1));
    System.out.println(retryable("POST",503,1));
    System.out.println(delay(2,37));`),
  capstone: program(`  record Category(String id, String parent) {}
  static Map<String,List<String>> hierarchy(List<Category> rows) {
    Map<String,Category> byId=new HashMap<>();
    for(var row:rows) if(byId.putIfAbsent(row.id,row)!=null) throw new IllegalArgumentException("Duplicate ID");
    Map<String,List<String>> out=new TreeMap<>();
    for(var row:rows) {
      Set<String> seen=new HashSet<>(); Category current=row;
      while(current!=null) {
        if(!seen.add(current.id)) throw new IllegalArgumentException("Cycle");
        if(current.parent==null) break;
        current=byId.get(current.parent); if(current==null) throw new IllegalArgumentException("Missing parent");
      }
      out.computeIfAbsent(row.id,k->new ArrayList<>());
      if(row.parent!=null) out.computeIfAbsent(row.parent,k->new ArrayList<>()).add(row.id);
    }
    for(var children:out.values()) Collections.sort(children);
    return out;
  }`, `    System.out.println(hierarchy(List.of(new Category("root",null),new Category("books","root"),new Category("java","books"))));`),
};
