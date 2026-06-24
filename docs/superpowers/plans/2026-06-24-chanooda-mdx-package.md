# `@chanooda/mdx` Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the portfolio's MDX rendering components into a standalone npm package (`@chanooda/mdx`) usable in both Next.js (RSC) and plain React (SPA) environments.

**Architecture:** Three layers — env-agnostic presentational components + shared plugin config form the package body; thin per-environment adapters (`/next` = `next-mdx-remote/rsc`, `/react` = `@mdx-js/mdx` runtime compile) wire rendering and data-fetching. Server-data embeds (GitHubRepo, XPost) are split into pure `*View` components (data via props) plus environment-specific fetcher wrappers. Styling is self-contained plain CSS with `mdx-*` classes themed via CSS variables.

**Tech Stack:** React 19, TypeScript, tsup (build), Vitest + Testing Library (test), shiki/rehype-pretty-code/remark-gfm (MDX pipeline), next-mdx-remote (Next adapter), @mdx-js/mdx (React adapter).

## Global Constraints

- Package name: `@chanooda/mdx`, `"type": "module"`, ESM-only output.
- Working directory for all package tasks: `/Users/chan/Desktop/chanooda-mdx`.
- `react` (`>=18`), `react-dom` (`>=18`) are peerDependencies. `next` (`>=14`), `next-mdx-remote` (`>=5`), `@mdx-js/mdx` (`>=3`) are **optional** peerDependencies.
- `remark-gfm` (`^4`), `rehype-pretty-code` (`^0.14`), `shiki` (`^4`), `@shikijs/transformers` (`^4`), `lucide-react` (`^0.577`), `@radix-ui/react-icons` (`^1`), `react-tweet` (`^3`) are regular `dependencies`.
- shiki theme: `"github-dark"` (unchanged from current portfolio).
- Subpath exports: `./components`, `./config`, `./next`, `./react`, `./styles.css`.
- `"use client"` directive MUST be preserved in build output for `tabs.tsx` and all `/react` adapter files.
- Every component accepts an optional `className?: string` appended after its base `mdx-*` class.
- CSS uses `mdx-` prefix (BEM-like), values default to current portfolio tokens, overridable via CSS variables.
- Body typography (`prose`) is the consumer's responsibility — out of package scope.
- Commit after every task with `git add` of the listed files.

---

### Task 1: Scaffold package (manifest, tsconfig, layout)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `src/components/.gitkeep`, `src/config/.gitkeep`, `src/next/.gitkeep`, `src/react/.gitkeep`

**Interfaces:**
- Consumes: nothing.
- Produces: installable workspace with deps; `npm` scripts `build`, `test`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "@chanooda/mdx",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": ["*.css"],
  "files": ["dist"],
  "exports": {
    "./components": "./dist/components/index.js",
    "./config": "./dist/config/index.js",
    "./next": "./dist/next/index.js",
    "./react": "./dist/react/index.js",
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-icons": "^1.3.2",
    "@shikijs/transformers": "^4.0.2",
    "lucide-react": "^0.577.0",
    "react-tweet": "^3.3.0",
    "rehype-pretty-code": "^0.14.3",
    "remark-gfm": "^4.0.1",
    "shiki": "^4.0.2"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "next": ">=14",
    "next-mdx-remote": ">=5",
    "@mdx-js/mdx": ">=3"
  },
  "peerDependenciesMeta": {
    "next": { "optional": true },
    "next-mdx-remote": { "optional": true },
    "@mdx-js/mdx": { "optional": true }
  },
  "devDependencies": {
    "@mdx-js/mdx": "^3.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "next": "^16.0.0",
    "next-mdx-remote": "^6.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tsup": "^8.3.5",
    "typescript": "^5",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules
dist
*.tsbuildinfo
```

- [ ] **Step 4: Create empty layout dirs**

```bash
mkdir -p src/components/embed src/config src/next src/react
touch src/components/.gitkeep src/config/.gitkeep src/next/.gitkeep src/react/.gitkeep
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: completes without peer-dependency errors (optional peers may print info but not fail).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json .gitignore src
git commit -m "chore: scaffold @chanooda/mdx package"
```

---

### Task 2: Test + build tooling

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `tsup.config.ts`
- Create: `src/components/__smoke__.test.tsx`

**Interfaces:**
- Consumes: devDeps from Task 1.
- Produces: working `npm test` (jsdom + RTL) and `npm run build` (tsup multi-entry).

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Create `tsup.config.ts`**

```ts
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
```

Note: tsup ≥8 preserves leading `"use client"` directives automatically when present at the top of an entry/chunk. Task 14 verifies this in `dist`.

- [ ] **Step 4: Write smoke test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("renders JSX in jsdom", () => {
    render(<div>harness-ok</div>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run smoke test**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts tsup.config.ts src/components/__smoke__.test.tsx
git commit -m "chore: add vitest + tsup tooling"
```

---

### Task 3: `Callout` component

**Files:**
- Create: `src/components/callout.tsx`
- Test: `src/components/callout.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `Callout({ type?: "info" | "warning" | "tip" | "danger"; children: ReactNode; className?: string })`. Root element has class `mdx-callout mdx-callout--<type>`.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./callout";

describe("Callout", () => {
  it("applies type modifier class and renders children", () => {
    const { container } = render(<Callout type="warning">be careful</Callout>);
    expect(screen.getByText("be careful")).toBeInTheDocument();
    expect(container.querySelector(".mdx-callout")).toHaveClass(
      "mdx-callout--warning",
    );
  });

  it("defaults to info and appends custom className", () => {
    const { container } = render(<Callout className="extra">hi</Callout>);
    const root = container.querySelector(".mdx-callout");
    expect(root).toHaveClass("mdx-callout--info");
    expect(root).toHaveClass("extra");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- callout`
Expected: FAIL (cannot resolve `./callout`).

- [ ] **Step 3: Write implementation**

```tsx
import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip" | "danger";

const labels: Record<CalloutType, { icon: string; label: string }> = {
  info: { icon: "ℹ️", label: "Info" },
  tip: { icon: "💡", label: "Tip" },
  warning: { icon: "⚠️", label: "Warning" },
  danger: { icon: "🚨", label: "Danger" },
};

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
  className?: string;
}

export function Callout({ type = "info", children, className }: CalloutProps) {
  const { icon, label } = labels[type];
  return (
    <div className={`mdx-callout mdx-callout--${type}${className ? ` ${className}` : ""}`}>
      <p className="mdx-callout__label">
        {icon} {label}
      </p>
      <div className="mdx-callout__body">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- callout`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/callout.tsx src/components/callout.test.tsx
git commit -m "feat: add Callout component"
```

---

### Task 4: `Steps` / `Step` components

**Files:**
- Create: `src/components/steps.tsx`
- Test: `src/components/steps.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `Steps({ children; className? })` → `<ol class="mdx-steps">`; `Step({ title: string; children; className? })` → `<li class="mdx-step">`.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Step, Steps } from "./steps";

