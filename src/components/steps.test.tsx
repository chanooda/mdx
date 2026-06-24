import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Step, Steps } from "./steps";

describe("Steps", () => {
  it("renders ordered list with step titles", () => {
    const { container } = render(
      <Steps>
        <Step title="First">do A</Step>
        <Step title="Second">do B</Step>
      </Steps>,
    );
    expect(container.querySelector("ol.mdx-steps")).toBeInTheDocument();
    expect(container.querySelectorAll("li.mdx-step")).toHaveLength(2);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("do B")).toBeInTheDocument();
  });
});
