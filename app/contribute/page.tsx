import type { Metadata } from "next";
import { mintGrant } from "@/lib/paymentGrant";
import ContributeForm from "./ContributeForm";
import "../scroll.css";

/**
 * Unlisted contribution page.
 *
 * Reachable only by typing the URL — nothing in the site's navigation or scenes
 * links here, which is deliberate while the payment flow is being verified
 * against DK production. It is styled as the Patronage modal so that when it is
 * eventually surfaced from the invitation scene it is already visually identical.
 *
 * noindex/nofollow, and rendered dynamically because the grant it mints is
 * short-lived and must never be baked into a cached page.
 */
export const metadata: Metadata = {
  title: "Make a contribution — Project 108",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ContributePage() {
  // Minted server-side so the long-lived PAYMENT_ACCESS_TOKEN never reaches the
  // browser; the client sends this instead and it expires in minutes.
  const grant = mintGrant();

  return <ContributeForm grant={grant} />;
}
