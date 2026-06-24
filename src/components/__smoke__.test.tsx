import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("renders JSX in jsdom", () => {
    render(<div>harness-ok</div>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