describe("Steps", () => {
  it("renders ordered list with step titles", () => {
    const { container } = render(
      <Steps>
        <Step title="First">do A</Step>
        <Step title="Second">do B</Step>
      </Steps>,
    );
    expect(container.querySelector("ol.mdx-steps")).toBeInTheDocument();
    expect(container.querySelectorAll("li.mdx-step")).toHaveLength(2);
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("do B")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- steps`
Expected: FAIL (cannot resolve `./steps`).

- [ ] **Step 3: Write implementation**

```tsx
import type { ReactNode } from "react";

export function Steps({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ol className={`mdx-steps${className ? ` ${className}` : ""}`}>{children}</ol>
  );
}

export function Step({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={`mdx-step${className ? ` ${className}` : ""}`}>
      <span className="mdx-step__marker" />
      <div className="mdx-step__content">
        <p className="mdx-step__title">{title}</p>
        <div className="mdx-step__body">{children}</div>
      </div>
    </li>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- steps`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/steps.tsx src/components/steps.test.tsx
git commit -m "feat: add Steps/Step components"
```

---

### Task 5: `FileTree` / `Folder` / `File` components

**Files:**
- Create: `src/components/file-tree.tsx`
- Test: `src/components/file-tree.test.tsx`

**Interfaces:**
- Consumes: `lucide-react` (`FileIcon`, `FolderIcon`).
- Produces: `FileTree({ children; className? })`, `Folder({ name: string; children?; defaultOpen?: boolean; className? })`, `File({ name: string; className? })`.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { File, FileTree, Folder } from "./file-tree";

describe("FileTree", () => {
  it("renders folders and files; hides children when defaultOpen is false", () => {
    render(
      <FileTree>
        <Folder name="src">
          <File name="index.ts" />
        </Folder>
        <Folder name="hidden" defaultOpen={false}>
          <File name="secret.ts" />
        </Folder>
      </FileTree>,
    );
    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("index.ts")).toBeInTheDocument();
    expect(screen.queryByText("secret.ts")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- file-tree`
Expected: FAIL (cannot resolve `./file-tree`).

- [ ] **Step 3: Write implementation**

```tsx
import { FileIcon, FolderIcon } from "lucide-react";
import type { ReactNode } from "react";

export function FileTree({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mdx-file-tree${className ? ` ${className}` : ""}`}>
      <ul className="mdx-file-tree__list">{children}</ul>
    </div>
  );
}

export function Folder({
  name,
  children,
  defaultOpen = true,
  className,
}: {
  name: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <li className={`mdx-file-tree__folder${className ? ` ${className}` : ""}`}>
      <div className="mdx-file-tree__folder-label">
        <FolderIcon className="mdx-file-tree__folder-icon" />
        <span>{name}</span>
      </div>
      {defaultOpen && children && (
        <ul className="mdx-file-tree__children">{children}</ul>
      )}
    </li>
  );
}

export function File({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <li className={`mdx-file-tree__file${className ? ` ${className}` : ""}`}>
      <FileIcon className="mdx-file-tree__file-icon" />
      <span>{name}</span>
    </li>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- file-tree`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/file-tree.tsx src/components/file-tree.test.tsx
git commit -m "feat: add FileTree/Folder/File components"
```

---

### Task 6: `Tabs` / `Tab` components (client)

**Files:**
- Create: `src/components/tabs.tsx`
- Test: `src/components/tabs.test.tsx`

**Interfaces:**
- Consumes: React `useState`.
- Produces: `Tabs({ children; className? })` (has `"use client"`), `Tab({ label: string; children; className? })`. Active tab button has class `mdx-tabs__tab--active`.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tab, Tabs } from "./tabs";

describe("Tabs", () => {
  it("shows first tab by default and switches on click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs>
        <Tab label="One">panel one</Tab>
        <Tab label="Two">panel two</Tab>
      </Tabs>,
    );
    expect(screen.getByText("panel one")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Two" }));
    expect(screen.getByText("panel two")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tabs`
Expected: FAIL (cannot resolve `./tabs`).

- [ ] **Step 3: Write implementation**

```tsx
"use client";

import type { ReactNode } from "react";
import { Children, isValidElement, useState } from "react";

export function Tabs({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const tabs = Children.toArray(children).filter(isValidElement);

  return (
    <div className={`mdx-tabs${className ? ` ${className}` : ""}`}>
      <div className="mdx-tabs__list">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`mdx-tabs__tab${active === i ? " mdx-tabs__tab--active" : ""}`}
          >
            {(tab.props as { label?: string }).label ?? `Tab ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="mdx-tabs__panel">{tabs[active]}</div>
    </div>
  );
}

export function Tab({
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tabs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/tabs.tsx src/components/tabs.test.tsx
git commit -m "feat: add Tabs/Tab components"
```

---

### Task 7: Static embeds (`YouTube`, `CodeSandbox`, `GitHubGist`)

**Files:**
- Create: `src/components/embed/youtube.tsx`
- Create: `src/components/embed/code-sandbox.tsx`
- Create: `src/components/embed/github-gist.tsx`
- Test: `src/components/embed/static-embeds.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `YouTube({ id: string; title?: string; className? })`, `CodeSandbox({ id: string; title?: string; className? })`, `GitHubGist({ id: string; className? })`.

- [ ] **Step 1: Write failing test**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CodeSandbox } from "./code-sandbox";
import { GitHubGist } from "./github-gist";
import { YouTube } from "./youtube";

describe("static embeds", () => {
  it("YouTube builds embed src from id", () => {
    const { container } = render(<YouTube id="abc123" />);
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe(
      "https://www.youtube.com/embed/abc123",
    );
  });

  it("CodeSandbox builds embed src from id", () => {
    const { container } = render(<CodeSandbox id="xyz" />);
    expect(container.querySelector("iframe")?.getAttribute("src")).toContain(
      "https://codesandbox.io/embed/xyz",
    );
  });

  it("GitHubGist builds pibb src from id", () => {
    const { container } = render(<GitHubGist id="user/g1" />);
    expect(container.querySelector("iframe")?.getAttribute("src")).toBe(
      "https://gist.github.com/user/g1.pibb",
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- static-embeds`
Expected: FAIL (cannot resolve modules).

- [ ] **Step 3: Write `youtube.tsx`**

```tsx
interface YouTubeProps {
  id: string;
  title?: string;
  className?: string;
}

export function YouTube({ id, title = "YouTube video", className }: YouTubeProps) {
  return (
    <div className={`mdx-embed mdx-embed--video${className ? ` ${className}` : ""}`}>
      <div className="mdx-embed__aspect">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="mdx-embed__iframe"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `code-sandbox.tsx`**

```tsx
interface CodeSandboxProps {
  id: string;
  title?: string;
  className?: string;
}

export function CodeSandbox({
  id,
  title = "CodeSandbox",
  className,
}: CodeSandboxProps) {
  return (
    <div className={`mdx-embed${className ? ` ${className}` : ""}`}>
      <iframe
        src={`https://codesandbox.io/embed/${id}?fontsize=14&hidenavigation=1&theme=dark`}
        title={title}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        className="mdx-embed__iframe-sandbox"
      />
    </div>
  );
}
```

- [ ] **Step 5: Write `github-gist.tsx`**

```tsx
interface GitHubGistProps {
  id: string;
  className?: string;
}

export function GitHubGist({ id, className }: GitHubGistProps) {
  return (
    <div className={`mdx-embed${className ? ` ${className}` : ""}`}>
      <iframe
        src={`https://gist.github.com/${id}.pibb`}
        title={`GitHub Gist ${id}`}
        className="mdx-embed__iframe-gist"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      />
    </div>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- static-embeds`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/embed/youtube.tsx src/components/embed/code-sandbox.tsx src/components/embed/github-gist.tsx src/components/embed/static-embeds.test.tsx
git commit -m "feat: add static embed components"
```

---

### Task 8: Presentational `GitHubRepoView` / `XPostView`

**Files:**
- Create: `src/components/embed/github-repo-view.tsx`
- Create: `src/components/embed/x-post-view.tsx`
- Test: `src/components/embed/views.test.tsx`

**Interfaces:**
- Consumes: `@radix-ui/react-icons` (`GitHubLogoIcon`), `react-tweet` (`EmbeddedTweet`, `TweetNotFound`).
- Produces:
  - `GitHubRepoData` type: `{ description: string | null; stargazers_count: number; forks_count: number; language: string | null; html_url: string; full_name: string }`.
  - `GitHubRepoView({ repo: string; data: GitHubRepoData | null; className? })` — renders fallback link when `data` is null.
  - `XPostView({ tweet: Parameters... })` accepting `{ tweet: TweetData | null | undefined; className? }` where `TweetData` is `Awaited<ReturnType<typeof import("react-tweet/api").getTweet>>`. Renders `TweetNotFound` when tweet is null.

- [ ] **Step 1: Write failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GitHubRepoView } from "./github-repo-view";

describe("GitHubRepoView", () => {
  it("renders fallback link when data is null", () => {
    render(<GitHubRepoView repo="vercel/next.js" data={null} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/vercel/next.js");
    expect(screen.getByText("vercel/next.js")).toBeInTheDocument();
  });

  it("renders repo card when data present", () => {
    render(
      <GitHubRepoView
        repo="vercel/next.js"
        data={{
          description: "The React Framework",
          stargazers_count: 1234,
          forks_count: 56,
          language: "TypeScript",
          html_url: "https://github.com/vercel/next.js",
          full_name: "vercel/next.js",
        }}
      />,
    );
    expect(screen.getByText("The React Framework")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- views`
Expected: FAIL (cannot resolve `./github-repo-view`).

- [ ] **Step 3: Write `github-repo-view.tsx`**

```tsx
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export interface GitHubRepoData {
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
  full_name: string;
}

interface GitHubRepoViewProps {
  repo: string;
  data: GitHubRepoData | null;
  className?: string;
}

export function GitHubRepoView({ repo, data, className }: GitHubRepoViewProps) {
  if (!data) {
    return (
      <a
        href={`https://github.com/${repo}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`mdx-gh-repo mdx-gh-repo--fallback${className ? ` ${className}` : ""}`}
      >
        <GitHubLogoIcon />
        {repo}
      </a>
    );
  }

  return (
    <a
      href={data.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mdx-gh-repo${className ? ` ${className}` : ""}`}
    >
      <div className="mdx-gh-repo__title">
        <GitHubLogoIcon />
        {data.full_name}
      </div>
      {data.description && <p className="mdx-gh-repo__desc">{data.description}</p>}
      <div className="mdx-gh-repo__stats">
        {data.language && <span>{data.language}</span>}
        <span>★ {data.stargazers_count.toLocaleString()}</span>
        <span>⑂ {data.forks_count.toLocaleString()}</span>
      </div>
    </a>
  );
}
```

- [ ] **Step 4: Write `x-post-view.tsx`**

```tsx
import type { getTweet } from "react-tweet/api";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";

export type TweetData = Awaited<ReturnType<typeof getTweet>>;

interface XPostViewProps {
  tweet: TweetData | null | undefined;
  className?: string;
}

export function XPostView({ tweet, className }: XPostViewProps) {
  if (!tweet) return <TweetNotFound />;

  // react-tweet bug: entity arrays can be undefined from the API even though
  // types say they're required — addEntities does for...of without null check
  if (tweet.entities) {
    tweet.entities.hashtags ??= [];
    tweet.entities.user_mentions ??= [];
    tweet.entities.urls ??= [];
    tweet.entities.symbols ??= [];
  }

  return (
    <div className={`mdx-x-post${className ? ` ${className}` : ""}`}>
      <EmbeddedTweet tweet={tweet} />
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- views`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/embed/github-repo-view.tsx src/components/embed/x-post-view.tsx src/components/embed/views.test.tsx
git commit -m "feat: add presentational GitHubRepoView/XPostView"
```

---

### Task 9: Presentational components barrel

**Files:**
- Create: `src/components/index.ts`
- Test: `src/components/index.test.ts`

**Interfaces:**
- Consumes: all Task 3–8 components.
- Produces: named re-exports of every component + type, and `presentationalComponents` object — the MDX component map containing every component EXCEPT the environment-specific `GitHubRepo`/`XPost` (adapters add those). Keys: `Callout, Steps, Step, YouTube, CodeSandbox, GitHubGist, Tabs, Tab, FileTree, File, Folder`.

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, it } from "vitest";
import { presentationalComponents } from "./index";

describe("presentationalComponents", () => {
  it("includes shared components and excludes env-specific embeds", () => {
    expect(Object.keys(presentationalComponents).sort()).toEqual(
      [
        "Callout",
        "CodeSandbox",
        "File",
        "FileTree",
        "Folder",
        "GitHubGist",
        "Step",
        "Steps",
        "Tab",
        "Tabs",
        "YouTube",
      ].sort(),
    );
    expect(presentationalComponents).not.toHaveProperty("GitHubRepo");
    expect(presentationalComponents).not.toHaveProperty("XPost");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "components/index"`
Expected: FAIL (cannot resolve `./index`).

- [ ] **Step 3: Write implementation**

```ts
import { Callout } from "./callout";
import { CodeSandbox } from "./embed/code-sandbox";
import { GitHubGist } from "./embed/github-gist";
import { YouTube } from "./embed/youtube";
import { File, FileTree, Folder } from "./file-tree";
import { Step, Steps } from "./steps";
import { Tab, Tabs } from "./tabs";

export { Callout } from "./callout";
export { CodeSandbox } from "./embed/code-sandbox";
export { GitHubGist } from "./embed/github-gist";
export {
  GitHubRepoView,
  type GitHubRepoData,
} from "./embed/github-repo-view";
export { XPostView, type TweetData } from "./embed/x-post-view";
export { YouTube } from "./embed/youtube";
export { File, FileTree, Folder } from "./file-tree";
export { Step, Steps } from "./steps";
export { Tab, Tabs } from "./tabs";

export const presentationalComponents = {
  Callout,
  Steps,
  Step,
  YouTube,
  CodeSandbox,
  GitHubGist,
  Tabs,
  Tab,
  FileTree,
  File,
  Folder,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "components/index"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/index.ts src/components/index.test.ts
git commit -m "feat: add presentational components barrel"
```

---

### Task 10: Shared MDX plugin config

**Files:**
- Create: `src/config/index.ts`
- Test: `src/config/index.test.ts`

**Interfaces:**
- Consumes: `remark-gfm`, `@shikijs/transformers`.
- Produces:
  - `remarkPlugins`: array `[remarkGfm]`.
  - `rehypePrettyCodeOptions(): Options` — returns the rehype-pretty-code options object (theme `github-dark` + the five shiki transformers).
  - Note: `rehype-pretty-code` itself is NOT imported here, so this module stays light enough for the `/react` adapter to import dynamically.

- [ ] **Step 1: Write failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "config/index"`
Expected: FAIL (cannot resolve `./index`).

- [ ] **Step 3: Write implementation**

```ts
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import type { Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

export const remarkPlugins = [remarkGfm];

export function rehypePrettyCodeOptions(): RehypePrettyCodeOptions {
  return {
    theme: "github-dark",
    transformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerNotationFocus(),
      transformerNotationErrorLevel(),
      transformerMetaHighlight(),
    ],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "config/index"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/index.ts src/config/index.test.ts
git commit -m "feat: add shared MDX plugin config"
```

---

### Task 11: Self-contained stylesheet

**Files:**
- Create: `src/styles.css`
- Test: `src/styles.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `dist/styles.css` (copied by tsup). Defines `--mdx-*` theme variables and all `mdx-*` component classes plus the rehype-pretty-code code-block styles.

- [ ] **Step 1: Write failing test**

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  fileURLToPath(new URL("./styles.css", import.meta.url)),
  "utf-8",
);

describe("styles.css", () => {
  it("declares core theme variables with portfolio defaults", () => {
    expect(css).toContain("--mdx-accent: #10b981");
    expect(css).toContain("--mdx-text-secondary: #888888");
  });

  it("defines class for every component family", () => {
    for (const cls of [
      ".mdx-callout",
      ".mdx-steps",
      ".mdx-step",
      ".mdx-file-tree",
      ".mdx-tabs",
      ".mdx-embed",
      ".mdx-gh-repo",
      ".mdx-x-post",
    ]) {
      expect(css).toContain(cls);
    }
  });

  it("includes rehype-pretty-code code-block styles", () => {
    expect(css).toContain("[data-rehype-pretty-code-figure]");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "styles"`
Expected: FAIL (cannot read `./styles.css`).

- [ ] **Step 3: Write `src/styles.css`**

```css
:where(:root) {
  --mdx-background: #030a06;
  --mdx-surface: #050f08;
  --mdx-surface-hover: #0a1f10;
  --mdx-border: #1a3a2a;
  --mdx-border-subtle: #0f2a1a;
  --mdx-accent: #10b981;
  --mdx-accent-light: #34d399;
  --mdx-text-primary: #ffffff;
  --mdx-text-secondary: #888888;
  --mdx-text-muted: #444444;
  --mdx-radius: 0.5rem;

  --mdx-embed-border: rgba(255, 255, 255, 0.1);
  --mdx-embed-border-hover: rgba(255, 255, 255, 0.2);
  --mdx-embed-bg: rgba(255, 255, 255, 0.05);
  --mdx-embed-bg-hover: rgba(255, 255, 255, 0.1);

  --mdx-callout-info-border: rgba(59, 130, 246, 0.4);
  --mdx-callout-info-bg: rgba(59, 130, 246, 0.1);
  --mdx-callout-tip-border: rgba(34, 197, 94, 0.4);
  --mdx-callout-tip-bg: rgba(34, 197, 94, 0.1);
  --mdx-callout-warning-border: rgba(234, 179, 8, 0.4);
  --mdx-callout-warning-bg: rgba(234, 179, 8, 0.1);
  --mdx-callout-danger-border: rgba(239, 68, 68, 0.4);
  --mdx-callout-danger-bg: rgba(239, 68, 68, 0.1);
}

/* ── Callout ── */
.mdx-callout {
  margin-block: 1.5rem;
  border-radius: var(--mdx-radius);
  border: 1px solid;
  padding: 0.75rem 1rem;
}
.mdx-callout--info { border-color: var(--mdx-callout-info-border); background: var(--mdx-callout-info-bg); }
.mdx-callout--tip { border-color: var(--mdx-callout-tip-border); background: var(--mdx-callout-tip-bg); }
.mdx-callout--warning { border-color: var(--mdx-callout-warning-border); background: var(--mdx-callout-warning-bg); }
.mdx-callout--danger { border-color: var(--mdx-callout-danger-border); background: var(--mdx-callout-danger-bg); }
.mdx-callout__label {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}
.mdx-callout__body { font-size: 0.875rem; line-height: 1.625; }
.mdx-callout__body > p { margin: 0; }

/* ── Steps ── */
.mdx-steps {
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  list-style: none;
  padding-left: 0;
  counter-reset: step;
}
.mdx-step { display: flex; gap: 1rem; counter-increment: step; }
.mdx-step__marker {
  display: flex;
  height: 1.75rem;
  width: 1.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--mdx-accent) 20%, transparent);
  font-family: monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mdx-accent);
}
.mdx-step__marker::before { content: counter(step); }
.mdx-step__content { flex: 1; padding-top: 0.125rem; }
.mdx-step__title { margin: 0 0 0.25rem; font-weight: 600; color: var(--mdx-text-primary); }
.mdx-step__body { font-size: 0.875rem; line-height: 1.625; color: var(--mdx-text-secondary); }
.mdx-step__body > p { margin: 0; }

/* ── FileTree ── */
.mdx-file-tree {
  margin-block: 1.5rem;
  border-radius: var(--mdx-radius);
  border: 1px solid var(--mdx-border);
  background: var(--mdx-surface);
  padding: 1rem;
  font-family: monospace;
  font-size: 0.875rem;
}
.mdx-file-tree__list { margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.mdx-file-tree__folder { list-style: none; }
.mdx-file-tree__folder-label { display: flex; align-items: center; gap: 0.5rem; color: var(--mdx-text-secondary); }
.mdx-file-tree__folder-icon { height: 1rem; width: 1rem; color: var(--mdx-accent); }
.mdx-file-tree__children {
  margin: 0.25rem 0 0 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-left: 1px solid var(--mdx-border);
  padding-left: 0.75rem;
}
.mdx-file-tree__file { display: flex; align-items: center; gap: 0.5rem; color: var(--mdx-text-secondary); list-style: none; }
.mdx-file-tree__file-icon { height: 1rem; width: 1rem; opacity: 0.5; }

/* ── Tabs ── */
.mdx-tabs { margin-block: 1.5rem; }
.mdx-tabs__list { display: flex; border-bottom: 1px solid var(--mdx-border); }
.mdx-tabs__tab {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--mdx-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}
.mdx-tabs__tab:hover { color: var(--mdx-text-primary); }
.mdx-tabs__tab--active { color: var(--mdx-accent); border-bottom: 2px solid var(--mdx-accent); }

/* ── Embeds ── */
.mdx-embed {
  margin-block: 1.5rem;
  overflow: hidden;
  border-radius: var(--mdx-radius);
  border: 1px solid var(--mdx-embed-border);
}
.mdx-embed__aspect { position: relative; aspect-ratio: 16 / 9; }
.mdx-embed__iframe { position: absolute; inset: 0; height: 100%; width: 100%; }
.mdx-embed__iframe-sandbox { height: 24rem; width: 100%; }
.mdx-embed__iframe-gist { width: 100%; }

/* ── GitHub repo card ── */
.mdx-gh-repo {
  margin-block: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-radius: var(--mdx-radius);
  border: 1px solid var(--mdx-embed-border);
  background: var(--mdx-embed-bg);
  padding: 1rem 1.25rem;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}
.mdx-gh-repo:hover { border-color: var(--mdx-embed-border-hover); background: var(--mdx-embed-bg-hover); }
.mdx-gh-repo--fallback {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  background: none;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--mdx-text-secondary);
}
.mdx-gh-repo__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mdx-text-primary);
}
.mdx-gh-repo__desc { margin: 0; font-size: 0.875rem; color: var(--mdx-text-secondary); }
.mdx-gh-repo__stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--mdx-text-muted);
}

/* ── X post ── */
.mdx-x-post { display: flex; justify-content: center; }
.mdx-x-post .react-tweet-theme { margin: 0 !important; background: transparent !important; }

/* ── rehype-pretty-code: shiki ── */
[data-rehype-pretty-code-figure] [data-line] { display: block; padding: 0 1.25rem; }
[data-rehype-pretty-code-figure] [data-line].diff.add {
  background-color: rgba(16, 185, 129, 0.12);
  border-left: 2px solid #10b981;
}
[data-rehype-pretty-code-figure] [data-line].diff.add::before { content: "+"; margin-right: 0.75rem; color: #10b981; }
[data-rehype-pretty-code-figure] [data-line].diff.remove {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 2px solid #ef4444;
  opacity: 0.6;
}
[data-rehype-pretty-code-figure] [data-line].diff.remove::before { content: "-"; margin-right: 0.75rem; color: #ef4444; }
[data-rehype-pretty-code-figure] [data-line].highlighted {
  background-color: rgba(255, 255, 255, 0.06);
  border-left: 2px solid rgba(255, 255, 255, 0.25);
}
[data-rehype-pretty-code-figure] [data-line].error { background-color: rgba(239, 68, 68, 0.1); border-left: 2px solid #ef4444; }
[data-rehype-pretty-code-figure] [data-line].warning { background-color: rgba(245, 158, 11, 0.1); border-left: 2px solid #f59e0b; }
[data-rehype-pretty-code-figure] pre.has-focused [data-line]:not(.focused) { opacity: 0.25; transition: opacity 0.2s; }
[data-rehype-pretty-code-figure] pre.has-focused:hover [data-line]:not(.focused) { opacity: 1; }
code[data-line-numbers] { counter-reset: line; }
code[data-line-numbers] [data-line] { padding-left: 0; }
code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1rem;
  margin-right: 1rem;
  text-align: right;
  color: #444;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "styles"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/styles.test.ts
git commit -m "feat: add self-contained styles.css"
```

---

### Task 12: Next.js (RSC) adapter

**Files:**
- Create: `src/next/github-repo.tsx`
- Create: `src/next/x-post.tsx`
- Create: `src/next/mdx-content.tsx`
- Create: `src/next/index.ts`
- Test: `src/next/github-repo.test.tsx`

**Interfaces:**
- Consumes: `presentationalComponents`, `GitHubRepoView`, `GitHubRepoData`, `XPostView` (from `../components`); `remarkPlugins`, `rehypePrettyCodeOptions` (from `../config`); `next-mdx-remote/rsc` (`MDXRemote`); `react-tweet/api` (`getTweet`).
- Produces: `MdxContent({ source: string })` (default Next renderer), async `GitHubRepo({ repo })`, async `XPost({ id })`, plus `fetchGitHubRepo(repo): Promise<GitHubRepoData | null>`.

- [ ] **Step 1: Write failing test (fetcher logic)**

```tsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGitHubRepo } from "./github-repo";

afterEach(() => vi.restoreAllMocks());

describe("fetchGitHubRepo (next)", () => {
  it("returns parsed data on ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ full_name: "a/b", stargazers_count: 1 }),
      }),
    );
    const data = await fetchGitHubRepo("a/b");
    expect(data?.full_name).toBe("a/b");
  });

  it("returns null when response not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchGitHubRepo("a/b")).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await fetchGitHubRepo("a/b")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "next/github-repo"`
Expected: FAIL (cannot resolve `./github-repo`).

- [ ] **Step 3: Write `src/next/github-repo.tsx`**

```tsx
import { GitHubRepoView, type GitHubRepoData } from "../components";

export async function fetchGitHubRepo(
  repo: string,
): Promise<GitHubRepoData | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) return (await res.json()) as GitHubRepoData;
  } catch {}
  return null;
}

export async function GitHubRepo({ repo }: { repo: string }) {
  const data = await fetchGitHubRepo(repo);
  return <GitHubRepoView repo={repo} data={data} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "next/github-repo"`
Expected: PASS (3 tests).

- [ ] **Step 5: Write `src/next/x-post.tsx`**

```tsx
import { getTweet } from "react-tweet/api";
import { XPostView } from "../components";

export async function XPost({ id }: { id: string }) {
  let tweet: Awaited<ReturnType<typeof getTweet>> | undefined;
  try {
    tweet = await getTweet(id);
  } catch {
    return (
      <div className="mdx-x-post__error">Tweet could not be loaded.</div>
    );
  }
  return <XPostView tweet={tweet} />;
}
```

- [ ] **Step 6: Write `src/next/mdx-content.tsx`**

```tsx
import rehypePrettyCode from "rehype-pretty-code";
import { MDXRemote } from "next-mdx-remote/rsc";
import { presentationalComponents } from "../components";
import { rehypePrettyCodeOptions, remarkPlugins } from "../config";
import { GitHubRepo } from "./github-repo";
import { XPost } from "./x-post";

const components = { ...presentationalComponents, GitHubRepo, XPost };

export function MdxContent({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins,
          rehypePlugins: [
            [rehypePrettyCode as never, rehypePrettyCodeOptions()],
          ],
        },
      }}
    />
  );
}
```

- [ ] **Step 7: Write `src/next/index.ts`**

```ts
export { MdxContent } from "./mdx-content";
export { GitHubRepo, fetchGitHubRepo } from "./github-repo";
export { XPost } from "./x-post";
```

- [ ] **Step 8: Add `.mdx-x-post__error` style**

Append to `src/styles.css`:

```css
.mdx-x-post__error {
  margin-block: 1rem;
  border-radius: var(--mdx-radius);
  border: 1px solid var(--mdx-embed-border);
  padding: 0.75rem 1rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--mdx-text-muted);
}
```

- [ ] **Step 9: Run full test suite**

Run: `npm test`
Expected: PASS (all prior tests still green).

- [ ] **Step 10: Commit**

```bash
git add src/next src/styles.css
git commit -m "feat: add Next.js RSC adapter"
```

---

### Task 13: React (SPA) adapter — runtime compile

**Files:**
- Create: `src/react/github-repo.tsx`
- Create: `src/react/x-post.tsx`
- Create: `src/react/mdx-content.tsx`
- Create: `src/react/index.ts`
- Test: `src/react/github-repo.test.tsx`
- Test: `src/react/mdx-content.test.tsx`

**Interfaces:**
- Consumes: `presentationalComponents`, `GitHubRepoView`, `XPostView`, `TweetData` (from `../components`); `remarkPlugins`, `rehypePrettyCodeOptions` (dynamically, from `../config`); `@mdx-js/mdx` (`evaluate`); `react/jsx-runtime`; `rehype-pretty-code` (dynamic import for code-splitting shiki).
- Produces: `"use client"` `MdxContent({ source: string })` (runtime evaluate), `GitHubRepo({ repo })`, `XPost({ id })`.

- [ ] **Step 1: Write failing test (client fetch component)**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GitHubRepo } from "./github-repo";

afterEach(() => vi.restoreAllMocks());

describe("GitHubRepo (react)", () => {
  it("fetches client-side and renders the repo card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          full_name: "a/b",
          description: "desc",
          stargazers_count: 3,
          forks_count: 1,
          language: "TS",
          html_url: "https://github.com/a/b",
        }),
      }),
    );
    render(<GitHubRepo repo="a/b" />);
    await waitFor(() =>
      expect(screen.getByText("desc")).toBeInTheDocument(),
    );
  });

  it("renders fallback when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("x")));
    render(<GitHubRepo repo="a/b" />);
    await waitFor(() =>
      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "https://github.com/a/b",
      ),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "react/github-repo"`
Expected: FAIL (cannot resolve `./github-repo`).

- [ ] **Step 3: Write `src/react/github-repo.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { GitHubRepoView, type GitHubRepoData } from "../components";

export function GitHubRepo({ repo }: { repo: string }) {
  const [data, setData] = useState<GitHubRepoData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${repo}`);
        if (res.ok && active) setData((await res.json()) as GitHubRepoData);
      } catch {
        if (active) setData(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [repo]);

  return <GitHubRepoView repo={repo} data={data} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "react/github-repo"`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `src/react/x-post.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { XPostView, type TweetData } from "../components";

export function XPost({ id }: { id: string }) {
  const [tweet, setTweet] = useState<TweetData | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`https://react-tweet.vercel.app/api/tweet/${id}`);
        const json = (await res.json()) as { data?: TweetData };
        if (active) setTweet(json.data ?? null);
      } catch {
        if (active) setTweet(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (tweet === undefined) return null;
  return <XPostView tweet={tweet} />;
}
```

Note: the X post JSON endpoint is configurable by the consumer in a future iteration; for now it uses the public react-tweet syndication proxy. Documented as a known limitation.

- [ ] **Step 6: Write failing test for runtime MdxContent**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MdxContent } from "./mdx-content";

describe("MdxContent (react runtime)", () => {
  it("compiles and renders MDX with custom components", async () => {
    const source = `# Title\n\n<Callout type="tip">runtime works</Callout>`;
    render(<MdxContent source={source} />);
    await waitFor(() =>
      expect(screen.getByText("runtime works")).toBeInTheDocument(),
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm test -- "react/mdx-content"`
Expected: FAIL (cannot resolve `./mdx-content`).

- [ ] **Step 8: Write `src/react/mdx-content.tsx`**

```tsx
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
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test -- "react/mdx-content"`
Expected: PASS. (If shiki download is slow on first run, the `waitFor` default 1s timeout may need raising to `{ timeout: 10000 }` — adjust only if it flakes.)

- [ ] **Step 10: Write `src/react/index.ts`**

```ts
export { MdxContent } from "./mdx-content";
export { GitHubRepo } from "./github-repo";
export { XPost } from "./x-post";
```

- [ ] **Step 11: Run full suite + commit**

Run: `npm test`
Expected: PASS (all green).

```bash
git add src/react
git commit -m "feat: add React SPA runtime adapter"
```

---

### Task 14: Build verification

**Files:**
- Modify: none (verification only)
- Create: `scripts/check-dist.mjs`

**Interfaces:**
- Consumes: all prior source.
- Produces: confirmed `dist/` with correct entry files, preserved `"use client"`, copied `styles.css`.

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: tsup completes, emits `dist/components/index.js`, `dist/config/index.js`, `dist/next/index.js`, `dist/react/index.js`, matching `.d.ts` files, and `dist/styles.css`.

- [ ] **Step 2: Write `scripts/check-dist.mjs`**

```js
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
```

- [ ] **Step 3: Run the check**

Run: `node scripts/check-dist.mjs`
Expected: prints `dist check OK`.

If the `"use client"` assertion fails: tsup did not preserve the banner. Fix by adding to `tsup.config.ts` a per-chunk banner via `esbuildOptions(options){ options.banner = { js: '"use client"' } }` ONLY for the react entry (split tsup into two configs: one for `react` with the banner, one for the rest), then re-run Steps 1–3.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-dist.mjs
git commit -m "chore: add dist verification script"
```

---

### Task 15: Migrate the portfolio to consume `@chanooda/mdx`

**Files (in `/Users/chan/Desktop/portfolio`):**
- Modify: `package.json` (add dependency)
- Modify: `src/app/blog/[...slug]/page.tsx`
- Modify: `src/app/projects/[slug]/page.tsx`
- Modify: `src/app/globals.css` (import package styles; remove migrated rehype CSS)
- Delete: `src/_shared/ui/mdx/` (entire directory)

**Interfaces:**
- Consumes: built `@chanooda/mdx` from Task 14.
- Produces: portfolio rendering blog + project pages via the package; old local MDX dir removed.

- [ ] **Step 1: Pack the package**

Run (in `/Users/chan/Desktop/chanooda-mdx`): `npm pack`
Expected: produces `chanooda-mdx-0.1.0.tgz`.

- [ ] **Step 2: Install into portfolio**

Run (in `/Users/chan/Desktop/portfolio`): `npm install ../chanooda-mdx/chanooda-mdx-0.1.0.tgz`
Expected: `@chanooda/mdx` appears in `package.json` dependencies; `next-mdx-remote` already present (peer satisfied).

- [ ] **Step 3: Update blog page import**

In `src/app/blog/[...slug]/page.tsx`, replace:

```tsx
import { MdxContent } from "@/_shared/ui/mdx/mdx-content";
```

with:

```tsx
import { MdxContent } from "@chanooda/mdx/next";
```

(The `<MdxContent source={post.content} />` usage is unchanged.)

- [ ] **Step 4: Update projects page to use `MdxContent`**

In `src/app/projects/[slug]/page.tsx`, replace the import:

```tsx
import { MDXRemote } from "next-mdx-remote/rsc";
```

with:

```tsx
import { MdxContent } from "@chanooda/mdx/next";
```

and replace the usage:

```tsx
<MDXRemote source={project.longDescription ?? project.description} />
```

with:

```tsx
<MdxContent source={project.longDescription ?? project.description} />
```

- [ ] **Step 5: Wire up styles and remove duplicated CSS**

In `src/app/globals.css`:
1. Add near the top (after the `@import "tailwindcss";` / `@plugin` lines):

```css
@import "@chanooda/mdx/styles.css";
```

2. Delete the entire `/* ─── rehype-pretty-code: shiki transformers ─── */` block (lines defining `[data-rehype-pretty-code-figure] ...` through the `code[data-line-numbers]` rules) — these now live in the package stylesheet.

- [ ] **Step 6: Delete the old local MDX directory**

```bash
rm -rf src/_shared/ui/mdx
```

- [ ] **Step 7: Verify no stale references remain**

Run: `grep -rn "_shared/ui/mdx" src`
Expected: no output.

- [ ] **Step 8: Build the portfolio**

Run: `npm run build`
Expected: Next build succeeds; blog and project detail pages compile.

- [ ] **Step 9: Commit (portfolio repo)**

```bash
git add package.json package-lock.json src/app/blog src/app/projects src/app/globals.css
git commit -m "refactor: consume @chanooda/mdx package for MDX rendering"
```

---

## Self-Review

**Spec coverage:**
- Architecture (3-layer, adapter split) → Tasks 3–13. ✓
- exports map + optional peerDeps → Task 1. ✓
- shiki lazy in `/react` → Task 13 (dynamic imports). ✓
- Self-contained CSS + variables + `className` override → Task 11 + every component task. ✓
- Typography stays consumer's → Task 15 keeps `prose` on `<article>`, package ships only component CSS. ✓
- Server embeds = View + env fetchers → Tasks 8, 12, 13. ✓
- `"use client"` preserved → Task 14 verification. ✓
- Build (tsup) + tests (Vitest) → Tasks 2, 14. ✓
- Migration 8 steps → Task 15. ✓
- `node:fs` content loading stays in app → not touched (Task 15 leaves `getBlogApi`). ✓
- npm publish excluded → not in plan (local `npm pack` only). ✓

**Placeholder scan:** No TBD/TODO; all steps contain concrete code and commands. The X post client endpoint is explicitly noted as a documented limitation, not a placeholder.

**Type consistency:** `GitHubRepoData` defined in Task 8, reused in Tasks 12/13. `TweetData` defined in Task 8, reused in Task 13. `presentationalComponents` defined in Task 9, consumed in Tasks 12/13. `rehypePrettyCodeOptions`/`remarkPlugins` defined in Task 10, consumed in Tasks 12/13. `MdxContent({ source })` signature identical across `/next` and `/react`. Consistent. ✓
