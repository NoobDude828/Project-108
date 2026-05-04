import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project 108 — 108 Jangchub Chortens, Gelephu Mindfulness City",
  description:
    "108 Jangchub Chortens, each 15 metres tall, raised together in a single day along the Mau River in Gelephu Mindfulness City, Bhutan.",
  openGraph: {
    title: "Project 108",
    description:
      "108 Jangchub Chortens, each 15 metres tall, raised together in a single day.",
    images: ["/assets/og_image.jpg"],
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
        /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
