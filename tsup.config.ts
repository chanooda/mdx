import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "components/index": "src/components/index.ts",
    "config/index": "src/config/index.ts",
    "next/index": "src/next/index.ts",
    "react/index": "src/react/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "next", "next-mdx-remote", "@mdx-js/mdx"],
  // Preserve "use client" / "use server" banners on chunks
  banner: {},
  esbuildOptions(options) {
    options.legalComments = "inline";
  },
  onSuccess: async () => {
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
