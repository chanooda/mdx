import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

const sharedConfig = {
  format: ["esm"] as const,
  dts: true,
  external: ["react", "react-dom", "next", "next-mdx-remote", "@mdx-js/mdx"],
  esbuildOptions(options: import("esbuild").BuildOptions) {
    options.legalComments = "inline";
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    entry: {
      "react/index": "src/react/index.ts",
    },
    clean: false,
    esbuildOptions(options: import("esbuild").BuildOptions) {
      options.legalComments = "inline";
      options.banner = { js: '"use client";' };
    },
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
