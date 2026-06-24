import { readFileSync, existsSync, readdirSync } from "node:fs";

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

// Assert react adapter starts with "use client"
const reactBundle = readFileSync("dist/react/index.js", "utf-8");
if (!reactBundle.includes('"use client"') && !reactBundle.includes("'use client'")) {
  throw new Error('react adapter lost "use client" directive');
}

// Assert next adapter does NOT have "use client" at file level (server component)
const nextBundle = readFileSync("dist/next/index.js", "utf-8");
const nextFirstLine = nextBundle.split("\n")[0].trim();
if (nextFirstLine === '"use client"' || nextFirstLine === "'use client'") {
  throw new Error('next adapter must not start with "use client" (it is a server component)');
}

// Assert Tabs client boundary is preserved: the chunk imported by components/index.js
// that contains Tabs must carry "use client"
const componentsBundle = readFileSync("dist/components/index.js", "utf-8");

// Find all chunk files referenced from components/index.js
const chunkRefs = [...componentsBundle.matchAll(/from "\.\.\/([^"]+)"/g)].map((m) => `dist/${m[1]}`);

// Also check the components bundle itself
const filesToCheck = [
  "dist/components/index.js",
  ...chunkRefs.filter((f) => existsSync(f)),
];

// Find any dist chunk files that have Tabs exported (contain useState + Tabs)
const distFiles = readdirSync("dist").filter((f) => f.endsWith(".js"));
const tabsChunks = distFiles
  .map((f) => `dist/${f}`)
  .filter((f) => {
    const content = readFileSync(f, "utf-8");
    return content.includes("useState") && content.includes("Tabs");
  });

if (tabsChunks.length === 0) {
  throw new Error("Could not find any chunk containing Tabs + useState in dist/");
}

let tabsClientBoundaryOk = false;
for (const chunkPath of tabsChunks) {
  const content = readFileSync(chunkPath, "utf-8");
  if (content.includes('"use client"') || content.includes("'use client'")) {
    tabsClientBoundaryOk = true;
    break;
  }
}

if (!tabsClientBoundaryOk) {
  throw new Error(
    `Tabs component is missing "use client" boundary in its output chunk(s). ` +
      `Checked: ${tabsChunks.join(", ")}`
  );
}

// Assert the shared config chunk does NOT have a spurious "use client"
const configChunks = distFiles.filter((f) => f.startsWith("config-")).map((f) => `dist/${f}`);
for (const configChunk of configChunks) {
  const content = readFileSync(configChunk, "utf-8");
  if (content.includes('"use client"') || content.includes("'use client'")) {
    throw new Error(
      `Spurious "use client" directive found in shared config chunk: ${configChunk}`
    );
  }
}

console.log("dist check OK");
