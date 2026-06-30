# @chanooda/mdx

Next.js(RSC)와 순수 React(SPA) 양쪽에서 쓸 수 있는 MDX 렌더링 컴포넌트 모음입니다.

프레젠테이션 컴포넌트·설정은 본체에 두고, 환경에 결합되는 렌더링/패칭만 얇은 어댑터(`/next`, `/react`)로 분리했습니다. 스타일은 자급자족 CSS + CSS 변수 테마링이라 소비자의 Tailwind 설정에 의존하지 않습니다.

## 특징

- **두 환경 지원** — Next.js는 `next-mdx-remote/rsc`로 서버 렌더, React SPA는 `@mdx-js/mdx`로 런타임 컴파일
- **코드 하이라이팅** — `shiki` + `rehype-pretty-code` (diff/highlight/focus/error-level notation 지원)
- **GFM** — `remark-gfm` 기본 적용
- **임베드** — YouTube, CodeSandbox, GitHub Gist, GitHub Repo 카드, X(트윗)
- **MDX 컴포넌트** — Callout, Steps, Tabs, FileTree
- **타입 포함** — 모든 export에 `.d.ts` 제공

## 설치

이 패키지는 **GitHub Packages**에 게시되어 있어, 설치하는 프로젝트 루트에 `.npmrc`가 필요합니다(공개 패키지여도 인증 토큰 필요).

```ini
# .npmrc
@chanooda:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN`은 `read:packages` 권한이 있는 [Personal Access Token](https://github.com/settings/tokens)입니다.

```bash
npm install @chanooda/mdx
```

### Peer dependencies

```bash
# 공통
npm install react react-dom

# Next.js(RSC) 어댑터를 쓸 때
npm install next next-mdx-remote

# React(SPA) 어댑터를 쓸 때
npm install @mdx-js/mdx
```

| peer | 필수 여부 | 버전 |
|------|-----------|------|
| `react`, `react-dom` | 필수 | `>=18` |
| `next` | 선택 (`/next` 사용 시) | `>=14` |
| `next-mdx-remote` | 선택 (`/next` 사용 시) | `>=5` |
| `@mdx-js/mdx` | 선택 (`/react` 사용 시) | `>=3` |

## 스타일

엔트리 어딘가에서 한 번 import 합니다.

```ts
import "@chanooda/mdx/styles.css";
```

## 사용법

### Next.js (RSC)

서버 컴포넌트에서 MDX 문자열을 그대로 렌더합니다.

```tsx
import { MdxContent } from "@chanooda/mdx/next";
import "@chanooda/mdx/styles.css";

export default async function Page() {
  const source = await getMarkdownSource(); // 임의의 MDX 문자열 로딩
  return <MdxContent source={source} />;
}
```

### React (SPA)

브라우저에서 MDX를 런타임 컴파일해 렌더합니다. (`"use client"` 컴포넌트)

```tsx
import { MdxContent } from "@chanooda/mdx/react";
import "@chanooda/mdx/styles.css";

function Article({ source }: { source: string }) {
  return <MdxContent source={source} />;
}
```

두 어댑터 모두 MDX 안에서 아래 컴포넌트를 별도 등록 없이 사용할 수 있습니다.

```mdx
<Callout type="info">참고하세요.</Callout>

<GitHubRepo repo="chanooda/mdx" />

<XPost id="1234567890" />

<YouTube id="dQw4w9WgXcQ" />
```

## Exports

| 진입점 | 내용 |
|--------|------|
| `@chanooda/mdx/next` | `MdxContent`, `GitHubRepo`, `fetchGitHubRepo`, `XPost` — RSC용 |
| `@chanooda/mdx/react` | `MdxContent`, `GitHubRepo`, `XPost` — SPA(클라이언트)용 |
| `@chanooda/mdx/components` | 환경 무관 프레젠테이션 컴포넌트 + `presentationalComponents` 맵 |
| `@chanooda/mdx/config` | `remarkPlugins`, `rehypePrettyCodeOptions()` |
| `@chanooda/mdx/styles.css` | 패키지 스타일시트 |

### `/components`

`Callout`, `Steps`, `Step`, `Tabs`, `Tab`, `FileTree`, `File`, `Folder`,
`YouTube`, `CodeSandbox`, `GitHubGist`, `GitHubRepoView`, `XPostView`,
그리고 위 프레젠테이션 컴포넌트를 모은 `presentationalComponents` 맵.

`GitHubRepoView`/`XPostView`는 데이터를 props로 받는 순수 뷰라, 직접 패칭 로직을 구성하고 싶을 때 사용합니다.

### `/config`

자체 MDX 파이프라인을 직접 구성할 때 동일한 플러그인 설정을 재사용할 수 있습니다.

```ts
import { remarkPlugins, rehypePrettyCodeOptions } from "@chanooda/mdx/config";
import rehypePrettyCode from "rehype-pretty-code";

// 예: next-mdx-remote/rsc MDXRemote 옵션에 직접 주입
const options = {
  mdxOptions: {
    remarkPlugins,
    rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions()]],
  },
};
```

## 테마링

스타일은 `--mdx-*` CSS 변수(기본값은 다크 테마)로 노출되어 있어, 소비자 측에서 재정의해 덮어쓸 수 있습니다.

```css
:root {
  --mdx-background: #ffffff;
  --mdx-text-primary: #111111;
  --mdx-accent: #2563eb;
  --mdx-border: #e5e7eb;
  --mdx-radius: 0.75rem;
}
```

배경/표면, 텍스트, 강조색, 테두리, Callout 종류별 색, 임베드 카드 색 등
56개 변수를 제공합니다. 전체 목록은 [`src/styles.css`](./src/styles.css)를 참고하세요.

## 개발

```bash
npm install
npm run build      # tsup으로 dist 생성 (ESM + .d.ts)
npm test           # vitest
```

## 릴리스

`v*` 태그를 푸시하면 GitHub Actions가 빌드·테스트 후 GitHub Packages에 배포합니다.

```bash
npm version patch   # package.json 갱신 + 커밋 + 태그
git push && git push --tags
```
