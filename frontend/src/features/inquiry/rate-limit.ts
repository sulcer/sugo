// ponytail: per-instance memory, serverless instances don't share it, so the real ceiling is the
// limit times the number of live instances; move to a shared store (e.g. Upstash) if abuse appears.
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}) {
  const hits = new Map<string, number[]>();
  return function allow(key: string): boolean {
    const t = now();
    // Housekeeping only: a pruned key and a stale one answer identically, so nothing tests this line.
    if (hits.size > 1000)
      for (const [k, times] of hits) if (times.every((at) => t - at >= windowMs)) hits.delete(k);
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
    const allowed = recent.length < limit;
    if (allowed) recent.push(t);
    hits.set(key, recent);
    return allowed;
  };
}

/**
 * One visitor's key. An IPv6 subscriber is handed a whole /64 and can pick any address in it, so the
 * network counts, not the address.
 */
export function networkKey(ip: string): string {
  const [address = ''] = ip.split('%');
  if (!address.includes(':')) return address;
  const [head = '', tail = ''] = address.split('::');
  const left = head.split(':').filter(Boolean);
  const right = tail.split(':').filter(Boolean);
  const gap = address.includes('::') ? Math.max(0, 8 - left.length - right.length) : 0;
  const groups = [...left, ...Array.from({ length: gap }, () => '0'), ...right];
  return `${groups
    .slice(0, 4)
    .map((group) => (parseInt(group, 16) || 0).toString(16))
    .join(':')}::/64`;
}

/** Per network, under an overall ceiling so rotating addresses cannot drain the mail quota. */
export function createInquiryLimiter(now?: () => number) {
  const perNetwork = createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now });
  const overall = createRateLimiter({ limit: 50, windowMs: 60 * 60_000, now });
  return (ip: string) => perNetwork(networkKey(ip)) && overall('*');
}
