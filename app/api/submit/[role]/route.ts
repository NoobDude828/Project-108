/**
 * Same-origin proxy for the 108 submission API.
 *
 * The browser POSTs to /api/submit/patrons (or /volunteers); this handler runs
 * on the server (no CORS) and forwards the body to the upstream API. We do this
 * because the upstream service at gmc.bt/api was rejecting browser preflight
 * OPTIONS requests, which silently blocked every form submission.
 *
 * Status code, body and content-type are passed through verbatim so the client
 * can keep handling 201 / 400 / 409 / 500 the same way.
 */

const UPSTREAM = "https://gmc.bt/api";
const ALLOWED_ROLES = new Set(["patrons", "volunteers"]);

export async function POST(
  req: Request,
  ctx: { params: Promise<{ role: string }> },
) {
  const { role } = await ctx.params;
  if (!ALLOWED_ROLES.has(role)) {
    return Response.json(
      { success: false, error: "Unknown submission role" },
      { status: 400 },
    );
  }

  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(`${UPSTREAM}/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      // Edge networks sometimes cache POST responses oddly; opt out.
      cache: "no-store",
    });
  } catch (err) {
    console.error("[/api/submit] upstream fetch failed", err);
    return Response.json(
      {
        success: false,
        error: "Couldn't reach the submission service.",
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/json",
    },
  });
}
