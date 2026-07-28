import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice — Project 108",
  description:
    "How Project 108 and the Gelephu Mindfulness City Authority use analytics data on this site.",
  robots: { index: false },
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        background: "#160610",
        minHeight: "100vh",
        padding: "6rem 1.5rem 4rem",
        color: "#F2E9D8",
        fontFamily: "var(--font-body, Georgia, serif)",
      }}
    >
      <article
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          lineHeight: 1.75,
          fontSize: "1.05rem",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-utility, sans-serif)",
            fontSize: "0.62rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(200,166,99,0.7)",
            marginBottom: "1.2rem",
          }}
        >
          Project 108 · Gelephu Mindfulness City
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display, Georgia, serif)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            lineHeight: 1.15,
            color: "#F2E9D8",
            marginBottom: "2.5rem",
          }}
        >
          Privacy Notice
        </h1>

        <Section heading="What this notice covers">
          This notice explains what data is collected when you visit{" "}
          <a href="https://108.gmc.bt" style={linkStyle}>
            108.gmc.bt
          </a>{" "}
          and how it is used by the Gelephu Mindfulness City Authority
          (&ldquo;GMCA&rdquo;) and the Project 108 team.
        </Section>

        <Section heading="Analytics cookies">
          <p>
            With your consent, this site uses{" "}
            <strong>Google Analytics 4</strong> (operated by Google LLC, 1600
            Amphitheatre Parkway, Mountain View, CA 94043, USA) to collect
            anonymised usage data — including approximate location (country
            level), device type, pages visited, and scroll engagement.
          </p>
          <p>
            IP addresses are anonymised before processing. No personal
            identifiers — name, email, phone — are ever sent to Google
            Analytics. Data is retained for the default 14-month period set by
            Google Analytics.
          </p>
          <p>
            Google Analytics is governed by{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Google&rsquo;s Privacy Policy
            </a>
            .
          </p>
        </Section>

        <Section heading="Registration interest forms">
          When you submit a registration-of-interest form (as a patron or
          volunteer), your name, email address, nationality, and message are
          transmitted directly to the Project 108 team. This data is used solely
          to respond to your enquiry and is not shared with third parties or
          used for marketing without your explicit permission.
        </Section>

        {/* <Section heading="Your choices">
          <p>
            You may withdraw consent for analytics cookies at any time by
            clearing your browser storage for this site (
            <code style={codeStyle}>localStorage</code> key:{" "}
            <code style={codeStyle}>p108_cookie_consent</code>). On your next
            visit the consent banner will reappear.
          </p>
          <p>
            You may also install a browser extension such as the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Google Analytics Opt-out Add-on
            </a>{" "}
            to block Google Analytics across all sites.
          </p>
        </Section> */}

        <Section heading="Contact">
          Questions about this notice or your data may be directed to{" "}
          <a href="mailto:108@gmc.bt" style={linkStyle}>
            108@gmc.bt
          </a>
          .
        </Section>

        <p
          style={{
            marginTop: "3rem",
            fontSize: "0.78rem",
            color: "rgba(242,233,216,0.38)",
          }}
        >
          Last revised: June 2025
        </p>
      </article>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  color: "rgba(200,166,99,0.85)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const codeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "0.88em",
  color: "rgba(242,233,216,0.55)",
};

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "2.2rem" }}>
      <h2
        style={{
          fontFamily: "var(--font-display, Georgia, serif)",
          fontWeight: 300,
          fontSize: "1.25rem",
          color: "rgba(200,166,99,0.85)",
          marginBottom: "0.6rem",
          letterSpacing: "0.02em",
        }}
      >
        {heading}
      </h2>
      {typeof children === "string" ? <p>{children}</p> : children}
    </section>
  );
}
