import { useState } from "react";
import { dnsCacheSnapshot, ipv4Subnet, pathCapacity, sendAllowance } from "../../data/networkExperiments.js";
import "./NetworkConceptLab.css";

function Range({ label, value, min, max, step = 1, onChange, unit }) {
  return <label className="networkRange"><span>{label}: <strong>{value} {unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} /></label>;
}

function Subnet() {
  const [prefix, setPrefix] = useState(26);
  const result = ipv4Subnet([192, 168, 10, 77], prefix);
  return <>
    <h3>Experiment: move the subnet boundary</h3>
    <p>Keep the host address at 192.168.10.77 and change its prefix. This experiment uses private example addresses and does not change your computer's network settings.</p>
    <Range label="Prefix length" value={prefix} min={24} max={32} onChange={setPrefix} unit="bits" />
    <div className="networkBits" role="img" aria-label={`Last octet 77 in binary: 01001101. ${prefix - 24} network bits and ${32 - prefix} host bits.`}>{"01001101".split("").map((bit, index) => <span key={index} className={index < prefix - 24 ? "networkBit" : "hostBit"}>{bit}<small>{index < prefix - 24 ? "N" : "H"}</small></span>)}</div>
    <p>N = network bit; H = host bit. The first 24 address bits are network bits throughout this example.</p>
    <dl className="networkMetrics"><div><dt>Prefix</dt><dd>{result.network}/{prefix}</dd></div><div><dt>Mask</dt><dd>{result.mask}</dd></div><div><dt>Total addresses</dt><dd>{result.size}</dd></div><div><dt>{prefix < 31 ? "Broadcast" : "Broadcast address"}</dt><dd>{result.broadcast || "Not used in this case"}</dd></div></dl>
    <p role="status">{prefix === 32 ? `Host route: ${result.firstHost} only.` : prefix === 31 ? `Point-to-point /31: both ${result.firstHost} and ${result.lastHost} can be endpoint addresses.` : `Conventional host range: ${result.firstHost} through ${result.lastHost} (${result.usable} addresses).`}</p>
    <p>Address count = 2^(32 − prefix). The traditional subtract-two rule applies to the multi-access subnet examples here; /31 point-to-point links and /32 host routes are explicit exceptions.</p>
    <button onClick={() => setPrefix(26)}>Reset to /26</button>
  </>;
}

function BandwidthDelay() {
  const [rate, setRate] = useState(100);
  const [rtt, setRtt] = useState(80);
  const [window, setWindow] = useState(64);
  const result = pathCapacity(rate, rtt, window);
  return <>
    <h3>Experiment: fill the network path</h3>
    <p>Idealized steady-state, one-direction transfer with unlimited application data, no loss, and no setup or host bottleneck. The usable window and path capacity are the only rate limits modeled.</p>
    <Range label="Path capacity" value={rate} min={10} max={1000} step={10} unit="Mb/s" onChange={setRate} />
    <Range label="Round-trip time" value={rtt} min={10} max={200} step={10} unit="ms" onChange={setRtt} />
    <Range label="Usable in-flight window" value={window} min={16} max={4096} step={16} unit="KiB" onChange={setWindow} />
    <div className="networkCapacityTrack" role="img" aria-label={`Modeled throughput ceiling is ${(100 * result.ceilingMbps / rate).toFixed(1)} percent of path capacity`}><span style={{ width: `${100 * result.ceilingMbps / rate}%` }} /></div>
    <dl className="networkMetrics"><div><dt>Bandwidth-delay product</dt><dd>{Math.round(result.bdpBytes).toLocaleString()} bytes</dd></div><div><dt>Window / RTT ceiling</dt><dd>{result.windowMbps.toFixed(2)} Mb/s</dd></div><div><dt>Combined modeled ceiling</dt><dd>{result.ceilingMbps.toFixed(2)} Mb/s</dd></div></dl>
    <p role="status">{result.windowMbps < rate ? "The window limits this model. Increasing bandwidth alone leaves unused path capacity." : "The window is large enough for this idealized path; capacity is now the limiting factor."}</p>
    <p>BDP = bits/second × RTT seconds ÷ 8. KiB means 1,024 bytes; Mb/s means 1,000,000 bits/second. Actual TCP can be slower because of startup, loss, receiver behavior, and application pacing.</p>
  </>;
}

