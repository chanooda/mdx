"use client";

import type { ReactNode } from "react";
import { Children, isValidElement, useState } from "react";

export function Tabs({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = Children.toArray(children).filter(isValidElement);

  return (
    <div className={`mdx-tabs${className ? ` ${className}` : ""}`}>
      <div className="mdx-tabs__list">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`mdx-tabs__tab${active === i ? " mdx-tabs__tab--active" : ""}`}
          >
            {(tab.props as { label?: string }).label ?? `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="mdx-tabs__panel">{tabs[active]}</div>
    </div>
  );
}

export function Tab({
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
