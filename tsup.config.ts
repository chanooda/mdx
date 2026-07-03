import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";

// A single config with one `outDir`/`clean` on purpose: splitting react into a
// second config whose sibling config cleans the shared `dist` parent caused a
// build race that intermittently wiped `dist/react` (notably its .d.ts files),
// shipping a subpath with .js but no types. Keep every entry in one pass so the
// clean happens exactly once, before anything is emitted.
export default defineConfig({
  format: ["esm"],
  dts: true,
  bundle: false,
  clean: true,
  outDir: "dist",
  external: ["react", "react-dom", "next", "next-mdx-remote", "@mdx-js/mdx"],
  entry: [
    // react SPA adapter (client components)
    "src/react/index.ts",
    "src/react/mdx-content.tsx",
    "src/react/github-repo.tsx",
    "src/react/x-post.tsx",
    // shared presentational components
    "src/components/index.ts",
    "src/components/callout.tsx",
    "src/components/file-tree.tsx",
    "src/components/steps.tsx",
    "src/components/tabs.tsx",
    "src/components/embed/code-sandbox.tsx",
    "src/components/embed/github-gist.tsx",
    "src/components/embed/github-repo-view.tsx",
    "src/components/embed/x-post-view.tsx",
    "src/components/embed/youtube.tsx",
    // config + next adapter
    "src/config/index.ts",
    "src/next/index.ts",
    "src/next/mdx-content.tsx",
    "src/next/github-repo.tsx",
    "src/next/x-post.tsx",
  ],
  esbuildOptions(options) {
    options.legalComments = "inline";
  },
  esbuildPlugins: [
    preserveDirectivesPlugin({
      directives: ["use client"],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
