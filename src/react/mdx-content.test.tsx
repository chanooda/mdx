import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("react-tweet", () => ({
  EmbeddedTweet: () => null,
  TweetNotFound: () => null,
}));

vi.mock("react-tweet/api", () => ({
  getTweet: () => null,
}));

import { MdxContent } from "./mdx-content";

describe("MdxContent (react runtime)", () => {
  it("compiles and renders MDX with custom components", async () => {
    const source = `# Title\n\n<Callout type="tip">runtime works</Callout>`;
    render(<MdxContent source={source} />);
    await waitFor(() =>
      expect(screen.getByText("runtime works")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
  });
});
