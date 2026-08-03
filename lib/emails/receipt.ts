/**
 * Contribution acknowledgement email.
 *
 * The copy is Chholay Namgay's, near-verbatim. Two deliberate additions are marked
 * OPTIONAL below and are easy to cut if he would rather not have them.
 *
 * The shell (header, footer, palette, type) is a deliberate copy of gmc-app's
 * src/lib/email-templates-108.ts so this sits alongside the patron and payment-link
 * emails without looking like a different sender. It cannot be imported — the two
 * apps are separate deployments — so if that shell is restyled, restyle this too.
 *
 * THIS EMAIL IS THE RECEIPT. Not an invoice (an invoice requests payment; this is
 * issued after the money moved) and not a tax receipt (that asserts deductibility,
 * which depends on GMCA's registration in the donor's jurisdiction — not a claim to
 * make without verifying it). It carries the amount, date and reference precisely
 * because donors file these.
 *
 * WHAT IT MAY AND MAY NOT STATE. DK's API returns a bare boolean for status — no
 * charge id, no settled amount, no fee breakdown, no receipt_url (see
 * db/DK-API-change-requests.md, items 3-6). So:
 *   - the amount CHARGED is stated, because the donor's own card statement
 *     corroborates it;
 *   - the amount SETTLED to the project is NOT stated. DK has never confirmed it,
 *     and printing a computed figure as though it were settled would be inventing a
 *     financial fact.
 */

const C = {
  maroon: "#4A1A2C",
  maroonDeep: "#3A1320",
  gold: "#C8A663",
  cream: "#F2E9D8",
  creamLight: "#FAF6ED",
  ink: "#2D1419",
  inkSoft: "#5A3640",
  ruleLight: "rgba(74, 26, 44, 0.12)",
};

const FONTS = {
  display: "'Cormorant Garamond', 'Georgia', 'Times New Roman', serif",
  body: "'Lora', 'Georgia', serif",
  utility: "'Inter Tight', 'Helvetica Neue', Arial, sans-serif",
};

/** Escape anything the donor typed. Their name and dedication reach an HTML body. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>108 Chortens</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Lora:wght@400;500;600&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${C.creamLight};font-family:${FONTS.body};color:${C.ink};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.creamLight};">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:${C.maroon};padding:28px 36px;border-radius:4px 4px 0 0;border-top:2px solid ${C.gold};">
          <table width="100%"><tr>
            <td>
              <div style="font-family:${FONTS.utility};font-size:10px;font-weight:600;letter-spacing:0.32em;text-transform:uppercase;color:${C.gold};margin-bottom:6px;">Project</div>
              <div style="font-family:${FONTS.display};font-size:28px;font-weight:300;color:${C.cream};letter-spacing:0.02em;font-style:italic;">108</div>
            </td>
            <td align="right" valign="bottom">
              <div style="font-family:${FONTS.utility};font-size:9px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:rgba(242,233,216,0.5);">Jangchub Chortens</div>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#ffffff;padding:36px;border-left:1px solid ${C.ruleLight};border-right:1px solid ${C.ruleLight};">
          ${body}
        </td></tr>
        <tr><td style="background:#ffffff;padding:0 36px 28px;border-left:1px solid ${C.ruleLight};border-right:1px solid ${C.ruleLight};border-bottom:1px solid ${C.ruleLight};border-radius:0 0 4px 4px;">
          <div style="width:36px;height:1px;background:${C.gold};opacity:0.5;margin:0 auto 20px;"></div>
          <div style="text-align:center;font-family:${FONTS.utility};font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:${C.inkSoft};line-height:2;">
            108 Jangchub Chortens Initiative<br />
            Gelephu Mindfulness City Authority &middot; Bhutan
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type ReceiptData = {
  donorName: string;
  /** Our application_no — the reference DK and our records share. */
  reference: string;
  /** What the donor offered, before fee arithmetic. This is "your offering of X". */
  offeredAmount: number;
  /** What their card was actually charged. Differs when they covered the fee. */
  chargedTotal: number;
  currency?: string;
  /** When DK confirmed the payment. */
  confirmedAt: Date;
  /**
   * The sign-up page — the SAME page reached from anywhere in the world, granting
   * the SAME permission as the tick-box at checkout. Three doors into one list.
   *
   * Today that is https://108.gmc.bt/sign-up. Required with no default on purpose:
   * a fallback would let a dead or wrong link ship silently, so the sender cannot
   * assemble the email until a real URL is configured.
   */
  signupUrl: string;
  /** OPTIONAL ADDITION — only rendered when the donor actually wrote one. */
  dedication?: string;
};

