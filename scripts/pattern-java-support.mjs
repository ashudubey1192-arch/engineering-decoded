export const support = {
  "list-cycle": `static Node[] cycleList(int[] input,int pos){Node[] nodes=new Node[input.length];for(int i=0;i<input.length;i++)nodes[i]=new Node(input[i]);for(int i=1;i<input.length;i++)nodes[i-1].next=nodes[i];if(pos>=0)nodes[nodes.length-1].next=nodes[pos];return nodes;}`,
  "invert-tree": `static Tree mirrorCopy(Tree node){if(node==null)return null;Tree copy=new Tree(node.value);copy.left=mirrorCopy(node.right);copy.right=mirrorCopy(node.left);emit("Copy a mirrored subtree","root",node.value);return copy;}`,
  "same-tree": `static void serializeInto(Tree node,StringBuilder out){if(node==null){out.append("#,");return;}out.append(node.value).append(',');serializeInto(node.left,out);serializeInto(node.right,out);}
static String serialize(Tree node){StringBuilder out=new StringBuilder();serializeInto(node,out);return out.toString();}
static boolean equalTrees(Tree a,Tree b){emit("Compare corresponding roots","left",a==null?null:a.value,"right",b==null?null:b.value);if(a==null||b==null)return a==b;return a.value==b.value&&equalTrees(a.left,b.left)&&equalTrees(a.right,b.right);}`,
  height: `static int height(Tree node){return node==null?0:1+Math.max(height(node.left),height(node.right));}`,
  "tree-diameter": `static int diameterSlow(Tree node){if(node==null)return 0;int through=height(node.left)+height(node.right);emit("Recompute heights through a node","node",node.value,"through",through);return Math.max(through,Math.max(diameterSlow(node.left),diameterSlow(node.right)));}
static int diameterHeight(Tree node,int[] best){if(node==null)return 0;int left=diameterHeight(node.left,best),right=diameterHeight(node.right,best);best[0]=Math.max(best[0],left+right);emit("Return height while updating diameter","node",node.value,"child heights",new int[]{left,right},"diameter",best[0]);return 1+Math.max(left,right);}`,
  "balanced-tree": `static boolean balancedSlow(Tree node){if(node==null)return true;int left=height(node.left),right=height(node.right);emit("Check child heights","node",node.value,"heights",new int[]{left,right});return Math.abs(left-right)<=1&&balancedSlow(node.left)&&balancedSlow(node.right);}
static int balancedHeight(Tree node){if(node==null)return 0;int left=balancedHeight(node.left);if(left<0)return -1;int right=balancedHeight(node.right);emit("Propagate height or imbalance","node",node.value,"heights",new int[]{left,right});if(right<0||Math.abs(left-right)>1)return -1;return 1+Math.max(left,right);}`,
  "kth-smallest-bst": `static void collect(Tree node,List<Integer> values){if(node==null)return;values.add(node.value);collect(node.left,values);collect(node.right,values);}`,
  "permutations": `static void permutationSlow(int[] a,int[] indices,int depth,List<String> out){if(depth==a.length){boolean[] used=new boolean[a.length];int[] values=new int[a.length];for(int i=0;i<a.length;i++){if(used[indices[i]])return;used[indices[i]]=true;values[i]=a[indices[i]];}out.add(Arrays.toString(values));emit("Accept a complete permutation","values",values);return;}for(int i=0;i<a.length;i++){indices[depth]=i;permutationSlow(a,indices,depth+1,out);}}
static void permutationFast(int[] a,boolean[] used,List<Integer> path,List<String> out){emit("Expand a prefix with distinct indices","path",path);if(path.size()==a.length){out.add(path.toString());return;}for(int i=0;i<a.length;i++)if(!used[i]){used[i]=true;path.add(a[i]);permutationFast(a,used,path,out);path.remove(path.size()-1);used[i]=false;}}`,
  "n-queens": `static long queensSlow(int[] columns,int row){if(row==columns.length){for(int i=0;i<columns.length;i++)for(int j=0;j<i;j++)if(columns[i]==columns[j]||Math.abs(columns[i]-columns[j])==i-j)return 0;emit("Accept a complete board","columns",columns);return 1;}long count=0;for(int col=0;col<columns.length;col++){columns[row]=col;count+=queensSlow(columns,row+1);}return count;}
static long queensFast(int n,int row,boolean[] cols,boolean[] down,boolean[] up,List<Integer> path){emit("Extend a conflict-free board","columns",path);if(row==n)return 1;long count=0;for(int col=0;col<n;col++){int d=row+col,u=row-col+n;if(cols[col]||down[d]||up[u])continue;cols[col]=down[d]=up[u]=true;path.add(col);count+=queensFast(n,row+1,cols,down,up,path);path.remove(path.size()-1);cols[col]=down[d]=up[u]=false;}return count;}`,
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
  return [(["maximum-depth","validate-bst","invert-tree","same-tree","tree-diameter","balanced-tree","kth-smallest-bst"].includes(id) ? support.tree : ""),
    (["tree-diameter","balanced-tree"].includes(id)?support.height:""),
    (["middle-list","merge-lists","remove-nth-list","list-cycle"].includes(id)?support["reverse-list"]:""),
    (id==="invert-tree"?`static List<Integer> treeValues(Tree root){List<Integer> out=new ArrayList<>();if(root==null)return out;List<Tree> queue=new ArrayList<>();queue.add(root);for(int i=0;i<queue.size();i++){Tree node=queue.get(i);if(node==null){out.add(null);continue;}out.add(node.value);queue.add(node.left);queue.add(node.right);}while(!out.isEmpty()&&out.get(out.size()-1)==null)out.remove(out.size()-1);return out;}`:""),
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
