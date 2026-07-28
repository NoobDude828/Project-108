/**
 * Minimal in-memory rate limiter for the public API routes.
 *
 * Addresses the pentest finding that the public submission endpoints accepted
 * unlimited traffic (10 parallel POSTs in 330ms all succeeded with no 429),
 * which is what makes bulk enumeration and record-flooding practical. The same
 * limiter guards payment checkout so it cannot be used to mass-create gateway
 * sessions.
 *
 * Scope: counters live in this process. Project 108 runs as a single PM2 fork
 * (`project-108`), so that covers the deployment today — if it is ever scaled to
 * cluster mode or multiple hosts, move these counters to Redis or enforce at the
 * WAF/nginx layer instead, since per-process limits would then be per-worker.
 */

type Bucket = { count: number; resetAt: number };

const g = globalThis as unknown as {
  __p108RateBuckets?: Map<string, Bucket>;
};
const buckets: Map<string, Bucket> =
  g.__p108RateBuckets ?? (g.__p108RateBuckets = new Map());

/** Best-effort client IP from the proxy headers nginx sets, else a shared key. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Fixed-window limit. Returns null when the call is allowed, or a 429 Response
 * (with Retry-After) when the caller has exhausted its window.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Response | null {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return null;
  }

  existing.count += 1;
  if (existing.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return Response.json(
      {
        success: false,
        error: "Too many requests. Please try again in a moment.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  return null;
}

/** Drop expired buckets so the map cannot grow without bound. */
function sweep(now: number): void {
  for (const [k, v] of buckets) {
    if (now >= v.resetAt) buckets.delete(k);
  }
}
