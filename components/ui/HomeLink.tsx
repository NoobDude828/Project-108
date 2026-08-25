import Link from "next/link";

/**
 * Fixed top-left escape hatch back to the cinematic homepage.
 *
 * Used on the pages that sit outside the main scrollytelling flow — /sign-up,
 * /contribute, and /privacy — which otherwise offer no way back except the
 * browser's back button (contribute and privacy are also unlisted/noindex, so
 * there is nothing in the site's own navigation that leads here either).
 *
 * Fixed positioning rather than sitting in each page's own document flow: it
 * needs to read the same way on the amount-as-hero contribution form, the
 * one-field sign-up column, and the plain prose of the privacy notice, none of
 * which share a layout.
 */
export default function HomeLink() {
  return (
    <Link href="/" className="home-link">
      <span className="home-link__arrow" aria-hidden="true">
        ←
      </span>
      Home
    </Link>
  );
}
