import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip" | "danger";

const labels: Record<CalloutType, { icon: string; label: string }> = {
  info: { icon: "ℹ️", label: "Info" },
  tip: { icon: "💡", label: "Tip" },
  warning: { icon: "⚠️", label: "Warning" },
  danger: { icon: "🚨", label: "Danger" },
};

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
  className?: string;
}

export function Callout({ type = "info", children, className }: CalloutProps) {
  const { icon, label } = labels[type];
  return (
    <div className={`mdx-callout mdx-callout--${type}${className ? ` ${className}` : ""}`}>
      <p className="mdx-callout__label">
        {icon} {label}
      </p>
      <div className="mdx-callout__body">{children}</div>
    </div>
  );
}
