// Subject models are authored separately from worked-example traces.
// Node count expresses the model, never a template's preferred number of steps.
const node = (id, label, detail) => ({ id, label, detail });
const model = (title, kind, scope, nodes, edges = []) => ({ title, kind, scope, nodes, edges });

export const osiLayers = [
  { number: 7, name: "Application", role: "Network-service meaning", pdu: "Application data / messages", identity: "Application names and resource identifiers", examples: "HTTP, DNS, SMTP (Internet examples)", detail: "Defines the operations that communicating applications request and the meaning of their responses. A browser uses HTTP methods, URLs, status codes, and headers; a resolver uses DNS questions and records. A successful lower-layer transfer cannot establish that an order is valid or a user is authorized." },
  { number: 6, name: "Presentation", role: "Agreed representation of information", pdu: "Presentation data", identity: "Representation / transfer syntax", examples: "Encoding, serialization, compression; cryptographic representation as a teaching analogy", detail: "Makes the representation intelligible to both peers: character encoding, number representation, serialization, and negotiated transfer syntax. Compression and encryption are often discussed here as transformations. Real Internet implementations distribute these functions across libraries and protocols; TLS is not a literal implementation of the complete OSI presentation service." },
  { number: 5, name: "Session", role: "Dialogue organization and synchronization", pdu: "Session data", identity: "Dialogue / synchronization context", examples: "Dialogue control, synchronization points, resynchronization", detail: "Organizes a continuing dialogue, its establishment and release, coordination, and synchronization. Checkpoints can support a protocol-defined restart rather than repeating an entire activity. A web login session or TCP connection is not automatically the OSI session layer; modern applications often implement comparable responsibilities without a separate session-layer module." },
  { number: 4, name: "Transport", role: "Communication between application endpoints", pdu: "TCP segment / UDP datagram", identity: "Ports plus endpoint addresses", examples: "TCP, UDP; QUIC supplies transport functions over UDP", detail: "Multiplexes communication for application endpoints and provides the chosen transport service. TCP adds ordered byte delivery, loss recovery, receiver flow control, and congestion control. UDP preserves datagram boundaries with a smaller service contract. Reliability is a property of a selected protocol, not an automatic promise of every transport service." },
  { number: 3, name: "Network", role: "Delivery across interconnected networks", pdu: "IP packet / datagram", identity: "IPv4 / IPv6 address", examples: "IP forwarding, routing, ICMP", detail: "Uses logical addresses and routes to move packets toward destinations across links. A router selects an outgoing interface and next hop; link framing changes on a routed hop. IP is best effort: it does not guarantee delivery, order, or a deadline. TTL or Hop Limit bounds packet lifetime in forwarding loops." },
  { number: 2, name: "Data Link", role: "Frame delivery on the current link", pdu: "Frame", identity: "Link address, such as an Ethernet MAC", examples: "Ethernet MAC, Wi-Fi MAC, VLAN tagging", detail: "Frames data for the local link, identifies local delivery endpoints where the technology uses addresses, coordinates media access, and detects certain transmission errors. Ethernet switches learn source MAC locations within a broadcast domain. Some links perform local retransmission; that does not establish end-to-end application success." },
  { number: 1, name: "Physical", role: "Signals over a medium", pdu: "Bits represented by physical symbols", identity: "No IP address or transport port", examples: "Copper signaling, optical transceivers, radio PHY", detail: "Defines how symbols are transmitted and recovered through electrical, optical, or radio properties, including timing, modulation or line coding, and physical interfaces. One symbol may encode several bits. A working carrier does not prove correct frames, IP configuration, naming, or application behavior." },
];

