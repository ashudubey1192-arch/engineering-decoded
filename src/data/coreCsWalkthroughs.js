import { getCoreCsModel } from "./coreCsModels.js";

const modelJourneys = {
  "osi-7-layer-model": "Follow a sending host through all seven OSI responsibilities, from Application (7) to Physical (1). The receiving host interprets the corresponding responsibilities from Physical (1) back to Application (7). This is a reference-model journey, not seven mandatory Internet packets or headers.",
  "tcp-ip-4-layer-model": "Follow an application message through all four TCP/IP layers: Application, Transport, Internet, and Link. The receiving endpoint interprets the encapsulation in reverse. The physical transmission is included in Link in this model.",
  "dhcp": "Trace a successful initial DHCPv4 address allocation through Discover, Offer, Request, and Acknowledge. This scenario assumes one selected server and omits lease renewal and failure branches, which are explained separately.",
  "tcp-connection-termination": "A client finishes sending, the server acknowledges and completes its remaining output, and then the server closes its sending direction. Trace both independent FINs and their acknowledgments; real packets can combine events.",
  "tls-handshake": "Trace the seven responsibilities shown for a TLS 1.3 full certificate-authenticated handshake, without client authentication or resumption. The rows are message responsibilities, not seven round trips or seven packets.",
};

export function getCoreCsWalkthrough(course, topic) {
  const model = getCoreCsModel(course, topic);
  if (course === "computer-networks" && modelJourneys[topic]) {
    return {
      scenario: modelJourneys[topic], modelJourney: true,
      states: model.nodes.map(n => [n.label, n.label, n.detail,
        model.layers?.find(l => String(l.number) === n.id)?.detail || `Complete this responsibility before the next applicable event. ${model.scope}`]),
    };
  }
  if (course === "operating-systems" && topic === "process-states") return {
    scenario: "A new process is admitted, dispatched, blocks for input, becomes ready when input arrives, runs again, is preempted, and finally runs to completion. Repeated visits matter: Ready and Running are different states.",
    states: [
      ["Created", "New", "Kernel creates the task and its bookkeeping", "Admission has not yet made it runnable"],
      ["Admitted", "Ready", "Task joins the runnable set", "A CPU allocation is still required"],
      ["Dispatched", "Running", "Scheduler selects the task", "It now executes instructions"],
      ["Wait for input", "Blocked / Waiting", "No input is available and the operation waits", "The task leaves the runnable set"],
      ["Input arrives", "Ready", "Completion wakes the task", "Waking does not guarantee immediate execution"],
      ["Dispatched again", "Running", "Scheduler grants a CPU", "The task continues after its wait"],
      ["Preempted", "Ready", "Another task receives the CPU", "This task is runnable, not blocked on an event"],
      ["Runs again", "Running", "Scheduler dispatches it later", "Execution approaches normal completion"],
      ["Exits", "Terminated", "Execution ends and resources are released", "Waitable status can remain until reaped"],
    ],
  };
  return null;
}
