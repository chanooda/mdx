import { readFileSync, existsSync } from "node:fs";

// Derive the required files from package.json `exports` so every published
// subpath is verified to ship BOTH its runtime (`import`) and its types
// (`types`). A prior 0.1.0 release shipped dist/react/*.js without the matching
// .d.ts (a build race wiped them) and nothing caught it — hence this check.
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const required = new Set();
for (const entry of Object.values(pkg.exports)) {
  if (typeof entry === "string") {
    required.add(entry);
    continue;
  }
  for (const target of Object.values(entry)) {
    if (typeof target === "string") required.add(target);
  }
}
for (const f of required) {
  const path = f.replace(/^\.\//, "");
  if (!existsSync(path)) throw new Error(`missing build output: ${path}`);
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
