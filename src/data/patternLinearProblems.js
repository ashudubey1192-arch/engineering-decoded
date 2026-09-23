import { problem as p, example as e } from "./patternLessonSchema.js";

export const linearProblems = [
  p("frequency-counting", "Frequency counting", "Count every distinct integer, retaining first-seen key order. Empty input produces an empty map.", "Map<Integer,Integer> solve(int[] a)",
`Map<Integer,Integer> counts = new LinkedHashMap<>();
for (int x : a) {
  if (counts.containsKey(x)) continue;
  int count = 0;
  for (int y : a) { if (x == y) count++; emit("Compare with candidate " + x, "value", y, "count", count); }
  counts.put(x, count);
}
return counts;`,
`Map<Integer,Integer> counts = new LinkedHashMap<>();
for (int x : a) {
  counts.put(x, counts.getOrDefault(x, 0) + 1);
  emit("Increment exactly one bucket", "value", x, "counts", counts);
}
return counts;`,
["Repeated scans count a candidate correctly, but revisit the same input for each distinct value.", "A map stores work already done: after processing i values, each bucket equals its count in that prefix.", "Increment the current bucket once. LinkedHashMap preserves encounter order; an array of counters works only for a bounded value domain."], ["O(n²), O(d) output", "O(n) expected, O(d) space; d distinct values"],
[e("Repeated values", "new int[]{2,1,2,3,1,2}", "{2=3, 1=2, 3=1}"),e("Empty", "new int[]{}", "{}")]),
  p("two-sum", "Two Sum", "Return the two indices whose values sum to target, or [-1,-1]. Return the first pair discovered by increasing right index; never reuse an index.", "int[] solve(int[] a, int target)",
`for (int j=0;j<a.length;j++) for(int i=0;i<j;i++) {
  emit("Test a pair", "indices", new int[]{i,j}, "sum", (long)a[i]+a[j]);
  if((long)a[i]+a[j]==target) return new int[]{i,j};
}
return new int[]{-1,-1};`,
`Map<Long,Integer> seen=new HashMap<>();
for(int j=0;j<a.length;j++) {
  long need=(long)target-a[j];
  emit("Look for complement before inserting", "index", j, "need", need, "seen", seen);
  if(seen.containsKey(need)) return new int[]{seen.get(need),j};
  seen.putIfAbsent((long)a[j],j);
}
return new int[]{-1,-1};`,
["Enumerate earlier indices for each right index so the baseline has a precise tie rule.","Only earlier values belong in the map. Looking up before inserting prevents pairing a value with itself.","A successful complement is sufficient because need + current = target. Widen arithmetic to long before subtraction."], ["O(n²), O(1) auxiliary", "O(n) expected, O(n) auxiliary"],
[e("Standard", "new int[]{2,7,11,15},9", "[0, 1]"),e("Equal values", "new int[]{3,3},6", "[0, 1]"),e("No solution", "new int[]{1},2", "[-1, -1]")]),
  p("move-zeroes", "Move Zeroes", "Keep nonzero values in their original order and move zeroes to the end. Return the modified array.", "int[] solve(int[] a)",
`for(int i=0;i<a.length;i++) if(a[i]==0) {
  int j=i+1; while(j<a.length && a[j]==0) j++;
  if(j==a.length) break;
  a[i]=a[j];a[j]=0;emit("Find the next nonzero", "array",a,"read",j,"write",i);
}
return a;`,
`int write=0;
for(int read=0;read<a.length;read++) {
  if(a[read]!=0) a[write++]=a[read];
  emit("Compact the nonzero prefix", "array",a,"read",read,"write",write);
}
while(write<a.length) a[write++]=0;
emit("Fill the unused suffix with zeroes", "array",a);
return a;`,
["Searching ahead for each hole can repeatedly scan a long zero run.","The prefix before write always contains the nonzero values seen so far in stable order.","Read each position once; then clear the suffix. Do not clear unread positions during compaction."], ["O(n²), O(1)","O(n), O(1)"], [e("Mixed", "new int[]{0,1,0,3,12}", "[1, 3, 12, 0, 0]"),e("All zero", "new int[]{0,0}", "[0, 0]")]),
  p("maximum-subarray", "Maximum Subarray", "Return the maximum sum of a nonempty contiguous subarray. Input is nonempty; sums use long.", "long solve(int[] a)",
`long best=Long.MIN_VALUE;
for(int i=0;i<a.length;i++) { long sum=0; for(int j=i;j<a.length;j++) {
  sum+=a[j];best=Math.max(best,sum);emit("Extend a candidate interval", "range",new int[]{i,j},"sum",sum,"best",best);
}}
return best;`,
`long ending=a[0],best=a[0];emit("Initialize a nonempty subarray", "ending",ending,"best",best);
for(int i=1;i<a.length;i++) {
  ending=Math.max(a[i],ending+a[i]);best=Math.max(best,ending);
  emit("Restart here or extend the previous best ending here", "index",i,"ending",ending,"best",best);
}
return best;`,
["Enumerate starts and incrementally extend each end; a third summation loop is unnecessary.","Any best subarray ending at i either begins at i or extends the best subarray ending at i−1.","Track a separate global maximum. Initializing to zero would incorrectly choose an empty interval for all-negative input."],["O(n²), O(1)","O(n), O(1)"],[e("Mixed", "new int[]{-2,1,-3,4,-1,2,1,-5,4}","6"),e("Negative", "new int[]{-4,-2,-8}","-2")]),
  p("product-except-self", "Product Except Self", "For every position, multiply all other elements without division. Products fit long; an empty product is 1.", "long[] solve(int[] a)",
`long[] out=new long[a.length];
for(int i=0;i<a.length;i++){out[i]=1;for(int j=0;j<a.length;j++)if(i!=j)out[i]*=a[j];emit("Multiply all other positions","index",i,"output",out);}
return out;`,
`long[] out=new long[a.length];long prefix=1,suffix=1;
for(int i=0;i<a.length;i++){out[i]=prefix;prefix*=a[i];emit("Store product strictly to the left","index",i,"output",out);}
for(int i=a.length-1;i>=0;i--){out[i]*=suffix;suffix*=a[i];emit("Multiply by product strictly to the right","index",i,"output",out);}
return out;`,
["The baseline explicitly omits the current position, so zeroes need no special cases.","Store exclusive prefix products in the output itself.","A backward suffix accumulator completes each product. This saves an extra suffix array and handles one or multiple zeroes."],["O(n²), O(n) output","O(n), O(1) auxiliary excluding output"],[e("Positive","new int[]{1,2,3,4}","[24, 12, 8, 6]"),e("Zeroes","new int[]{0,2,0}","[0, 0, 0]")]),
  p("valid-palindrome", "Valid Palindrome", "Compare ASCII letters and digits, ignoring ASCII case and other characters. The empty filtered string is a palindrome.", "boolean solve(String s)",
`String clean=s.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
String reversed=new StringBuilder(clean).reverse().toString();emit("Compare normalized copies","forward",clean,"reverse",reversed);
return clean.equals(reversed);`,
`int l=0,r=s.length()-1;
while(l<r){
 while(l<r && !ascii(s.charAt(l))) l++;
 while(l<r && !ascii(s.charAt(r))) r--;
 emit("Compare the next significant characters","pointers",new int[]{l,r},"text",s);
 if(Character.toLowerCase(s.charAt(l))!=Character.toLowerCase(s.charAt(r)))return false;
 l++;r--;
}
return true;`,
["Normalize and reverse to obtain a simple linear-space baseline; no slower brute force is needed.","Skip punctuation from both ends, then compare one significant pair.","All pairs outside the pointers have already matched. This implementation deliberately specifies ASCII rather than claiming Unicode grapheme support."],["O(n), O(n)","O(n), O(1)"],[e("Phrase",'"A man, a plan, a canal: Panama"',"true"),e("Mismatch",'"race a car"',"false"),e("Empty",'""',"true")]),
  p("valid-anagram", "Valid Anagram", "Decide whether two lowercase English strings have the same character multiset.", "boolean solve(String s, String t)",
`if(s.length()!=t.length())return false;
boolean[] used=new boolean[t.length()];
for(char c:s.toCharArray()){int j=0;while(j<t.length()&&(used[j]||t.charAt(j)!=c))j++;emit("Find an unused matching character","character",c,"match",j);if(j==t.length())return false;used[j]=true;}
return true;`,
`if(s.length()!=t.length())return false;
int[] count=new int[26];for(char c:s.toCharArray())count[c-'a']++;
for(char c:t.toCharArray()){count[c-'a']--;emit("Consume a character from the inventory","character",c,"counts",count);if(count[c-'a']<0)return false;}
return true;`,
["Matching each character to one unused occurrence establishes multiplicity but repeatedly searches the target.","Build an inventory of the source, then consume it with the target.","Equal lengths and no over-consumed bucket imply all buckets finish at zero. A set alone loses duplicate counts."],["O(n²), O(n)","O(n), O(1) for 26 letters"],[e("Anagram",'"anagram","nagaram"',"true"),e("Multiplicity",'"aab","abb"',"false")]),
  p("longest-unique-substring", "Longest Substring Without Repeating Characters", "Return the length of the longest substring without repeated ASCII characters.", "int solve(String s)",
`int best=0;
for(int l=0;l<s.length();l++){Set<Character> seen=new HashSet<>();for(int r=l;r<s.length();r++){if(!seen.add(s.charAt(r)))break;best=Math.max(best,r-l+1);emit("Extend while unique","range",new int[]{l,r},"best",best);}}
return best;`,
`int[] last=new int[128];Arrays.fill(last,-1);int l=0,best=0;
for(int r=0;r<s.length();r++){l=Math.max(l,last[s.charAt(r)]+1);last[s.charAt(r)]=r;best=Math.max(best,r-l+1);emit("Jump the left boundary past the previous occurrence","range",new int[]{l,r},"window",s.substring(l,r+1),"best",best);}
return best;`,
["Restart a set at every start and stop when uniqueness fails.","The optimized window is always unique. A repeated character requires moving left beyond its previous occurrence.","Use max when moving left: an occurrence outside the current window must never move the boundary backward."],["O(n²) upper bound, O(128)","O(n), O(128)"],[e("Repeated",'"abcabcbb"',"3"),e("Boundary trap",'"abba"',"2"),e("Empty",'""',"0")]),
  p("contains-duplicate", "Contains Duplicate", "Return true if any integer appears at least twice.", "boolean solve(int[] a)",
`for(int i=0;i<a.length;i++)for(int j=0;j<i;j++){emit("Compare two positions","indices",new int[]{j,i},"values",new int[]{a[j],a[i]});if(a[i]==a[j])return true;}return false;`,
`Set<Integer> seen=new HashSet<>();for(int x:a){boolean added=seen.add(x);emit("Insert only if absent","value",x,"seen",seen);if(!added)return true;}return false;`,
["Every duplicate supplies a pair of equal values at different indices.","A set compresses all earlier comparisons into one membership operation.","Hash lookup is expected constant time. Sorting gives an alternative O(n log n) approach when ordered data is useful later."],["O(n²), O(1)","O(n) expected, O(n)"],[e("Duplicate","new int[]{1,2,3,1}","true"),e("Unique","new int[]{1,2,3}","false")]),
  p("container-water", "Container With Most Water", "For nonnegative heights, maximize width × the smaller endpoint. Fewer than two walls returns 0.", "long solve(int[] a)",
`long best=0;for(int l=0;l<a.length;l++)for(int r=l+1;r<a.length;r++){best=Math.max(best,(long)(r-l)*Math.min(a[l],a[r]));emit("Test walls","walls",new int[]{l,r},"best",best);}return best;`,
`int l=0,r=a.length-1;long best=0;while(l<r){best=Math.max(best,(long)(r-l)*Math.min(a[l],a[r]));emit("Discard the shorter wall","walls",new int[]{l,r},"best",best);if(a[l]<=a[r])l++;else r--;}return best;`,
["Enumerate endpoint pairs and evaluate their area.","With a fixed shorter wall, moving the other endpoint inward only decreases width and cannot increase the limiting height.","Discard the shorter wall; at least one endpoint of an optimal unexplored pair remains in the shrinking interval."],["O(n²), O(1)","O(n), O(1)"],[e("Classic","new int[]{1,8,6,2,5,4,8,3,7}","49"),e("Single","new int[]{8}","0")]),
  p("fixed-window-sum", "Maximum Sum of K Elements", "Return the largest sum of exactly k consecutive values, with 1 ≤ k ≤ n.", "long solve(int[] a,int k)",
`long best=Long.MIN_VALUE;for(int l=0;l+k<=a.length;l++){long sum=0;for(int j=l;j<l+k;j++)sum+=a[j];best=Math.max(best,sum);emit("Recompute a full window","range",new int[]{l,l+k-1},"sum",sum,"best",best);}return best;`,
`long sum=0,best=Long.MIN_VALUE;for(int r=0;r<a.length;r++){sum+=a[r];if(r>=k)sum-=a[r-k];if(r>=k-1)best=Math.max(best,sum);emit("Add entering and subtract departing value","right",r,"sum",sum,"best",best);}return best;`,
["Sum each length-k interval independently to define the baseline.","Neighboring windows share k−1 elements. Keep that shared work in a running sum.","Update the answer only after a complete window exists. Negative values are valid because window length is fixed."],["O(nk), O(1)","O(n), O(1)"],[e("Mixed","new int[]{2,1,5,1,3,2},3","9"),e("Negative","new int[]{-3,-1,-2},2","-3")]),
  p("subarray-sum-k", "Subarray Sum Equals K", "Count nonempty contiguous subarrays summing to k. Negative values are allowed.", "long solve(int[] a,int k)",
`long count=0;for(int l=0;l<a.length;l++){long sum=0;for(int r=l;r<a.length;r++){sum+=a[r];if(sum==k)count++;emit("Check interval sum","range",new int[]{l,r},"sum",sum,"count",count);}}return count;`,
`Map<Long,Long> freq=new HashMap<>();freq.put(0L,1L);long sum=0,count=0;
for(int x:a){sum+=x;count+=freq.getOrDefault(sum-k,0L);freq.put(sum,freq.getOrDefault(sum,0L)+1);emit("Match earlier prefixes","prefix",sum,"count",count,"frequencies",freq);}return count;`,
["Each start/end pair defines one nonempty subarray.","If prefixRight − prefixLeft = k, an earlier prefix of sum−k creates a valid subarray ending here.","Seed the empty prefix once and query before insertion. Frequency, not mere membership, counts repeated prefixes; a standard positive-only sliding window does not handle negatives."],["O(n²), O(1)","O(n) expected, O(n)"],[e("Repeated","new int[]{1,1,1},2","2"),e("Zero sum","new int[]{1,-1,0},0","3")]),
  p("range-updates", "Corporate Flight Bookings / Difference Array", "Apply inclusive zero-based updates [left,right,increment] to n initially zero entries. Return final totals.", "long[] solve(int n,int[][] bookings)",
`long[] a=new long[n];for(int[] b:bookings){for(int i=b[0];i<=b[1];i++)a[i]+=b[2];emit("Update every covered position","booking",b,"totals",a);}return a;`,
`long[] diff=new long[n+1];for(int[] b:bookings){diff[b[0]]+=b[2];diff[b[1]+1]-=b[2];emit("Mark start and cancellation","booking",b,"difference",diff);}long[] a=new long[n];long sum=0;for(int i=0;i<n;i++){sum+=diff[i];a[i]=sum;emit("Reconstruct by prefix sum","index",i,"totals",a);}return a;`,
["Directly increment each covered position for every booking.","An interval changes the running total at exactly two boundaries: +delta at left and −delta after right.","A prefix scan reconstructs all totals. Allocate the sentinel n position so an update ending at n−1 has a valid cancellation slot."],["O(nq), O(n)","O(n+q), O(n)"],[e("Overlaps","5,new int[][]{{0,1,10},{1,2,20},{1,4,25}}","[10, 55, 45, 25, 25]")]),
  p("sort-array", "Sort an Array: Bubble Sort to Merge Sort", "Return integers sorted in ascending order, retaining duplicates.", "int[] solve(int[] a)",
`for(int end=a.length-1;end>0;end--){boolean changed=false;for(int i=0;i<end;i++)if(a[i]>a[i+1]){int t=a[i];a[i]=a[i+1];a[i+1]=t;changed=true;emit("Swap an inverted adjacent pair","array",a,"indices",new int[]{i,i+1});}if(!changed)break;}return a;`,
`int n=a.length;int[] temp=new int[n];for(int width=1;width<n;width*=2){for(int l=0;l<n;l+=2*width){int mid=Math.min(l+width,n),r=Math.min(l+2*width,n),i=l,j=mid,k=l;while(i<mid||j<r)temp[k++]=(j>=r||(i<mid&&a[i]<=a[j]))?a[i++]:a[j++];for(k=l;k<r;k++)a[k]=temp[k];emit("Merge two sorted runs","array",a,"bounds",new int[]{l,mid,r});}if(width>n/2)break;}return a;`,
["Bubble sort removes adjacent inversions; the largest remaining value reaches the end after each pass.","Merge sort begins with sorted singleton runs and repeatedly merges neighboring runs.","During merge, take the smallest available head; choosing the left on equality preserves stability. Each pass is linear and there are logarithmically many passes."],["O(n²) worst, O(1)","O(n log n), O(n); comparison-model worst-case optimal"],[e("Unsorted","new int[]{5,1,4,2,8,2}","[1, 2, 2, 4, 5, 8]"),e("Empty","new int[]{}","[]")]),
  p("lower-bound", "Binary Search: First Occurrence / Lower Bound", "Given a sorted array, return the first index with value ≥ target, or n if none exists.", "int solve(int[] a,int target)",
`for(int i=0;i<a.length;i++){emit("Scan to the first qualifying value","index",i,"value",a[i]);if(a[i]>=target)return i;}return a.length;`,
`int lo=0,hi=a.length;while(lo<hi){int mid=lo+(hi-lo)/2;emit("Maintain a half-open candidate range","bounds",new int[]{lo,mid,hi},"value",a[mid]);if(a[mid]<target)lo=mid+1;else hi=mid;}return lo;`,
["A left-to-right scan directly implements the first-qualifying-index definition.","Maintain [lo,hi): all values before lo are too small; all at or after hi qualify.","On equality retain mid by moving hi. This gives the first duplicate and an insertion position without a separate postprocessing scan."],["O(n), O(1)","O(log n), O(1)"],[e("Duplicates","new int[]{1,2,2,2,5},2","1"),e("After end","new int[]{1,2},9","2"),e("Empty","new int[]{},3","0")]),
  p("koko-bananas", "Koko Eating Bananas: Binary Search on Answer", "Positive piles and h ≥ number of piles. Find the smallest positive integer speed finishing all piles within h hours.", "int solve(int[] a,int h)",
`int max=Arrays.stream(a).max().orElse(0);for(int speed=1;speed<=max;speed++){long hours=0;for(int x:a)hours+=(x+(long)speed-1)/speed;emit("Try each speed","speed",speed,"hours",hours);if(hours<=h)return speed;}return max;`,
`int lo=1,hi=Arrays.stream(a).max().orElse(1);while(lo<hi){int mid=lo+(hi-lo)/2;long hours=0;for(int x:a)hours+=(x+(long)mid-1)/mid;emit("Feasibility becomes true as speed increases","bounds",new int[]{lo,mid,hi},"hours",hours);if(hours<=h)hi=mid;else lo=mid+1;}return lo;`,
["Check candidate speeds in increasing order and stop at the first feasible one.","Required hours never increase with speed, so feasibility partitions the answer space into false then true.","Binary-search the first true speed. Use integer ceiling division widened to long to avoid rounding errors and intermediate overflow."],["O(nM), O(1)","O(n log M), O(1), M maximum pile"],[e("Standard","new int[]{3,6,7,11},8","4"),e("Tight","new int[]{30,11,23,4,20},5","30")]),
];
