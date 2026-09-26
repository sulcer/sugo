// ponytail: per-instance memory, serverless instances don't share it; move to a shared store
// (e.g. Upstash) if abuse appears.
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
    if (hits.size > 1000)
      for (const [k, times] of hits) if (times.every((at) => t - at >= windowMs)) hits.delete(k);
    const recent = (hits.get(key) ?? []).filter((at) => t - at < windowMs);
    const allowed = recent.length < limit;
    if (allowed) recent.push(t);
    hits.set(key, recent);
    return allowed;
  };
}
