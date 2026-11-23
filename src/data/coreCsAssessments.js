export const coreCsAssessments = {
  "computer-networks": {
    "osi-7-layer-model": [
      ["Name all seven OSI layers from lowest to highest.", "1 Physical, 2 Data Link, 3 Network, 4 Transport, 5 Session, 6 Presentation, 7 Application. Sending is explained from the top downward; receiving is explained from the bottom upward. Seven reference-model layers do not require seven separately visible Internet headers."],
      ["A laptop sends to a remote server through a gateway. Which destination is in its first Ethernet frame, and which is in its IP packet?", "Under ordinary routed Ethernet delivery without translation, the frame names the gateway's local MAC address and the IP packet names the server's IP address. The gateway is the next link-layer recipient, not the final application destination. Subsequent routed links use fresh framing."],
      ["Why can a TCP connection succeed while an HTTP request fails?", "TCP establishment demonstrates transport communication for those endpoints at that moment. TLS identity can still fail, the request can be unauthorized or malformed, and the service can return an application error. Transport delivery does not prove that the requested business operation succeeded."],
      ["Are a login cookie and TLS literally the OSI Session and Presentation layers?", "No strict one-to-one claim is justified. Cookies support an application-defined session, and TLS provides a protected authenticated channel under its protocol. They illustrate some dialogue or representation-related responsibilities, but neither implements every service of the corresponding OSI reference layer."],
      ["With 1,000 TCP payload bytes, 20-byte TCP and IPv4 headers, and ordinary untagged Ethernet, what sizes do you obtain?", "The TCP segment is 1,020 bytes; the IPv4 packet is 1,040; the Ethernet frame from destination MAC through FCS is 1,058. Preamble, start delimiter, inter-frame gap, options, tags, and any application/TLS overhead were excluded or separately accounted for. The IP MTU constrains the IP packet, not that entire wire-time footprint."],
      ["Does a switch, router, or reverse proxy always operate at just one layer?", "Describe the function rather than only the device name. Basic switching forwards by link-layer information, IP routing forwards by network-layer information, and a reverse proxy can terminate several protocol layers and open another connection. A single device can implement multiple functions."],
      ["A link is up and ping works, but HTTPS is unavailable. What should you check next?", "Use the actual hostname and address family, verify its DNS answer, test the intended transport endpoint, then inspect TLS identity/negotiation and the HTTP response. A ping is a different exchange and can be governed by different filtering. For size-dependent failures, also investigate MTU and loss evidence rather than assuming an application-only cause."],
      ["Explain why OSI has seven layers while this course's TCP/IP model has four.", "The models group responsibilities differently. The common TCP/IP grouping includes application representation/dialogue facilities within Application and physical transmission within Link. Transport and Internet provide their respective endpoint and internetwork functions. A five-layer teaching variant splits Link into Data Link and Physical; it does not change OSI's seven-layer definition."],
    ],
    "tcp-ip-4-layer-model": [
      ["List every layer and place physical transmission correctly.", "Application, Transport, Internet, and Link, from highest to lowest. Link includes physical transmission in this four-layer grouping. The five-layer teaching variant explicitly splits Data Link and Physical."],
      ["Why is DNS an application protocol even when the browser needs it first?", "Dependency order is different from encapsulation. A DNS query is itself an application message carried through a suitable transport, IP, and link. Its answer is then used by a separate web exchange. DNS is not a layer underneath IP."],
      ["What extra framing does an application using TCP need?", "TCP is a byte stream. The application must identify its own message boundaries, for example with a validated length field or protocol-defined delimiter/framing, and handle partial reads and writes. Packet and socket-read boundaries are not a substitute."],
    ],
  },
  "operating-systems": {
    "process-states": [
      ["What is the difference between Ready and Blocked?", "A Ready task can run when selected by a scheduler. A Blocked task is waiting for an event or resource and cannot make the required progress just because a CPU is free. These require different diagnosis: CPU contention versus the awaited event."],
      ["Does I/O completion move a task directly from Blocked to Running?", "In the five-state model it moves from Blocked to Ready. Dispatch then moves Ready to Running. Some real execution paths may schedule promptly, but wakeup itself is not the guarantee that execution has begun."],
      ["Where do New and Terminated fit, and how does a zombie relate?", "New represents creation/admission before ordinary readiness. Terminated means execution has ended. A zombie is a system-specific retained termination record waiting to be reaped, not a runnable process that still performs application work. Kernel task-state letters need their own mapping rather than being assumed identical to this teaching model."],
    ],
    "deadlock": [
      ["List all four classical necessary conditions for reusable-resource deadlock.", "Mutual exclusion, hold and wait, no preemption, and circular wait. All must hold in the classical model. Prevention makes at least one impossible; avoidance makes grant decisions using a safety model; detection identifies an existing deadlock before recovery."],
      ["What does ordering two locks prevent?", "A global acquisition order prevents a circular chain caused by conflicting acquisition orders, provided every relevant path follows the order. It does not automatically prevent deadlocks involving other resources, callbacks, external services, or waits outside that lock-order model."],
      ["Does a cycle in a resource-allocation graph always prove deadlock?", "With a single instance of each resource type under the standard assumptions, a cycle establishes the deadlock relationship. With multiple instances, a cycle alone is not sufficient; an available or soon-released instance can allow progress. Model actual allocations and outstanding requests."],
    ],
  },
};

export const coreCsReferences = {
  "computer-networks": [
    { title: "ITU-T X.200: OSI Basic Reference Model", href: "https://www.itu.int/rec/T-REC-X.200-199407-I/en" },
    { title: "RFC 1122: Internet host communication layers", href: "https://www.rfc-editor.org/rfc/rfc1122.html" },
    { title: "RFC 9293: TCP", href: "https://www.rfc-editor.org/rfc/rfc9293.html" },
    { title: "RFC 9110: HTTP semantics", href: "https://www.rfc-editor.org/rfc/rfc9110.html" },
    { title: "RFC 8446: TLS 1.3", href: "https://www.rfc-editor.org/rfc/rfc8446.html" },
  ],
  "operating-systems": [
    { title: "Linux kernel documentation", href: "https://docs.kernel.org/" },
    { title: "Linux man-pages project", href: "https://www.kernel.org/doc/man-pages/" },
    { title: "POSIX specifications", href: "https://pubs.opengroup.org/onlinepubs/9799919799/" },
  ],
};
