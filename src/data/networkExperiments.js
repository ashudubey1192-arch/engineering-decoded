// Small deterministic teaching models, not measurements of a live network.
export function ipv4Subnet(octets, prefix) {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32 || octets.length !== 4 ||
      octets.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {
    throw new RangeError("Use four IPv4 octets and a prefix from 0 to 32");
  }
  const address = octets.reduce((value, octet) => value * 256 + octet, 0);
  const size = 2 ** (32 - prefix);
  const start = Math.floor(address / size) * size;
  const end = start + size - 1;
  const format = value => [24, 16, 8, 0].map(shift => Math.floor(value / 2 ** shift) % 256).join(".");
  const conventional = prefix < 31;
  return {
    network: format(start), last: format(end), mask: format(2 ** 32 - size), size,
    firstHost: format(conventional ? start + 1 : start),
    lastHost: format(conventional ? end - 1 : end),
    usable: conventional ? size - 2 : size,
    broadcast: conventional ? format(end) : null,
  };
}

export function pathCapacity(mbps, rttMs, windowKiB) {
  if (![mbps, rttMs, windowKiB].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError("Rate, RTT, and window must be positive");
  }
  const bdpBytes = mbps * 1e6 * (rttMs / 1000) / 8;
  const windowMbps = windowKiB * 1024 * 8 / (rttMs / 1000) / 1e6;
  return { bdpBytes, windowMbps, ceilingMbps: Math.min(mbps, windowMbps) };
}

export function sendAllowance(receiveWindow, congestionWindow, inFlight) {
  const limit = Math.min(receiveWindow, congestionWindow);
  return { limit, allowance: Math.max(0, limit - inFlight), limiting: receiveWindow < congestionWindow ? "Receiver" : congestionWindow < receiveWindow ? "Congestion" : "Both" };
}

export function dnsCacheSnapshot(ttl, elapsed, changeAt = 30) {
  const fresh = elapsed < ttl;
  const authoritative = elapsed < changeAt ? "192.0.2.10" : "192.0.2.20";
  return { fresh, remaining: Math.max(0, ttl - elapsed), authoritative, cached: fresh ? "192.0.2.10" : null };
}
