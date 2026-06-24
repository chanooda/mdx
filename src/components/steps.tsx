import type { ReactNode } from "react";

export function Steps({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ol className={`mdx-steps${className ? ` ${className}` : ""}`}>{children}</ol>
  );
}

export function Step({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={`mdx-step${className ? ` ${className}` : ""}`}>
      <span className="mdx-step__marker" />
      <div className="mdx-step__content">
        <p className="mdx-step__title">{title}</p>
        <div className="mdx-step__body">{children}</div>
      </div>
    </li>
  );
}
