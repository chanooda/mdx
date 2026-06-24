import { readFileSync, existsSync } from "node:fs";

const required = [
  "dist/components/index.js",
  "dist/config/index.js",
  "dist/next/index.js",
  "dist/react/index.js",
  "dist/components/index.d.ts",
  "dist/styles.css",
];
for (const f of required) {
  if (!existsSync(f)) throw new Error(`missing build output: ${f}`);
}

const reactBundle = readFileSync("dist/react/index.js", "utf-8");
if (!reactBundle.includes('"use client"') && !reactBundle.includes("'use client'")) {
  throw new Error('react adapter lost "use client" directive');
}

console.log("dist check OK");