function Windows() {
  const [receive, setReceive] = useState(48);
  const [congestion, setCongestion] = useState(80);
  const [flight, setFlight] = useState(32);
  const result = sendAllowance(receive, congestion, flight);
  return <>
    <h3>Experiment: who is limiting the sender?</h3>
    <p>Compare receiver capacity with the sender's congestion limit. Values are simplified volumes in KiB; this is an allowance calculator, not a full TCP implementation or packet trace.</p>
    <Range label="Receive window" value={receive} min={0} max={128} step={8} unit="KiB" onChange={setReceive} />
    <Range label="Congestion window" value={congestion} min={8} max={128} step={8} unit="KiB" onChange={setCongestion} />
    <Range label="Already in flight" value={flight} min={0} max={128} step={8} unit="KiB" onChange={setFlight} />
    <div className="networkWindowRows">{[["Receiver", receive], ["Congestion", congestion], ["In flight", flight]].map(([label, value]) => <div key={label}><span>{label}</span><meter min="0" max="128" value={value} aria-label={`${label} volume`} /><strong>{value} KiB</strong></div>)}</div>
    <p role="status">{result.limiting} limit: {result.limit} KiB. New-data allowance: {result.allowance} KiB.</p>
    <p>Allowance = max(0, min(receive window, congestion window) − bytes in flight). If a limit falls below outstanding volume, those bytes do not disappear; the sender cannot simply release more new data. Real transmission also depends on pacing, application data, and recovery state.</p>
  </>;
}

function DnsCache() {
  const [ttl, setTtl] = useState(120);
  const [elapsed, setElapsed] = useState(40);
  const result = dnsCacheSnapshot(ttl, elapsed);
  return <>
    <h3>Experiment: why DNS changes are not immediate</h3>
    <p>A resolver cached 192.0.2.10 at time 0. The authoritative answer changes to 192.0.2.20 at time 30 seconds. These are documentation addresses. Inspect the original cache entry without background refreshes, prefetching, or additional cache layers.</p>
    <Range label="Original cached TTL" value={ttl} min={10} max={300} step={10} unit="seconds" onChange={setTtl} />
    <Range label="Time since caching" value={elapsed} min={0} max={300} step={10} unit="seconds" onChange={setElapsed} />
    <dl className="networkMetrics"><div><dt>Authoritative answer now</dt><dd>{result.authoritative}</dd></div><div><dt>Original entry remaining TTL</dt><dd>{result.remaining} seconds</dd></div><div><dt>Resolver's reusable entry</dt><dd>{result.cached || "Expired"}</dd></div></dl>
    <p role="status">{result.fresh ? `The resolver can reuse ${result.cached} without querying the authority, even if the authority now has a newer answer.` : `The original entry is expired. A fresh successful lookup in this model would obtain ${result.authoritative}.`}</p>
    <p>Moving the TTL slider starts a different hypothetical cache history; it does not change a previously cached entry remotely. The model stops at expiration rather than silently simulating a renewal. Lower real TTLs before a planned migration and allow old cached lifetimes to drain.</p>
    <div className="networkControls"><button onClick={() => setElapsed(0)}>Time 0</button><button onClick={() => setElapsed(30)}>Authority changes</button><button onClick={() => setElapsed(ttl)}>Original entry expires</button></div>
  </>;
}

const experiments = {
  "subnetting-and-cidr": Subnet, "ipv4-addressing": Subnet, "how-routing-works": Subnet,
  "bandwidth-delay-product": BandwidthDelay, "latency-vs-throughput-vs-bandwidth": BandwidthDelay, "tcp-optimization": BandwidthDelay,
  "flow-control-sliding-window": Windows, "congestion-control": Windows, "tcp-tuning-knobs": Windows,
  "dns-caching-and-ttls": DnsCache, "dns-hierarchy": DnsCache, "debugging-dns": DnsCache,
};

export default function NetworkConceptLab({ topic }) {
  const Experiment = experiments[topic];
  return Experiment ? <section className="networkConceptLab" aria-label="Interactive networking experiment"><Experiment /></section> : null;
}
