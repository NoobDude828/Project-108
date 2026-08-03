/**
 * Unsubscribe. Signed link, no login, works forever.
 *
 *   /api/unsubscribe?e=<email>&t=<hmac>
 *
 * The token is an HMAC over the address (lib/subscribeToken.ts), so a recipient
 * cannot edit the link to remove somebody else, and we need no per-subscriber token
 * column that could go stale in an old email.
 *
 * Included because a list you cannot leave is not one we should send from — and
 * because the first send is the 1 November invitation, which is exactly when someone
 * decides they would rather not hear more.
 *
 * GET, deliberately, so a plain link in an email works. That normally invites
 * prefetch/scanner false positives, which is tolerable here: the action is
 * idempotent, affects only the address named in a signature the scanner cannot
 * forge, and is reversible by signing up again.
 */

import { unsubscribe } from "@/lib/db";
import { verifyUnsubscribeToken, subscribeSecretConfigured } from "@/lib/subscribeToken";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status: number): Response {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${title} — Project 108</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Inter+Tight:wght@500&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;background:#1A0810;color:#F2E9D8;font-family:'Cormorant Garamond',Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem;">
<div style="max-width:34rem;text-align:center;">
  <div style="font-family:'Inter Tight',Arial,sans-serif;font-size:0.62rem;font-weight:500;letter-spacing:0.28em;text-transform:uppercase;color:#C8A663;margin-bottom:1.4rem;">Project 108 · Bhutan</div>
  <h1 style="font-size:clamp(1.9rem,5vw,2.6rem);font-weight:300;font-style:italic;margin:0 0 1.1rem;color:#F2E9D8;">${title}</h1>
  <p style="font-size:1.05rem;line-height:1.7;color:rgba(242,233,216,0.8);margin:0;">${body}</p>
</div>
</body></html>`,
    {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    },
  );
}

export async function GET(req: Request) {
  const limited = rateLimit(`unsub:${clientIp(req)}`, 20, 60_000);
  if (limited) return limited;

  const url = new URL(req.url);
  const email = (url.searchParams.get("e") || "").trim();
  const token = (url.searchParams.get("t") || "").trim();

  if (!subscribeSecretConfigured()) {
    console.error("[/api/unsubscribe] SUBSCRIBE_SECRET is not set");
    return page(
      "Something went wrong",
      "This link cannot be verified at the moment. Please reply to any email from us and we will remove you by hand.",
      503,
    );
  }

  if (!verifyUnsubscribeToken(email, token)) {
    // No detail about which part failed, and no confirmation that the address is or
    // is not on the list.
    return page(
      "This link is not valid",
      "It may have been altered in transit. Please reply to any email from us and we will remove you by hand.",
      400,
    );
  }

  try {
    await unsubscribe(email);
  } catch (err) {
    console.error("[/api/unsubscribe] failed", err);
    return page(
      "Something went wrong",
      "We could not complete that just now. Please reply to any email from us and we will remove you by hand.",
      503,
    );
  }

  return page(
    "You have been removed",
    "You will receive no further updates about Project 108. If this was a mistake, you are welcome to sign up again at any time.",
    200,
  );
}
