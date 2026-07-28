import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://108.gmc.bt"),
  title: "Project 108 — 108 Jangchub Chortens · Gelephu, Bhutan",
  description:
    "108 Jangchub Chortens, each 15 metres tall, raised in a single day along the Mau Chhu river in Gelephu Mindfulness City, Bhutan. 1 November 2026.",
  keywords: [
    "Project 108",
    "Jangchub Chorten",
    "Gelephu Mindfulness City",
    "GMC Bhutan",
    "Buddhist monument Bhutan",
    "Mau Chhu",
  ],
  authors: [{ name: "Gelephu Mindfulness City Authority" }],
  creator: "Gelephu Mindfulness City Authority",
  publisher: "Gelephu Mindfulness City Authority",
  alternates: {
    canonical: "https://108.gmc.bt",
  },
  openGraph: {
    title: "Project 108 — 108 Jangchub Chortens · Gelephu, Bhutan",
    description:
      "108 Jangchub Chortens, each 15 metres tall, raised together in a single day along the Mau Chhu in Gelephu Mindfulness City. 1 November 2026.",
    url: "https://108.gmc.bt",
    siteName: "Gelephu Mindfulness City",
    images: [
      {
        url: "/assets/og_image.jpg",
        width: 1200,
        height: 630,
        alt: "Project 108 — 108 Jangchub Chortens in Gelephu, Bhutan",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project 108 — 108 Jangchub Chortens · Bhutan",
    description:
      "108 Jangchub Chortens raised in a single day along the Mau Chhu, Gelephu Mindfulness City. 1 November 2026.",
    images: ["/assets/og_image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "jExndcNQyCwtoJo5MnKDVGuC_LWj491seNvv18hQ0fI",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
        {/* JSON-LD structured data — tells Google this is a real Event + Place */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Event",
                  name: "Project 108",
                  alternateName: "108 Jangchub Chortens",
                  description:
                    "108 Jangchub Chortens, each 15 metres tall, raised together in a single day along the Mau Chhu river in Gelephu Mindfulness City, Bhutan.",
                  startDate: "2026-11-01",
                  url: "https://108.gmc.bt",
                  image: "https://108.gmc.bt/assets/og_image.jpg",
                  organizer: {
                    "@type": "Organization",
                    name: "Gelephu Mindfulness City Authority",
                    url: "https://gmc.bt",
                  },
                  location: {
                    "@type": "Place",
                    name: "Gelephu Mindfulness City",
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: "Gelephu",
                      addressCountry: "BT",
                    },
                    geo: {
                      "@type": "GeoCoordinates",
                      latitude: 26.862,
                      longitude: 90.495,
                    },
                  },
                  eventStatus: "https://schema.org/EventScheduled",
                  eventAttendanceMode:
                    "https://schema.org/OfflineEventAttendanceMode",
                },
                {
                  "@type": "WebPage",
                  name: "Project 108 — 108 Jangchub Chortens · Gelephu Mindfulness City",
                  url: "https://108.gmc.bt",
                  description:
                    "Project 108: 108 Jangchub Chortens raised in a single day in Gelephu, Bhutan. 1 November 2026.",
                  publisher: {
                    "@type": "Organization",
                    name: "Gelephu Mindfulness City Authority",
                    url: "https://gmc.bt",
                  },
                },
              ],
            }),
          }}
        />
        {/* Purge all browser caches on every page load 
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  names.forEach(function(name) { caches.delete(name); });
                });
              }
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(regs) {
                  regs.forEach(function(reg) { reg.unregister(); });
                });
              }
            `,
          }}
        />*/}
      </head>
      <body>
        {/* GA4 — replace G-XXXXXXXXXX with your Measurement ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NE1T7ZF5PX"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          // Analytics enabled by default — visitors may opt out via the banner
          gtag('consent', 'default', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', 'G-NE1T7ZF5PX', { anonymize_ip: true });
        `}</Script>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
