import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-tweet", () => ({
  EmbeddedTweet: () => null,
  TweetNotFound: () => null,
}));

vi.mock("react-tweet/api", () => ({
  getTweet: () => null,
}));

import { GitHubRepo } from "./github-repo";

afterEach(() => vi.restoreAllMocks());

describe("GitHubRepo (react)", () => {
  it("fetches client-side and renders the repo card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          full_name: "a/b",
          description: "desc",
          stargazers_count: 3,
          forks_count: 1,
          language: "TS",
          html_url: "https://github.com/a/b",
        }),
      }),
    );
    render(<GitHubRepo repo="a/b" />);
    await waitFor(() =>
      expect(screen.getByText("desc")).toBeInTheDocument(),
    );
  });

  it("renders fallback when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("x")));
    render(<GitHubRepo repo="a/b" />);
    await waitFor(() =>
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "https://github.com/a/b",
      ),
    );
  });
});
