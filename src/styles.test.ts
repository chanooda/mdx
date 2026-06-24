import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  resolve(__dirname, "./styles.css"),
  "utf-8",
);

describe("styles.css", () => {
  it("declares core theme variables with portfolio defaults", () => {
    expect(css).toContain("--mdx-accent: #10b981");
    expect(css).toContain("--mdx-text-secondary: #888888");
  });

  it("defines class for every component family", () => {
    for (const cls of [
      ".mdx-callout",
      ".mdx-steps",
      ".mdx-step",
      ".mdx-file-tree",
      ".mdx-tabs",
      ".mdx-embed",
      ".mdx-gh-repo",
      ".mdx-x-post",
    ]) {
      expect(css).toContain(cls);
    }
  });

  it("includes rehype-pretty-code code-block styles", () => {
    expect(css).toContain("[data-rehype-pretty-code-figure]");
  });
});
