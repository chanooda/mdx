import { describe, expect, it, vi } from "vitest";

// Mock react-tweet to avoid CSS import issues in test environment
vi.mock("react-tweet", () => ({
  EmbeddedTweet: () => null,
  TweetNotFound: () => null,
}));

vi.mock("react-tweet/api", () => ({
  getTweet: () => null,
}));

describe("presentationalComponents", () => {
  it("includes shared components and excludes env-specific embeds", async () => {
    // Use dynamic import to defer loading until test runtime
    const { presentationalComponents } = await import("./index");

    expect(Object.keys(presentationalComponents).sort()).toEqual(
      [
        "Callout",
        "CodeSandbox",
        "File",
        "FileTree",
        "Folder",
        "GitHubGist",
        "Step",
        "Steps",
        "Tab",
        "Tabs",
        "YouTube",
      ].sort(),
    );
    expect(presentationalComponents).not.toHaveProperty("GitHubRepo");
    expect(presentationalComponents).not.toHaveProperty("XPost");
  });
});
