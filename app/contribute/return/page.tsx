"use client";

import { useEffect, useRef, useState } from "react";

// Post-checkout return page (served at /108/contribute/return).
//
// success_url / cancel_url from the DK/Stripe checkout land here. The browser
// redirect is NEVER treated as proof of payment — we confirm by polling
// /api/payment/status, which verifies against DK's check-application-status.
//
// The payment reference comes from the ?ref= query param that we append to the
// success/cancel URLs before handing them to DK. (It also falls back to a
// sessionStorage key, which a future checkout UI can set before redirecting —
// there is deliberately no payment UI on the site at present, so today the
// query param is the only source.)

type View = "loading" | "confirmed" | "pending" | "cancelled" | "failed" | "unknown";

const REF_STORAGE_KEY = "p108_pay_ref";
const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 3000;

function classify(status: string | undefined): View | null {
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "completed":
    case "success":
      return "confirmed";
    case "cancelled":
    case "canceled":
      return "cancelled";
    case "failed":
    case "expired":
      return "failed";
    case "created":
    case "redirected":
    case "pending":
      return null; // non-terminal → keep polling
    default:
      return null;
  }
}

export default function ContributeReturnPage() {
  const [view, setView] = useState<View>("loading");
  const [ref, setRef] = useState<string | null>(null);
  const pollsRef = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // DK builds the return URL with a second "?" instead of "&", so this arrives
    // as "success?session_id=cs_live_…" rather than "success". Take the leading
    // token so the value is a clean "success" | "cancel".
    const result = (params.get("result") || "").split("?")[0];
    let payRef = params.get("ref");
    if (!payRef) {
      try {
        payRef = window.sessionStorage.getItem(REF_STORAGE_KEY);
      } catch {
        payRef = null;
      }
    }
    // SSR-safe: ref/result live only in the browser URL, so they are read on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRef(payRef);

    const basePath = window.location.pathname.startsWith("/108") ? "/108" : "";

    if (!payRef) {
      // No reference to check. If the user explicitly cancelled, say so.
      setView(result === "cancel" ? "cancelled" : "unknown");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      pollsRef.current += 1;
      // Tell the server what Stripe told us, and flag the last attempt of the
      // cycle. The server only records an abandoned checkout on that final poll,
      // once DK has had the whole cycle to report a payment instead — writing
      // `cancelled` (a terminal status) too early would stop reconciliation from
      // ever checking a payment that had in fact gone through.
      const isFinal = pollsRef.current >= MAX_POLLS;
      const qs = new URLSearchParams({ ref: payRef! });
      if (result) qs.set("result", result);
      if (isFinal) qs.set("final", "1");

      try {
        const res = await fetch(
          `${basePath}/api/payment/status?${qs.toString()}`,
          { cache: "no-store" },
        );
        const data: { status?: string; response_data?: boolean } = await res
          .json()
          .catch(() => ({}));
        const resolved =
          classify(data.status) ??
          (data.response_data === true ? "confirmed" : null);

        if (cancelled) return;

        if (resolved) {
          try {
            window.sessionStorage.removeItem(REF_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          setView(resolved);
          return;
        }
      } catch {
        /* network hiccup — fall through to retry */
      }

      if (cancelled) return;
      if (pollsRef.current >= MAX_POLLS) {
        // Still not terminal. If they cancelled at Stripe, show cancelled;
        // otherwise it's genuinely still processing.
        setView(result === "cancel" ? "cancelled" : "pending");
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const basePath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/108")
      ? "/108"
      : "";

  const copy: Record<
    View,
    { eyebrow: string; heading: string; body: string }
  > = {
    loading: {
      eyebrow: "Confirming",
      heading: "Confirming your contribution…",
      body: "Please wait a moment while we verify your payment. Do not close this window.",
    },
    confirmed: {
      eyebrow: "Thank you",
      heading: "Your contribution has been received.",
      body: "May this offering be a cause for merit. A confirmation will follow by email. The Project 108 team is grateful for your support.",
    },
    pending: {
      eyebrow: "Processing",
      heading: "Your payment is still being confirmed.",
      body: "This can take a few minutes. If your card was charged, your contribution is safe — we will confirm by email once it settles. You may close this window.",
    },
    cancelled: {
      eyebrow: "Cancelled",
      heading: "Your contribution was not completed.",
      body: "The checkout was cancelled and no payment was taken. You are welcome to try again whenever you are ready.",
    },
    failed: {
      eyebrow: "Not completed",
      heading: "We couldn't complete your contribution.",
      body: "No payment was taken, or it did not go through. Please try again, or contact us if the problem continues.",
    },
    unknown: {
      eyebrow: "Project 108",
      heading: "We couldn't find a contribution to confirm.",
      body: "If you have just paid and were charged, your contribution is safe and will be confirmed by email. Otherwise, you can start a new contribution from the main page.",
    },
  };

  const c = copy[view];

  return (
    <main
      style={{
        background: "#160610",
        minHeight: "100vh",
        padding: "6rem 1.5rem 4rem",
        color: "#F2E9D8",
        fontFamily: "var(--font-body, Georgia, serif)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <article
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-utility, sans-serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(200,166,99,0.75)",
            marginBottom: "1.2rem",
          }}
        >
          {c.eyebrow}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 4.5vw, 2.6rem)",
            lineHeight: 1.2,
            color: "#F2E9D8",
            marginBottom: "1.4rem",
          }}
        >
          {c.heading}
        </h1>
        <p
          style={{
            fontSize: "1.02rem",
            color: "rgba(242,233,216,0.82)",
            marginBottom: "2.4rem",
          }}
        >
          {c.body}
        </p>

        {ref && view !== "loading" && (
          <p
            style={{
              fontFamily: "var(--font-utility, sans-serif)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(242,233,216,0.38)",
              marginBottom: "2.4rem",
            }}
          >
            Reference · {ref}
          </p>
        )}

        {view !== "loading" && (
          <a
            href={`${basePath}/`}
            style={{
              display: "inline-block",
              fontFamily: "var(--font-utility, sans-serif)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(200,166,99,0.9)",
              border: "1px solid rgba(200,166,99,0.4)",
              padding: "0.85rem 1.6rem",
              textDecoration: "none",
            }}
          >
            Return to Project 108
          </a>
        )}
      </article>
    </main>
  );
}
