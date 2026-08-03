import type { Metadata } from "next";

/**
 * Keeps the whole /contribute subtree out of search indexes.
 *
 * `page.tsx` sets its own noindex, but that covers only /contribute itself — not
 * /contribute/return, which is a client component and therefore cannot export
 * metadata of its own. A layout can, and it applies to every route beneath it.
 *
 * The return URL matters here: DK sends the donor back to
 * /contribute/return?ref=<application_no>, so a crawled or shared link would put a
 * live payment reference in an index. There is deliberately no UI entry point to
 * any of this yet either — nothing on the site links to /contribute, and the
 * checkout API stays behind PAYMENT_ACCESS_TOKEN.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
