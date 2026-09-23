export const support = {
  "rotate-array": `static void reverse(int[] a,int l,int r){while(l<r){int t=a[l];a[l++]=a[r];a[r--]=t;}}`,
  "group-anagrams": `static boolean sameLetters(String a,String b){if(a.length()!=b.length())return false;int[] counts=new int[26];for(char c:a.toCharArray())counts[c-'a']++;for(char c:b.toCharArray())counts[c-'a']--;for(int count:counts)if(count!=0)return false;return true;}
static List<String> groupOutput(Collection<List<String>> groups){List<String> out=new ArrayList<>();for(List<String> group:groups){Collections.sort(group);out.add(group.toString());}Collections.sort(out);return out;}`,
  "word-break": `static boolean segment(String s,int start,Set<String> words){emit("Try a word boundary","start",start);if(start==s.length())return true;for(int end=start+1;end<=s.length();end++)if(words.contains(s.substring(start,end))&&segment(s,end,words))return true;return false;}`,
  "partition-equal": `static boolean subsetSum(int[] a,int i,int target){emit("Take or skip toward the target","index",i,"remaining",target);if(target==0)return true;if(i==a.length)return false;return subsetSum(a,i+1,target)||(a[i]<=target&&subsetSum(a,i+1,target-a[i]));}`,
  "coin-change-ways": `static long coinWays(int[] coins,int i,int amount){emit("Choose a count for the next coin type","coin index",i,"remaining",amount);if(amount==0)return 1;if(i==coins.length)return 0;long total=0;for(int used=0;used<=amount;used+=coins[i])total+=coinWays(coins,i+1,amount-used);return total;}`,
  "valid-palindrome": `static boolean ascii(char c) { return c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'; }`,
  "reverse-list": `static class Node { int value; Node next; Node(int value){this.value=value;} }
static Node list(int[] values){Node dummy=new Node(0),tail=dummy;for(int x:values){tail.next=new Node(x);tail=tail.next;}return dummy.next;}
static int[] values(Node node){List<Integer> result=new ArrayList<>();for(;node!=null;node=node.next)result.add(node.value);return result.stream().mapToInt(Integer::intValue).toArray();}`,
  tree: `static class Tree { int value; Tree left,right; Tree(int value){this.value=value;} }
static Tree tree(Integer[] input){if(input.length==0||input[0]==null)return null;Tree root=new Tree(input[0]);Deque<Tree> q=new ArrayDeque<>();q.add(root);int i=1;while(!q.isEmpty()&&i<input.length){Tree node=q.remove();if(input[i]!=null){node.left=new Tree(input[i]);q.add(node.left);}i++;if(i<input.length&&input[i]!=null){node.right=new Tree(input[i]);q.add(node.right);}i++;}return root;}`,
  "validate-bst": `static boolean all(Tree node,int value,boolean left){if(node==null)return true;emit("Check an ancestor bound","descendant",node.value,"ancestor",value);if(left?node.value>=value:node.value<=value)return false;return all(node.left,value,left)&&all(node.right,value,left);}
static boolean checkSlow(Tree node){return node==null||all(node.left,node.value,true)&&all(node.right,node.value,false)&&checkSlow(node.left)&&checkSlow(node.right);}`,
  "prefix-search": `static class Trie { Trie[] children=new Trie[26]; boolean word; }`,
  graph: `static List<List<Integer>> graph(int n,int[][] edges){List<List<Integer>> g=new ArrayList<>();for(int i=0;i<n;i++)g.add(new ArrayList<>());for(int[] e:edges){g.get(e[0]).add(e[1]);g.get(e[1]).add(e[0]);}return g;}`,
  "union-find": `static int find(int[] parent,int x){while(parent[x]!=x){parent[x]=parent[parent[x]];x=parent[x];}return x;}`,
  "dijkstra": `static final long INF=Long.MAX_VALUE/4;
static long[] clean(long[] d){long[] out=d.clone();for(int i=0;i<out.length;i++)if(out[i]==INF)out[i]=-1;return out;}`,
  "strongly-connected": `static void finish(int u,List<List<Integer>> g,boolean[] seen,List<Integer> order){seen[u]=true;for(int v:g.get(u))if(!seen[v])finish(v,g,seen,order);order.add(u);emit("Record DFS finishing order","vertex",u,"order",order);}`,
  "subsets": `static void subsets(int[] a,int i,List<Integer> path,List<String> out){emit("Choose/explore/undo state","index",i,"path",path);if(i==a.length){out.add(path.toString());return;}subsets(a,i+1,path,out);path.add(a[i]);subsets(a,i+1,path,out);path.remove(path.size()-1);}`,
  "jump-game": `static boolean jump(int[] a,int i){emit("Explore jumps from this position","index",i);if(i>=a.length-1)return true;for(int next=i+1;next<a.length&&next<=(long)i+a[i];next++)if(jump(a,next))return true;return false;}`,
  "house-robber": `static long rob(int[] a,int i){emit("Choose whether to rob this house","index",i);if(i>=a.length)return 0;return Math.max(rob(a,i+1),a[i]+rob(a,i+2));}`,
  "knapsack": `static long sack(int[] w,int[] v,int i,int c){emit("Take or skip an item","item",i,"capacity",c);if(i==w.length)return 0;long best=sack(w,v,i+1,c);if(w[i]<=c)best=Math.max(best,v[i]+sack(w,v,i+1,c-w[i]));return best;}`,
  "longest-common-subsequence": `static int lcs(String a,String b,int i,int j){emit("Compare suffixes","indices",new int[]{i,j});if(i==a.length()||j==b.length())return 0;if(a.charAt(i)==b.charAt(j))return 1+lcs(a,b,i+1,j+1);return Math.max(lcs(a,b,i+1,j),lcs(a,b,i,j+1));}`,
  "edit-distance": `static int edit(String a,String b,int i,int j){emit("Choose an edit on suffixes","indices",new int[]{i,j});if(i==a.length())return b.length()-j;if(j==b.length())return a.length()-i;if(a.charAt(i)==b.charAt(j))return edit(a,b,i+1,j+1);return 1+Math.min(edit(a,b,i+1,j+1),Math.min(edit(a,b,i+1,j),edit(a,b,i,j+1)));}`,
  "stock-fee": `static final long INF=Long.MAX_VALUE/4;
static long stock(int[] p,int fee,int i,boolean holding){emit("Branch on buy/sell/wait","day",i,"holding",holding);if(i==p.length)return holding?-INF:0;long wait=stock(p,fee,i+1,holding);return Math.max(wait,holding?p[i]-fee+stock(p,fee,i+1,false):-p[i]+stock(p,fee,i+1,true));}`,
  "matrix-chain": `static long chain(int[] d,int l,int r){emit("Try interval splits","interval",new int[]{l,r});if(l==r)return 0;long best=Long.MAX_VALUE;for(int k=l;k<r;k++)best=Math.min(best,chain(d,l,k)+chain(d,k+1,r)+(long)d[l]*d[k+1]*d[r+1]);return best;}`,
  "concurrent-counter": `static void join(Thread thread){try{thread.join();}catch(InterruptedException e){Thread.currentThread().interrupt();throw new IllegalStateException("Interrupted before completion",e);}}`,
};

