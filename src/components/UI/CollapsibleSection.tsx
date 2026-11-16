import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 0",
          background: "transparent",
          color: "inherit",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 14,
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        >
          ▶
        </span>

        <strong style={{ fontSize: "1.17em" }}>{title}</strong>
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 180ms ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingBottom: isOpen ? 8 : 0 }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
