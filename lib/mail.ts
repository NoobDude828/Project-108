/**
 * Outbound mail for Project 108.
 *
 * Uses the same path gmc-app's 108 mailer does: Google Workspace's SMTP relay at
 * smtp-relay.gmail.com:465, authorised by IP rather than by credentials. The
 * server's address is allow-listed in the Workspace console, which is why there is
 * no username or password here and none in the environment — verified from the host:
 *
 *   250-smtp-relay.gmail.com at your service, [47.130.66.228]
 *   250 2.1.0 OK      <- MAIL FROM:<108@gmc.bt> accepted with no AUTH
 *
 * TWO CONSEQUENCES WORTH KNOWING.
 *
 * 1. Mail cannot be sent from a laptop. The relay authorises the deployed server's
 *    IP, so local runs will be refused. That is a property of the relay, not a bug;
 *    delivery can only be verified on the server.
 * 2. There is no secret to leak, and equally no secret to rotate. Anything running
 *    on that host can send as the domain, so the host itself is the security
 *    boundary.
 *
 * ONE DELIBERATE DEVIATION from gmc-app's version: it sets
 * `tls: { rejectUnauthorized: false }`, which disables certificate verification and
 * would let anything that can intercept the connection read the mail. Gmail presents
 * a valid certificate, so verification stays ON here. If this ever fails to connect,
 * fix the trust store — do not disable the check.
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const SMTP_HOST = process.env.SMTP_108_HOST || "smtp-relay.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_108_PORT || 465);
const SMTP_FROM = process.env.SMTP_108_FROM || "108@gmc.bt";

/** Reused across requests; nodemailer pools connections internally. */
const g = globalThis as unknown as { __p108Mailer?: Transporter };

function transporter(): Transporter {
  if (!g.__p108Mailer) {
    g.__p108Mailer = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      // No auth: the relay authorises this host by IP. Passing `auth` at all makes
      // nodemailer attempt AUTH, which the relay does not expect from us.
      pool: true,
      maxConnections: 2,
      connectionTimeout: 15_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return g.__p108Mailer;
}

export function mailFrom(): string {
  return `Project 108 <${SMTP_FROM}>`;
}

/**
 * Send one message. THROWS on failure rather than swallowing.
 *
 * Callers decide what a failure means. For the acknowledgement receipt it means
 * "leave it unsent so the sweep retries" — quietly logging and moving on would turn
 * a transient relay blip into a donor who never hears from us.
 */
export async function sendMail(msg: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ messageId: string }> {
  const info = await transporter().sendMail({
    from: mailFrom(),
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    // Transactional receipt, not a campaign. Tells well-behaved clients not to
    // auto-reply and marks it for filtering as a service message.
    headers: { "Auto-Submitted": "auto-generated" },
  });
  return { messageId: info.messageId };
}

/** Proves the relay accepts us, without delivering anything. For the server. */
export async function verifyMailTransport(): Promise<true> {
  await transporter().verify();
  return true;
}

/**
 * What kind of thing sendMail() failed at, so a caller can tell "the relay itself
 * is refusing us" from "this one recipient bounced".
 *
 * `relay` covers nodemailer's ECONNECTION/ETIMEDOUT/ESOCKET — errors raised before
 * or during the connection/EHLO/AUTH handshake, i.e. before any recipient was even
 * named. That is exactly the shape of Gmail's "421-4.7.0 ... closing connection.
 * (EHLO)": a whole-IP rate/reputation throttle that will reject the next send too,
 * regardless of who it's addressed to.
 *
 * `recipient` covers EENVELOPE/EMESSAGE — the connection was accepted and Gmail
 * rejected the specific message (bad address, content, etc).
 */
export type MailErrorKind = "relay" | "recipient" | "other";

export function classifyMailError(err: unknown): MailErrorKind {
  const code = (err as { code?: string } | null)?.code;
  if (code === "ECONNECTION" || code === "ETIMEDOUT" || code === "ESOCKET") {
    return "relay";
  }
  if (code === "EENVELOPE" || code === "EMESSAGE") {
    return "recipient";
  }
  return "other";
}
