"use client";

import { type ComponentType, useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";
import { presentationalComponents } from "../components";
import { GitHubRepo } from "./github-repo";
import { XPost } from "./x-post";

const components = { ...presentationalComponents, GitHubRepo, XPost };

export function MdxContent({ source }: { source: string }) {
  const [Content, setContent] = useState<ComponentType<{
    components: typeof components;
  }> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // Dynamic imports keep shiki/rehype-pretty-code out of the initial bundle.
      const [{ evaluate }, { default: rehypePrettyCode }, config] =
        await Promise.all([
          import("@mdx-js/mdx"),
          import("rehype-pretty-code"),
          import("../config"),
        ]);
      const { default: Compiled } = await evaluate(source, {
        ...runtime,
        remarkPlugins: config.remarkPlugins,
        rehypePlugins: [
          [rehypePrettyCode as never, config.rehypePrettyCodeOptions()],
        ],
      });
      if (active) setContent(() => Compiled as ComponentType<{ components: typeof components }>);
    })();
    return () => {
      active = false;
    };
  }, [source]);

  if (!Content) return null;
  return <Content components={components} />;
}