export const tcpIpLayers = [
  { number: 4, name: "Application", role: "Application protocols and supporting representation/dialogue", pdu: "Messages / data", identity: "Service names and application identifiers", examples: "HTTP, DNS, SMTP, SSH", detail: "Contains user and supporting protocols and the representation and conversation functions they require. OSI presentation and session responsibilities usually appear here in the common teaching comparison, without mandatory separate implementations. DNS is an application-layer protocol even when other applications depend on it to establish a connection." },
  { number: 3, name: "Transport", role: "Communication for endpoint processes", pdu: "TCP segments / UDP datagrams", identity: "Ports and endpoint addresses", examples: "TCP, UDP", detail: "Provides the selected end-to-end transport service over IP. TCP and UDP make different guarantees. Application write boundaries do not survive as TCP message boundaries, whereas UDP datagrams remain individual units. A transport acknowledgment does not prove that a business operation has committed." },
  { number: 2, name: "Internet", role: "Internetwork addressing and forwarding", pdu: "IP packets", identity: "IP addresses", examples: "IPv4, IPv6, ICMP", detail: "Moves packets across independently implemented links using addressing and routing. It offers best-effort delivery and relies on the link for a particular next-hop transmission. Routing control and packet forwarding are related but separate activities; a route can exist even when the next hop is unreachable." },
  { number: 1, name: "Link", role: "Access to the directly connected network", pdu: "Frames and transmitted symbols", identity: "Technology-specific link identifiers", examples: "Ethernet, Wi-Fi, point-to-point links", detail: "Encompasses the mechanisms needed to send an IP packet across a directly attached network, including framing and physical transmission. The common five-layer teaching model splits this layer into data link and physical. That is a change in explanatory granularity, not a fifth new Internet protocol that must be installed." },
];

const stack = (title, layers, scope) => ({ ...model(title, "stack", scope, layers.map(l => node(String(l.number), `Layer ${l.number}: ${l.name}`, `${l.role}. Unit: ${l.pdu}.`))), layers });

