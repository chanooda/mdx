import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./callout";

describe("Callout", () => {
  it("applies type modifier class and renders children", () => {
    const { container } = render(<Callout type="warning">be careful</Callout>);
    expect(screen.getByText("be careful")).toBeInTheDocument();
    expect(container.querySelector(".mdx-callout")).toHaveClass(
      "mdx-callout--warning",
    );
  });

  it("defaults to info and appends custom className", () => {
    const { container } = render(<Callout className="extra">hi</Callout>);
    const root = container.querySelector(".mdx-callout");
    expect(root).toHaveClass("mdx-callout--info");
    expect(root).toHaveClass("extra");
  });
});
