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

function hasClientDirective(content) {
  return content.includes('"use client"') || content.includes("'use client'");
}

function firstLine(content) {
  return content.split("\n")[0].trim();
}

// ── 1. react adapter must carry "use client" ──────────────────────────────────
// With bundle:false, react/mdx-content.tsx has "use client"; the re-export
// index may not include it itself — check mdx-content.js directly.
const reactMdxContent = readFileSync("dist/react/mdx-content.js", "utf-8");
if (!hasClientDirective(reactMdxContent)) {
  throw new Error('react/mdx-content.js lost "use client" directive');
}
const reactBundle = readFileSync("dist/react/index.js", "utf-8");
if (
  !hasClientDirective(reactBundle) &&
  !hasClientDirective(reactMdxContent)
) {
  throw new Error('react adapter lost "use client" directive entirely');
}

// ── 2. next adapter must NOT start with "use client" (server module) ──────────
const nextBundle = readFileSync("dist/next/index.js", "utf-8");
const nextFirstLine = firstLine(nextBundle);
if (nextFirstLine === '"use client"' || nextFirstLine === "'use client'") {
  throw new Error('next adapter must not start with "use client" (it is a server component)');
}

// ── 3. components/index.js must NOT start with "use client" ──────────────────
const componentsBundle = readFileSync("dist/components/index.js", "utf-8");
const compFirstLine = firstLine(componentsBundle);
if (compFirstLine === '"use client"' || compFirstLine === "'use client'") {
  throw new Error(
    'components/index.js must not start with "use client" (presentationalComponents must be server-safe)'
  );
}

// ── 4. Tabs module MUST carry "use client" ────────────────────────────────────
const tabsPath = "dist/components/tabs.js";
if (!existsSync(tabsPath)) {
  throw new Error(`missing Tabs module: ${tabsPath}`);
}
const tabsContent = readFileSync(tabsPath, "utf-8");
if (!hasClientDirective(tabsContent)) {
  throw new Error(`Tabs component is missing "use client" boundary in ${tabsPath}`);
}

// ── 5. Verify the import chain: next/mdx-content → components → NOT client ───
// next/mdx-content.js imports presentationalComponents from "../components"
// which is dist/components/index.js — already verified not to be "use client"
const nextMdxContent = readFileSync("dist/next/mdx-content.js", "utf-8");
const nextMdxFirstLine = firstLine(nextMdxContent);
if (nextMdxFirstLine === '"use client"' || nextMdxFirstLine === "'use client'") {
  throw new Error(
    'dist/next/mdx-content.js must not start with "use client" (it is a server component that passes components to MDXRemote)'
  );
}
// Confirm it imports presentationalComponents from components
if (!nextMdxContent.includes("presentationalComponents") || !nextMdxContent.includes("../components")) {
  throw new Error(
    "dist/next/mdx-content.js must import presentationalComponents from ../components"
  );
}

// ── 6. config/index.js must NOT have "use client" ────────────────────────────
const configBundle = readFileSync("dist/config/index.js", "utf-8");
if (hasClientDirective(configBundle)) {
  throw new Error('Spurious "use client" directive found in dist/config/index.js');
}

console.log("dist check OK");