export function contributionReceiptEmail(d: ReceiptData): {
  subject: string;
  html: string;
  text: string;
} {
  if (!d.signupUrl) {
    throw new Error(
      "contributionReceiptEmail: signupUrl is required — refusing to send an acknowledgement with a dead sign-up link",
    );
  }

  const cur = (d.currency || "USD").toUpperCase();
  const date = d.confirmedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const offering = `${cur} ${money(d.offeredAmount)}`;

  /**
   * OPTIONAL ADDITION — the charged total, and only when it differs.
   *
   * His line states the offering. But a donor who covered the fee was charged
   * $113.84 for a $108 offering, and it is the charged figure that reconciles
   * against their card statement. If this email is the thing they file, omitting it
   * is what generates the "I was charged a different amount" email. Shown as a
   * quiet parenthetical so his sentence keeps its shape; when the donor did not
   * cover the fee the two figures are equal and this disappears entirely.
   */
  const chargedNote =
    d.chargedTotal !== d.offeredAmount
      ? ` A total of ${cur} ${money(d.chargedTotal)} was charged, including the processing fee you chose to cover.`
      : "";

  const p = `font-family:${FONTS.body};font-size:15px;line-height:1.8;color:${C.ink};margin:0 0 16px;`;

  return {
    subject: "Thank you for your offering — Project 108",
    html: layout(`
      <div style="text-align:center;padding:8px 0 28px;">
        <div style="width:36px;height:1px;background:${C.gold};opacity:0.5;margin:0 auto 24px;"></div>
        <h2 style="font-family:${FONTS.display};font-size:28px;font-weight:300;font-style:italic;color:${C.ink};margin:0 0 8px;letter-spacing:0.01em;">
          Thank you
        </h2>
        <div style="font-family:${FONTS.utility};font-size:9px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:${C.gold};">
          for your offering
        </div>
        <div style="width:36px;height:1px;background:${C.gold};opacity:0.5;margin:24px auto 0;"></div>
      </div>

      <p style="${p}">Dear ${esc(d.donorName)},</p>

      <p style="${p}">
        Thank you for your generous offering in support of the 108 Jangchub Chortens
        at Gelephu Mindfulness City, Bhutan.
      </p>

      <p style="${p}">
        Your offering of <strong style="font-weight:600;">${offering}</strong> was
        received on ${date}. Reference:
        <strong style="font-weight:600;">${esc(d.reference)}</strong>.${chargedNote}
      </p>

      <p style="${p}">
        On November 1st, all 108 Jangchub Chortens will be raised together in a
        single day. If you would like to be with us on the day, you can
        <a href="${esc(d.signupUrl)}" style="color:${C.maroon};text-decoration:underline;">sign up here</a>
        to receive the livestream link and prayers for the day, and to stay connected
        with what unfolds next.
      </p>

      ${
        d.dedication
          ? `<div style="background:${C.maroonDeep};border-radius:4px;padding:24px 28px;margin:28px 0;">
        <div style="font-family:${FONTS.utility};font-size:9px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:${C.gold};margin-bottom:10px;">Your dedication</div>
        <div style="font-family:${FONTS.display};font-size:18px;font-style:italic;font-weight:300;line-height:1.6;color:${C.cream};">
          ${esc(d.dedication)}
        </div>
      </div>`
          : ""
      }

      <p style="${p}">Your contribution is received with deep gratitude.</p>

      <p style="font-family:${FONTS.body};font-size:15px;line-height:1.8;color:${C.ink};margin:28px 0 0;">
        With warm regards and prayers,<br />
        <span style="font-family:${FONTS.display};font-size:17px;font-style:italic;">The 108 Project Team</span><br />
        <span style="font-family:${FONTS.utility};font-size:9px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${C.inkSoft};">Gelephu Mindfulness City</span>
      </p>
    `),
    // Plain-text alternative. Not optional: a receipt that renders as a blank page
    // in a text-only client is not a receipt.
    text: [
      `Dear ${d.donorName},`,
      ``,
      `Thank you for your generous offering in support of the 108 Jangchub Chortens at Gelephu Mindfulness City, Bhutan.`,
      ``,
      `Your offering of ${offering} was received on ${date}. Reference: ${d.reference}.${chargedNote}`,
      ``,
      `On November 1st, all 108 Jangchub Chortens will be raised together in a single day. If you would like to be with us on the day, you can sign up here to receive the livestream link and prayers for the day, and to stay connected with what unfolds next: ${d.signupUrl}`,
      ...(d.dedication ? ["", `Your dedication: ${d.dedication}`] : []),
      ``,
      `Your contribution is received with deep gratitude.`,
      ``,
      `With warm regards and prayers,`,
      `The 108 Project Team`,
      `Gelephu Mindfulness City`,
    ].join("\n"),
  };
}
