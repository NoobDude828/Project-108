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

/**
 * A usable rate-limit key: a well-formed PUBLIC IP literal.
 *
 * Private and reserved ranges are refused deliberately. Behind our own nginx the real
 * client is always a public address, so a private one can only have arrived by
 * injection — and the report noted the old code "accepts unrestricted rotation
 * values, including private/reserved ranges", which is 17 million free buckets in
 * 10/8 alone. Anything refused here collapses into the single shared bucket.
 */
function usableIpKey(v: string): boolean {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) {
    const o = v.split(".").map(Number);
    if (o.some((n) => n > 255)) return false;
    if (o[0] === 10) return false; // 10/8
    if (o[0] === 127) return false; // loopback
    if (o[0] === 0) return false; // "this network"
    if (o[0] === 172 && o[1]! >= 16 && o[1]! <= 31) return false; // 172.16/12
    if (o[0] === 192 && o[1] === 168) return false; // 192.168/16
    if (o[0] === 169 && o[1] === 254) return false; // link-local
    if (o[0] === 100 && o[1]! >= 64 && o[1]! <= 127) return false; // CGNAT
    if (o[0]! >= 224) return false; // multicast + reserved
    return true;
  }
  if (!/^[0-9a-fA-F:]+$/.test(v) || !v.includes(":")) return false;
  const lower = v.toLowerCase();
  if (lower === "::1" || lower === "::") return false; // loopback / unspecified
  if (/^f[cd]/.test(lower)) return false; // unique-local fc00::/7
  if (/^fe[89ab]/.test(lower)) return false; // link-local fe80::/10
  return true;
}

/**
 * The client IP, taken only from a source the client cannot forge.
 *
 * BtCIRT finding 5.1: this used to return the LEFT-MOST X-Forwarded-For entry.
 * nginx is configured with `$proxy_add_x_forwarded_for`, which APPENDS the real
 * address to whatever the client sent — so the left-most entry is attacker-supplied,
 * and rotating it gave a fresh rate-limit bucket per request. That defeated the only
 * application-layer control on the public submission endpoints.
 *
 * X-Real-IP is used instead because nginx sets it with
 * `proxy_set_header X-Real-IP $remote_addr`, which REPLACES any client value. It is
 * therefore the socket peer address as observed by our own trusted hop, which is what
 * the finding asks us to key on. Taking `req.socket.remoteAddress` directly — the
 * report's first suggestion — would be wrong here: the app sits behind nginx on the
 * same host, so every request would present as 127.0.0.1 and the limiter would become
 * one global bucket for the whole internet.
 *
 * X-Forwarded-For remains a fallback, but the RIGHT-MOST entry only, since that is the
 * one our nginx appended. Values that are not well-formed IPs are discarded rather
 * than used as keys, so a crafted header cannot mint buckets.
 *
 * Anything unrecognised collapses to a single shared bucket. That is deliberate: an
 * unattributable request should contend with every other unattributable request rather
 * than receive a private allowance.
 *
 * Deliberately NOT consulted: `Forwarded` (RFC 7239) and `True-Client-IP`. nginx does
 * not set either, so both would be purely client-supplied.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real && usableIpKey(real)) return real;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((v) => v.trim());
    const rightmost = parts[parts.length - 1];
    if (rightmost && usableIpKey(rightmost)) return rightmost;
  }
  return "unattributed";
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
