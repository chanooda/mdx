import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeSandbox } from "./code-sandbox";
import { GitHubGist } from "./github-gist";
import { YouTube } from "./youtube";

describe("static embeds", () => {
  it("YouTube builds embed src from id", () => {
    const { container } = render(<YouTube id="abc123" />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("CodeSandbox builds embed src from id", () => {
    const { container } = render(<CodeSandbox id="xyz" />);
    expect(container.querySelector("iframe")?.getAttribute("src")).toContain(
      "https://codesandbox.io/embed/xyz",
    );
  });

  it("GitHubGist builds pibb src from id", () => {
    const { container } = render(<GitHubGist id="user/g1" />);
    expect(container.querySelector("iframe")?.getAttribute("src")).toBe(
      "https://gist.github.com/user/g1.pibb",
    );
  });
});
