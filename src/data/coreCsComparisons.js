export const coreCsComparisons = {
  "operating-systems": {
    "kernel-architectures": {
      title: "Three kernel architecture families", columns: ["Architecture", "Where services execute", "Trade-off"],
      rows: [["Monolithic", "Many kernel services and drivers execute in a shared privileged address space", "Direct calls can be efficient; faulty privileged code can affect the whole kernel"], ["Microkernel", "A smaller kernel provides core mechanisms; more services run in separate processes", "Isolation and replaceability improve, while IPC and coordination introduce costs"], ["Hybrid", "Combines architectural ideas; the exact privileged boundary is implementation-specific", "Explain a particular system's boundaries rather than inferring them from the label"]],
      note: "A monolithic kernel can load modules. Modularity of source or deployment is different from isolating a service in a user-space address space.",
    },
    "fcfs-sjf-and-srtf": {
      title: "FCFS, SJF, and SRTF decisions", columns: ["Algorithm", "Selection rule", "Preemption", "Main limitation"],
      rows: [["FCFS", "Earliest ready-queue arrival", "No, in the basic model", "A long CPU burst can delay many short jobs"], ["SJF", "Shortest predicted next CPU burst among ready jobs", "No", "Future burst length must be estimated; long jobs may starve"], ["SRTF", "Shortest estimated remaining burst among ready jobs", "Yes, on a better candidate", "Estimation, preemption overhead, and possible starvation"]],
      note: "Results depend on arrival times, tie-breaking, burst predictions, and context-switch overhead. A waiting job is not selected before its arrival.",
    },
    "mutexes-semaphores-and-condition-variables": {
      title: "Three synchronization primitives with different contracts", columns: ["Primitive", "State / responsibility", "Correct use", "Typical error"],
      rows: [["Mutex", "Exclusive ownership", "Protect a shared invariant with matching lock/unlock", "Assuming it counts available resources"], ["Semaphore", "A count of permits", "Acquire before using bounded capacity; release when finished", "Losing or duplicating a permit on an error path"], ["Condition variable", "Wait/wake coordination around a predicate", "Test the predicate in a loop under its mutex; wait releases and reacquires the mutex", "Treating notification as stored state or proof the predicate remains true"]],
      note: "A wakeup is permission to recheck, not ownership of the desired resource. Ownership and permitted unlocking behavior depend on the primitive's API.",
    },
    "page-replacement-algorithms": {
      title: "Victim selection policies", columns: ["Policy", "Eviction choice", "Information required", "Important property"],
      rows: [["FIFO", "Page resident longest since insertion", "Arrival queue", "Can exhibit Belady's anomaly"], ["Optimal (OPT)", "Page whose next reference is farthest in the future", "Future reference string", "Offline lower bound for comparison, not a real predictor"], ["LRU", "Least recently accessed resident page", "Recency history or approximation", "Exact LRU is a stack policy; maintaining exact recency can be expensive"], ["Clock / second chance", "Scan circularly, clearing set reference bits and selecting an eligible unreferenced page", "Reference bits and a clock hand", "Approximates recency; dirty/writeback state complicates real reclamation"]],
      note: "These are textbook page-replacement policies. Production kernels use additional accounting and reclamation mechanisms; the lesson does not claim a real kernel implements this simple table literally.",
    },
    "memory-metrics": {
      title: "VSZ, RSS, PSS, and swap", columns: ["Metric", "What it counts", "What it does not establish"],
      rows: [["VSZ / virtual size", "Mapped virtual address ranges under the tool's accounting", "That the entire range is backed by resident RAM"], ["RSS", "Resident pages attributed to a process", "Unique ownership; shared pages can be counted in multiple processes"], ["PSS", "Resident shared pages apportioned among their mappings, plus private resident pages", "A permanent ownership share or exact future memory pressure"], ["Swap accounting", "Pages represented in swap under the reported metric", "That the process is currently doing swap I/O"]],
      note: "Compare the same sampling interval and accounting scope. Process, cgroup, and whole-machine views answer different questions.",
    },
    "raid": {
      title: "RAID 0, 1, 5, 6, and 10", columns: ["Level", "Layout", "Usable capacity", "Disk failure tolerance"],
      rows: [["RAID 0", "Striping without redundancy", "N × S", "None; one disk loss can lose the array"], ["RAID 1", "Mirrored copies", "S for one N-way mirror", "Up to N−1 if all members mirror the same data and one survives"], ["RAID 5", "Striping with single distributed parity", "(N−1) × S; N ≥ 3", "One disk"], ["RAID 6", "Striping with two independent parity equations", "(N−2) × S; N ≥ 4", "Two disks"], ["RAID 10", "Striping over mirrored pairs", "(N/2) × S for N even, N ≥ 4", "One per mirror pair; losing both members of one pair fails that layout"]],
      note: "Capacity assumes equal-sized drives of size S and excludes metadata, spares, filesystem overhead, and implementation constraints. RAID is not a backup and does not prevent accidental deletion or all correlated failures.",
    },
    "readiness-and-completion-models": {
      title: "Readiness, completion, and trigger behavior", columns: ["Contract", "Notification means", "Application responsibility"],
      rows: [["Readiness", "An operation may now make progress", "Attempt nonblocking I/O and still handle would-block, errors, and closure"], ["Completion", "A submitted operation has completed under the API's contract", "Inspect result and byte count; retain buffers until ownership can safely return"], ["Level-triggered readiness", "The readiness condition remains true", "Avoid leaving an always-ready interest registered without useful work"], ["Edge-triggered readiness", "A relevant readiness transition has occurred", "Drain until would-block or follow the API's rearm contract so progress is not stranded"]],
      note: "Synchronous/asynchronous and blocking/nonblocking describe related but distinct API properties. Do not infer a completion contract from the word event alone.",
    },
  },
  "computer-networks": {
    "osi-7-layer-model": {
      title: "OSI to TCP/IP responsibility mapping", columns: ["OSI", "Common TCP/IP teaching grouping", "Caveat"],
      rows: [["7 Application", "Application", "Network service semantics"], ["6 Presentation", "Application facilities / libraries", "No mandatory separate Internet layer"], ["5 Session", "Application dialogue facilities", "Session responsibilities are not automatically a TCP connection"], ["4 Transport", "Transport", "Protocol guarantees vary"], ["3 Network", "Internet", "IP's best-effort internetwork delivery"], ["2 Data Link", "Link", "Local framing and media access"], ["1 Physical", "Link in the four-layer model", "A five-layer teaching model separates Physical"]],
      note: "This is an approximate teaching comparison, not a normative rule that every protocol maps to one and only one OSI layer.",
    },
    "tcp-vs-udp": {
      title: "TCP and UDP service contracts", columns: ["Property", "TCP", "UDP"],
      rows: [["Application-visible unit", "Ordered byte stream; application must frame messages", "Individual datagrams"], ["Establishment", "Connection handshake and state", "No TCP-style wire handshake required"], ["Loss / order", "Protocol recovery and ordered stream delivery", "No built-in TCP-style delivery or ordering guarantee"], ["Flow / congestion control", "Receiver flow control and congestion control", "Application or overlying protocol must supply suitable controls"], ["Header baseline", "20 bytes before options", "8 bytes"], ["Successful local send", "Does not prove business operation committed", "Does not prove remote delivery or processing"]],
      note: "UDP is not automatically faster or suitable for every low-latency task. QUIC supplies transport and security machinery over UDP; those guarantees come from QUIC.",
    },
    "http-1-vs-2-vs-3": {
      title: "HTTP versions and loss dependencies", columns: ["Version", "Carrier", "Multiplexing", "Loss / ordering boundary"],
      rows: [["HTTP/1.1", "Usually TCP; TLS for HTTPS", "No independently interleaved response streams within one ordinary connection", "Responses in a pipeline are ordered; TCP stream loss also delays delivery"], ["HTTP/2", "TCP; commonly TLS", "HTTP frames from multiple streams share one connection", "Missing TCP bytes can block delivery across HTTP streams"], ["HTTP/3", "QUIC over UDP", "Independent QUIC streams carry exchanges", "Loss blocks required bytes on affected streams; connection-wide congestion and other dependencies remain"]],
      note: "Methods, statuses, and many HTTP semantics persist across versions. Header compression is HPACK in HTTP/2 and QPACK in HTTP/3; compression is not encryption.",
    },
    "dns-record-types": {
      title: "Common DNS record types and their jobs", columns: ["Type", "Data / purpose", "Common misunderstanding"],
      rows: [["A", "IPv4 address", "Not a port or URL"], ["AAAA", "IPv6 address", "A healthy A record does not prove AAAA is correct"], ["CNAME", "Alias to another DNS name", "Does not issue an HTTP redirect or change the requested URL path"], ["MX", "Mail exchanger and preference", "Identifies mail routing, not a website"], ["NS", "Authoritative name-server names", "Delegation must agree with the actual serving configuration"], ["SOA", "Zone authority metadata and timing fields", "Zone serial is not a global instantaneous cache invalidation"], ["TXT", "Text consumed by various protocols", "Meaning depends on the consuming protocol"], ["PTR", "Reverse lookup target name", "Reverse identity alone does not authenticate a peer"], ["SRV", "Service target, port, priority, and weight", "Clients must support the service-discovery convention"], ["CAA", "Certificate issuance authorization policy", "Does not replace certificate validation by a client"]],
      note: "These common types are not the entire extensible DNS registry. DNSSEC adds types such as DNSKEY, DS, and RRSIG, explained in the DNSSEC chapter.",
    },
  },
};
