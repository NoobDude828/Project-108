import type { Metadata } from "next";
import SignUpFields from "@/components/ui/SignUpFields";
import HomeLink from "@/components/ui/HomeLink";

// Same per-page import as app/contribute — scroll.css is not global.
import "../scroll.css";

/**
 * /sign-up — the one page anyone in the world can use to join the list.
 *
 * The third door (the link in the acknowledgement email) points here, and the
 * checkout tick-box grants the same permission with the same wording. Three doors,
 * one list.
 *
 * The form is the SHARED SignUpFields component — the identical one the "Stay
 * connected" card opens in a modal. Sharing the component is what makes "the same
 * form everywhere" a fact rather than an intention: the wording, the fields and the
 * unticked tick-box exist once.
 *
 * The hero is the DAY, not the field. An earlier version reused the contribute
 * page's modal sheet, which made this look like a dialogue box nobody had closed and
 * gave the email input the same weight as the moment it exists to serve. There is
 * one thing to understand here — that on 1 November all 108 are raised together —
 * and one thing to do. Everything that was not one of those two is gone.
 *
 * Unlike /contribute this page is public and indexable: it is meant to be shared,
 * and there is nothing sensitive on it. Its endpoint carries its own abuse controls
 * instead of a token (see app/api/subscribe/route.ts).
 */

export const metadata: Metadata = {
  title: "Be with us on November 1 — Project 108",
  description:
    "On November 1, all 108 Jangchub Chortens will be raised together in a single day at Gelephu Mindfulness City, Bhutan. Leave your email to receive the livestream link.",
  alternates: { canonical: "https://108.gmc.bt/sign-up" },
  openGraph: {
    title: "Be with us on November 1 — Project 108",
    description:
      "All 108 Jangchub Chortens raised together in a single day, at Gelephu Mindfulness City, Bhutan.",
    url: "https://108.gmc.bt/sign-up",
    type: "website",
  },
};

export default function SignUpPage() {
  return (
    <main className="su-page">
      <HomeLink />
      <div className="su-col">
        <p className="su-eyebrow">Project 108 · Gelephu Mindfulness City</p>

        <h1 className="su-hero">
          Be with us on <em>November&nbsp;1</em>
        </h1>

        <div className="su-rule" aria-hidden="true" />

        <p className="su-lede">
          All 108 Jangchub Chortens will be raised together in a single day at
          Gelephu Mindfulness City.
        </p>

        <SignUpFields source="signup-page" autoFocus />
      </div>
    </main>
  );
}
