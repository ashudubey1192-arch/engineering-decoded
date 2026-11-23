import test from "node:test";
import assert from "node:assert/strict";
import { ipv4Subnet, pathCapacity, sendAllowance, dnsCacheSnapshot } from "../src/data/networkExperiments.js";

test("CIDR boundary preserves the host and handles /31 and /32 exceptions", () => {
  const host = [192, 168, 10, 77];
  assert.deepEqual(ipv4Subnet(host, 26), {
    network: "192.168.10.64", last: "192.168.10.127", mask: "255.255.255.192", size: 64,
    firstHost: "192.168.10.65", lastHost: "192.168.10.126", usable: 62, broadcast: "192.168.10.127",
  });
  const pointToPoint = ipv4Subnet(host, 31);
  assert.equal(pointToPoint.firstHost, "192.168.10.76");
  assert.equal(pointToPoint.lastHost, "192.168.10.77");
  assert.equal(pointToPoint.usable, 2);
  assert.equal(pointToPoint.broadcast, null);
  const hostRoute = ipv4Subnet(host, 32);
  assert.equal(hostRoute.network, "192.168.10.77");
  assert.equal(hostRoute.firstHost, hostRoute.lastHost);
  assert.equal(hostRoute.usable, 1);
  assert.equal(hostRoute.mask, "255.255.255.255");
  assert.equal(hostRoute.broadcast, null);
  const all = ipv4Subnet(host, 0);
  assert.equal(all.network, "0.0.0.0");
  assert.equal(all.last, "255.255.255.255");
  assert.equal(all.size, 4294967296);
  assert.equal(all.mask, "0.0.0.0");
  for (const prefix of [-1, 33, 1.5]) assert.throws(() => ipv4Subnet(host, prefix), RangeError);
  assert.throws(() => ipv4Subnet([256, 1, 2, 3], 24), RangeError);
});

test("bandwidth-delay calculation converts bits, milliseconds, and KiB correctly", () => {
  const small = pathCapacity(100, 80, 64);
  assert.equal(small.bdpBytes, 1000000);
  assert.equal(small.windowMbps, 6.5536);
  assert.equal(small.ceilingMbps, 6.5536);
  assert.equal(pathCapacity(100, 80, 1024).ceilingMbps, 100);
  assert.equal(pathCapacity(100, 160, 64).ceilingMbps, small.ceilingMbps / 2);
  assert.equal(pathCapacity(1000, 80, 64).ceilingMbps, small.ceilingMbps);
  assert.throws(() => pathCapacity(100, 0, 64), RangeError);
});

test("sender respects both windows and never yields negative new-data allowance", () => {
  assert.deepEqual(sendAllowance(48, 80, 32), { limit: 48, allowance: 16, limiting: "Receiver" });
  assert.deepEqual(sendAllowance(80, 48, 32), { limit: 48, allowance: 16, limiting: "Congestion" });
  assert.deepEqual(sendAllowance(48, 48, 32), { limit: 48, allowance: 16, limiting: "Both" });
  assert.equal(sendAllowance(0, 80, 32).allowance, 0);
  assert.equal(sendAllowance(48, 80, 128).allowance, 0);
});

test("DNS authority updates do not overwrite an unexpired resolver entry", () => {
  assert.equal(dnsCacheSnapshot(120, 29).authoritative, "192.0.2.10");
  assert.equal(dnsCacheSnapshot(120, 30).authoritative, "192.0.2.20");
  assert.equal(dnsCacheSnapshot(120, 30).cached, "192.0.2.10");
  assert.equal(dnsCacheSnapshot(120, 119).remaining, 1);
  assert.deepEqual(dnsCacheSnapshot(120, 120), { fresh: false, remaining: 0, authoritative: "192.0.2.20", cached: null });
  assert.equal(dnsCacheSnapshot(10, 20).authoritative, "192.0.2.10");
  assert.equal(dnsCacheSnapshot(10, 20).cached, null);
});