export const coreCsModels = {
  "computer-networks": {
    "osi-7-layer-model": stack("The seven layers of the OSI reference model", osiLayers, "All seven layers are shown, highest to lowest. Sending follows 7 → 1; receiving follows 1 → 7. These are responsibilities, not seven mandatory Internet headers or seven packets."),
    "tcp-ip-4-layer-model": stack("The four layers of the TCP/IP model", tcpIpLayers, "All four layers in the model used by this lesson. The link layer includes physical transmission. A five-layer teaching variant separates those link responsibilities."),
    "dhcp": model("DHCPv4 initial allocation: four DORA messages", "flow", "An ordinary successful initial allocation with one selected server. Renewal, relay forwarding, address conflict, rejection, and retry paths are additional cases explained in the lesson.", [
      node("discover", "1. DHCPDISCOVER", "Client searches for servers, often broadcasting before it has a usable address."),
      node("offer", "2. DHCPOFFER", "A server proposes an address, lease, and configuration; this is not yet the final allocation acknowledgment."),
      node("request", "3. DHCPREQUEST", "Client identifies its chosen offer; other offering servers can see which selection was made."),
      node("ack", "4. DHCPACK", "Selected server confirms the lease; client applies configuration after required validation."),
    ]),
    "tcp-connection-termination": model("Ordinary TCP close: both directions finish", "flow", "Four logical events for an ordinary active close. ACK and FIN may be combined; simultaneous close and reset take different paths. The application can half-close its write direction.", [
      node("fin-a", "A → B: FIN", "A has no more stream bytes to send. Its FIN consumes a sequence number."),
      node("ack-a", "B → A: ACK", "B acknowledges A's FIN but may continue sending its own remaining data."),
      node("fin-b", "B → A: FIN", "B finishes its sending direction independently after any remaining data."),
      node("ack-b", "A → B: ACK", "A acknowledges B's FIN. In this ordinary sequence A enters TIME_WAIT."),
    ]),
    "tls-handshake": model("TLS 1.3 full handshake responsibilities", "flow", "Simplified certificate-authenticated handshake without client authentication, resumption, or HelloRetryRequest. Several messages share a flight; rows are not a packet count.", [
      node("hello", "ClientHello", "Client offers supported versions, algorithms, and ephemeral key-share information."),
      node("server-hello", "ServerHello", "Server selects compatible parameters and a key share; handshake traffic keys can be derived."),
      node("extensions", "EncryptedExtensions", "Server communicates remaining negotiated settings inside handshake protection."),
      node("certificate", "Certificate", "Server supplies certificate identity material; client must validate trust and intended hostname."),
      node("verify", "CertificateVerify", "Server signs the handshake context to prove control of the authentication key."),
      node("server-finished", "Server Finished", "Client checks handshake integrity and the server's possession of derived secrets."),
      node("client-finished", "Client Finished", "Server verifies the client's Finished; application traffic uses its own derived traffic keys."),
    ]),
  },
  "operating-systems": {
    "process-states": model("The five-state process model", "states", "A conceptual teaching model. Linux task-state letters and runnable queues do not map one-to-one to these five boxes. Suspended variants add further states.", [
      node("new", "New", "Creation and admission are in progress; the task is not yet available for ordinary dispatch."),
      node("ready", "Ready", "The task can execute and waits for a CPU allocation."),
      node("running", "Running", "A CPU is executing this task's instructions."),
      node("blocked", "Blocked / Waiting", "The task awaits an event or resource and is not runnable merely because a CPU is idle."),
      node("terminated", "Terminated", "Execution ended; some status may remain until another process reaps it."),
    ], [["new", "ready", "admit"], ["ready", "running", "dispatch"], ["running", "ready", "preempt / yield"], ["running", "blocked", "wait for event"], ["blocked", "ready", "event completes"], ["running", "terminated", "exit"]]),
    "deadlock": model("All four Coffman conditions", "conditions", "The classical reusable-resource deadlock conditions must hold together. Boxes are conditions, not a chronological execution. A cycle is sufficient only under appropriate resource-instance assumptions.", [
      node("exclusive", "Mutual exclusion", "At least one needed resource cannot be used by conflicting holders simultaneously."),
      node("hold", "Hold and wait", "A task retains resources while waiting to obtain additional resources."),
      node("no-preemption", "No preemption", "Resources cannot simply be taken away safely by the resource manager."),
      node("cycle", "Circular wait", "A cycle of tasks waits for resources retained by the next task in the cycle."),
    ]),
    "the-memory-hierarchy": model("A typical memory and storage hierarchy", "stack", "Qualitative ordering only. Cache sizes, level count, sharing, latency, persistence, and NUMA placement depend on the machine. Storage does not behave as another CPU cache automatically.", [
      node("registers", "Registers", "Instruction-visible operands with very limited capacity."),
      node("l1", "L1 cache", "Small caches near execution, commonly split into instruction and data caches."),
      node("l2", "L2 cache", "Larger cache; organization and sharing depend on the processor."),
      node("llc", "Last-level cache", "Often an L3 shared across a group of cores, with architecture-specific topology."),
      node("ram", "Main memory", "DRAM holds resident pages; access includes controller and possible NUMA costs."),
      node("storage", "Persistent storage", "SSD or HDD retains files; OS paging and I/O move data through separate mechanisms."),
    ]),
    "fork-exec-wait-exit": model("Parent and child lifecycle responsibilities", "flow", "The parent can wait while the child runs; these rows describe responsibilities rather than a single thread executing all four calls. A failed exec leaves the old child image in place.", [
      node("fork", "fork: create a child", "Both processes resume with different return values and logically separate address spaces."),
      node("exec", "exec: replace the child image", "Successful replacement keeps process identity but installs the new program and mappings."),
      node("exit", "exit: end execution", "Kernel releases most resources and retains waitable termination information."),
      node("wait", "wait: collect child status", "Parent or designated reaper observes termination and releases the remaining waitable record."),
    ]),
    "page-faults": model("A page-fault decision path", "flow", "A fault is not synonymous with disk I/O. Invalid accesses terminate or signal instead of following the recovery path. Exact locking, retry, and asynchronous steps are OS-specific.", [
      node("access", "Faulting memory access", "Translation or access permission cannot satisfy the instruction under current mappings."),
      node("trap", "Trap to the kernel", "Hardware supplies the fault address and access context to the handler."),
      node("validate", "Validate the virtual region", "Reject an invalid address or prohibited operation; otherwise identify the recoverable case."),
      node("obtain", "Obtain the correct contents", "Map resident data, supply a zero-filled page, perform copy-on-write, or fetch backing storage."),
      node("install", "Install a valid mapping", "Update page tables and relevant translation caches with the correct permissions."),
      node("resume", "Resume or retry the instruction", "Execution proceeds if the fault was resolved; errors take a different outcome."),
    ]),
    "namespaces": model("Linux namespace types", "collection", "Each type isolates a particular view, not every kernel resource. Namespace availability and delegation depend on kernel configuration and permissions; resource quotas belong to other mechanisms.", [
      node("mnt", "Mount", "Filesystem mount view."), node("pid", "PID", "Process identifiers and namespace ancestry."),
      node("net", "Network", "Network devices, addresses, routes, ports, and related state."), node("ipc", "IPC", "System V IPC and POSIX message queue namespaces."),
      node("uts", "UTS", "Hostname and NIS domain name."), node("user", "User", "User/group identifier mappings and scoped capabilities."),
      node("cgroup", "Cgroup", "View of cgroup paths; not the resource controller limits themselves."), node("time", "Time", "Selected clocks' offsets; not arbitrary independent wall-clock time."),
    ]),
  },
};

export function getCoreCsModel(course, topic) {
  return coreCsModels[course]?.[topic];
}
