import { ReactNode } from "react";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  headline?: string;
  children?: ReactNode;
  variant?: "plain" | "cream" | "dark";
}

export default function Section({
  id,
  eyebrow,
  headline,
  children,
  variant = "plain",
}: SectionProps) {
  return (
    <section id={id} className={`p108-section p108-section--${variant}`}>
      <div className="p108-wrap p108-medium">
        {eyebrow && <span className="p108-eyebrow">{eyebrow}</span>}
        {headline && (
          <h2
            className="p108-h2"
            dangerouslySetInnerHTML={{ __html: headline }}
          />
        )}
        {children}
      </div>
    </section>
  );
}