export function helpers(id) {
  return [(["maximum-depth","validate-bst"].includes(id) ? support.tree : ""),
    (["connected-components","shortest-unweighted"].includes(id) ? support.graph : ""), support[id] || ""].filter(Boolean).join("\n");
}

export const runtime = String.raw`
static int frameCount=0;
static final int FRAME_LIMIT=12000;
static String quote(String value){StringBuilder out=new StringBuilder("\"");for(char c:value.toCharArray()){switch(c){case '"':out.append("\\\"");break;case '\\':out.append("\\\\");break;case '\n':out.append("\\n");break;case '\r':out.append("\\r");break;case '\t':out.append("\\t");break;default:if(c<32)out.append(String.format("\\u%04x",(int)c));else out.append(c);}}return out.append('"').toString();}
static String json(Object value){if(value==null)return "null";if(value instanceof Number||value instanceof Boolean)return value.toString();if(value.getClass().isArray()){List<String> parts=new ArrayList<>();for(int i=0;i<java.lang.reflect.Array.getLength(value);i++)parts.add(json(java.lang.reflect.Array.get(value,i)));return "["+String.join(",",parts)+"]";}if(value instanceof Collection<?> values){List<String> parts=new ArrayList<>();for(Object v:values)parts.add(json(v));return "["+String.join(",",parts)+"]";}if(value instanceof Map<?,?> values){List<String> parts=new ArrayList<>();for(var entry:values.entrySet())parts.add(quote(String.valueOf(entry.getKey()))+":"+json(entry.getValue()));return "{"+String.join(",",parts)+"}";}return quote(value.toString());}
static String display(Object value){if(value!=null&&value.getClass().isArray()){List<String> parts=new ArrayList<>();for(int i=0;i<java.lang.reflect.Array.getLength(value);i++)parts.add(display(java.lang.reflect.Array.get(value,i)));return "["+String.join(", ",parts)+"]";}return String.valueOf(value);}
static void emit(String note,Object... pairs){if(++frameCount>FRAME_LIMIT)return;Map<String,Object> state=new LinkedHashMap<>();for(int i=0;i<pairs.length;i+=2)state.put(String.valueOf(pairs[i]),pairs[i+1]);System.out.println("FRAME\t{\"note\":"+quote(note)+",\"state\":"+json(state)+"}");}
`;

export function javaSource(lesson, mode, className = "Solution", allExamples = false) {
  const cases = (allExamples ? lesson.tests : lesson.tests.slice(0,1)).map((test,index) =>
    `System.out.println("CASE\\t${index}"); frameCount=0; emit("Input", "arguments", ${JSON.stringify(test.args)}); Object result${index}=solve(${test.args}); emit("Return the answer", "result", result${index}); System.out.println("RESULT\\t"+display(result${index}));`
      .replaceAll('\\t','\t')).join("\n");
  return `import java.util.*;\n\npublic class ${className} {\n  static ${lesson.signature} {\n${lesson[mode]}\n  }\n${helpers(lesson.id)}\n${runtime}\n  public static void main(String[] args) {\n${cases}\n  }\n}\n`;
}
