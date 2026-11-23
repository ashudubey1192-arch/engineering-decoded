import osBase from "./operating-systems.json" with { type: "json" };
import networkBase from "./computer-networks.json" with { type: "json" };
import osFoundations from "./os-foundations-audit.json" with { type: "json" };
import osSystems from "./os-systems-audit.json" with { type: "json" };
import osSecurityOps from "./os-security-ops-audit.json" with { type: "json" };
import networkAudit from "./network-audit.json" with { type: "json" };
import networkModels from "./network-model-audit.json" with { type: "json" };
import networkPractice from "./network-practice-audit.json" with { type: "json" };

const merge = (base, ...additions) => Object.fromEntries(Object.entries(base).map(([id, sections]) => [id, [
  ...sections, ...additions.flatMap(extra => extra[id] || []),
]]));

export const osDepth = merge(osBase, osFoundations, osSystems, osSecurityOps);
export const networkDepth = merge(networkBase, networkAudit, networkModels, networkPractice);
export const auditedDepth = {
  "operating-systems": { ...osFoundations, ...osSystems, ...osSecurityOps },
  "computer-networks": { ...networkAudit, ...networkModels, ...networkPractice },
};
