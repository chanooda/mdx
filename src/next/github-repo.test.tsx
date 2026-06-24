import { afterEach, describe, expect, it, vi } from "vitest";

// Mock react-tweet to avoid CSS import issues in test environment
vi.mock("react-tweet", () => ({
  EmbeddedTweet: () => null,
  TweetNotFound: () => null,
}));

vi.mock("react-tweet/api", () => ({
  getTweet: () => null,
}));

import { fetchGitHubRepo } from "./github-repo";

afterEach(() => vi.restoreAllMocks());

describe("fetchGitHubRepo (next)", () => {
  it("returns parsed data on ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ full_name: "a/b", stargazers_count: 1 }),
      }),
    );
    const data = await fetchGitHubRepo("a/b");
    expect(data?.full_name).toBe("a/b");
  });

  it("returns null when response not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchGitHubRepo("a/b")).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await fetchGitHubRepo("a/b")).toBeNull();
  });
});
