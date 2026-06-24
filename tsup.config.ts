import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";
import { preserveDirectivesPlugin } from "esbuild-plugin-preserve-directives";

const sharedConfig = {
  format: ["esm"] as const,
  dts: true,
  metafile: true,
  external: ["react", "react-dom", "next", "next-mdx-remote", "@mdx-js/mdx"],
  esbuildOptions(options: import("esbuild").BuildOptions) {
    options.legalComments = "inline";
  },
  esbuildPlugins: [
    preserveDirectivesPlugin({
      directives: ["use client"],
      include: /\.(js|ts|jsx|tsx)$/,
      exclude: /node_modules/,
    }),
  ],
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: {
      "react/index": "src/react/index.ts",
    },
    clean: false,
  },
  {
    ...sharedConfig,
    entry: {
      "components/index": "src/components/index.ts",
      "config/index": "src/config/index.ts",
      "next/index": "src/next/index.ts",
    },
    clean: true,
    onSuccess: async () => {
      copyFileSync("src/styles.css", "dist/styles.css");
    },
  },
]);
