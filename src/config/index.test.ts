import { describe, expect, it } from "vitest";
import { rehypePrettyCodeOptions, remarkPlugins } from "./index";

describe("mdx config", () => {
  it("exposes remark-gfm", () => {
    expect(remarkPlugins).toHaveLength(1);
    expect(typeof remarkPlugins[0]).toBe("function");
  });

  it("builds rehype-pretty-code options with theme and transformers", () => {
    const opts = rehypePrettyCodeOptions();
    expect(opts.theme).toBe("github-dark");
    expect(Array.isArray(opts.transformers)).toBe(true);
    expect(opts.transformers).toHaveLength(5);
  });
});
