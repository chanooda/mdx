# `@chanooda/mdx` 패키지 분리 설계

작성일: 2026-06-24

## 목표

현재 포트폴리오의 `src/_shared/ui/mdx/` 에 있는 MDX 렌더링 컴포넌트들을 독립 npm 패키지(`@chanooda/mdx`)로 분리한다. **Next.js(RSC) 환경과 순수 React(SPA) 환경 양쪽에서 사용 가능**해야 한다.

## 배경 / 현재 구조

`src/_shared/ui/mdx/`:

| 파일 | 성격 | 환경 결합도 |
|------|------|------------|
| `callout`, `steps`, `file-tree` | 순수 프레젠테이션 컴포넌트 | 낮음 |
| `tabs` | `"use client"` 상태 컴포넌트 | 낮음 |
| `embed`: `YouTube`, `CodeSandbox`, `GitHubGist` | 정적 iframe 컴포넌트 | 낮음 |
| `embed`: `GitHubRepo`, `XPost` | **async 서버 컴포넌트** + `fetch`/`react-tweet/api` | 높음 (RSC 전용) |
| `mdx-content` | `next-mdx-remote/rsc` 의 `MDXRemote` | 매우 높음 (RSC 전용) |

소비처:
- `src/app/blog/[...slug]/page.tsx` → `MdxContent` 사용
- `src/app/projects/[slug]/page.tsx` → `next-mdx-remote/rsc` 의 `MDXRemote` 직접 사용
- `src/_entities/blog/api/getBlogApi.ts` → `node:fs` 로 콘텐츠 로딩 (패키지 범위 밖)

핵심 문제: MDX 렌더링은 **컴파일(MDX 문자열 → JS)** 과 **렌더(JS + 컴포넌트 → React 트리)** 두 단계인데, `next-mdx-remote/rsc` 가 이 둘을 RSC 서버 컴포넌트에 묶어 순수 React에서 재사용 불가.

## 확정된 설계 결정

| 결정 | 선택 | 근거 |
|------|------|------|
| React(SPA) 어댑터 렌더 모델 | **런타임 컴파일** (`@mdx-js/mdx` evaluate) | 앱이 MDX 문자열을 런타임에 받아 브라우저에서 렌더 |
| 레포 레이아웃 | **독립 패키지** (포트폴리오는 npm 소비자) | 재사용·배포 지향 |
| 스타일 | **자급자족 CSS + CSS 변수 테마링** | 소비자의 Tailwind 테마에 의존하지 않음 |
| 서버 임베드 | **프레젠테이션 View(data props) + 환경별 패처** | `/next`=next fetch, `/react`=js fetch, 동일 View 재사용 |
| 패키지 이름 | `@chanooda/mdx` | |

## 아키텍처

3계층 원칙: **공통(프레젠테이션 + 설정)은 본체, 환경 결합(렌더·패칭)은 얇은 어댑터.**

```
packages/mdx  (@chanooda/mdx)
├─ src/
│  ├─ components/            ← env-agnostic. peer: react만
│  │   ├─ callout.tsx
│  │   ├─ steps.tsx
│  │   ├─ file-tree.tsx
│  │   ├─ tabs.tsx          ("use client")
│  │   ├─ embed/
│  │   │   ├─ youtube.tsx          (정적 iframe)
│  │   │   ├─ code-sandbox.tsx     (정적 iframe)
│  │   │   ├─ github-gist.tsx      (정적 iframe)
│  │   │   ├─ github-repo-view.tsx (프레젠테이션, data props)
│  │   │   └─ x-post-view.tsx      (프레젠테이션, data props)
│  │   └─ index.ts          → presentationalComponents 맵
│  │
│  ├─ config/                ← 공유 플러그인/하이라이팅 설정
│  │   └─ mdx-plugins.ts     → remarkPlugins, rehypePlugins
│  │
│  ├─ next/                  ← RSC 어댑터. peer: next(optional)
│  │   ├─ mdx-content.tsx    (next-mdx-remote/rsc 래핑)
│  │   ├─ github-repo.tsx    (async 서버, next fetch → GitHubRepoView)
│  │   ├─ x-post.tsx         (async 서버, react-tweet/api → XPostView)
│  │   └─ index.ts           → MdxContent (next 변형 wiring)
│  │
│  ├─ react/                 ← SPA 어댑터. peer: @mdx-js/mdx(optional)
│  │   ├─ mdx-content.tsx    ("use client", evaluate 런타임 렌더)
│  │   ├─ github-repo.tsx    ("use client", js fetch → GitHubRepoView)
│  │   ├─ x-post.tsx         ("use client", fetch → XPostView)
│  │   └─ index.ts           → MdxContent (react 변형 wiring)
│  │
│  └─ styles.css             ← 자급자족 스타일 + CSS 변수
```

### 핵심 설계 포인트

1. **서버 임베드 분리**: `GitHubRepoView`/`XPostView`(순수, data props)는 `components/` 에 두고, 패칭은 `/next`(async 서버 + next revalidate fetch)와 `/react`(client + js fetch + 로딩 상태)가 각자 래핑하여 같은 View를 재사용. MDX 저자는 양쪽에서 동일하게 `<GitHubRepo repo="..." />` 사용.
2. **컴포넌트 맵 wiring은 어댑터가 담당**: 순수 컴포넌트(`Callout`/`Steps` 등)는 공유, `GitHubRepo`/`XPost` 만 어댑터별 변형으로 교체해 최종 `components` 맵 완성.
3. **플러그인 설정 공유**: `remarkGfm` + `rehypePrettyCode`(+ `@shikijs/transformers` 의 notation diff/highlight/focus/errorLevel/metaHighlight)를 `config/` 에서 한 번 정의해 양쪽 어댑터가 import.

## exports & 의존성

### package.json exports

```jsonc
{
  "name": "@chanooda/mdx",
  "type": "module",
  "exports": {
    "./components": "./dist/components/index.js",
    "./config":     "./dist/config/index.js",
    "./next":       "./dist/next/index.js",
    "./react":      "./dist/react/index.js",
    "./styles.css": "./dist/styles.css"
  }
}
```

### 의존성 분류

```jsonc
{
  "dependencies": {
    "remark-gfm": "^4",
    "rehype-pretty-code": "^0.14",
    "shiki": "^4",
    "@shikijs/transformers": "^4",
    "lucide-react": "^0.577",
    "@radix-ui/react-icons": "^1",
    "react-tweet": "^3"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "next": ">=14",
    "next-mdx-remote": ">=5",
    "@mdx-js/mdx": ">=3"
  },
  "peerDependenciesMeta": {
    "next":            { "optional": true },
    "next-mdx-remote": { "optional": true },
    "@mdx-js/mdx":     { "optional": true }
  }
}
```

결과:
- **Next 소비자**: `next` + `next-mdx-remote` 추가 설치
- **React SPA 소비자**: `@mdx-js/mdx` 추가 설치
- optional peer + 서브패스 exports → 안 쓰는 어댑터의 의존성은 설치·번들 불필요

### 소비자 사용 예시

```tsx
// Next 앱
import { MdxContent } from "@chanooda/mdx/next";
import "@chanooda/mdx/styles.css";
<MdxContent source={post.content} />

// React SPA
import { MdxContent } from "@chanooda/mdx/react";
import "@chanooda/mdx/styles.css";
<MdxContent source={mdxString} />
```

### `/react` 런타임 shiki 무게 완화

런타임 컴파일이므로 `/react` 에서는 rehype-pretty-code + shiki 가 브라우저에서 실행되어 번들이 커진다. 완화책: `/react` 에서 shiki 하이라이터를 **lazy import + 필요한 언어/테마만 로드**(`createHighlighterCore` fine-grained bundle). 정확도 유지, 초기 번들 축소.

## 스타일 디커플링

전략: 컴포넌트는 안정적인 `mdx-*` 클래스명을 쓰고, 색·간격은 CSS 변수로 노출. 단일 `styles.css` 로 자급자족.

```css
:where(:root) {
  --mdx-accent: #10b981;          /* 기본값 = 현 포트폴리오 토큰 */
  --mdx-accent-light: #34d399;
  --mdx-surface: ...;
  --mdx-border: ...;
  --mdx-text-secondary: ...;
  --mdx-text-muted: ...;
  --mdx-callout-info-border: rgb(59 130 246 / 0.4);
  /* ... */
}

.mdx-callout { margin-block: 1.5rem; border-radius: .5rem; ... }
.mdx-callout--info { border-color: var(--mdx-callout-info-border); ... }
.mdx-steps { ... }
.mdx-file-tree { color: var(--mdx-text-secondary); ... }
```

컴포넌트 변환 예:

```tsx
// before
<div className={`my-6 rounded-lg border px-4 py-3 ${s.border} ${s.bg}`}>
// after
<div className={`mdx-callout mdx-callout--${type}`}>
```

소비자 테마링:

```css
:root { --mdx-accent: #6366f1; }
```

### 스타일 결정

1. **작성 방식**: plain CSS 한 파일, `mdx-` 프리픽스(BEM 유사). 빌드 파이프라인 추가 없음.
2. **타이포그래피 경계**: 본문 타이포그래피(`prose prose-invert`, `@tailwindcss/typography`)는 `MdxContent` **바깥**(소비자 `<article>`)이 담당 → 소비자 책임으로 잔류. 패키지는 커스텀 컴포넌트(callout/steps/embed 등)만 스타일 소유.
3. **`className` override**: 각 컴포넌트가 `className?` prop 을 받아 기본 클래스 뒤에 덧붙인다.

## 빌드 · 테스트

### 빌드 (tsup)

- multi-entry (`components`, `config`, `next`, `react`), ESM 출력, `.d.ts` 생성
- `react`/`react-dom`/`next`/`next-mdx-remote`/`@mdx-js/mdx` → external
- **`"use client"` 지시문 보존** (tabs, `/react` 어댑터 필수) — tsup `esbuildOptions` banner 보존
- `styles.css` 는 `dist/` 로 복사

### 테스트 (Vitest + Testing Library)

- `components/`: 순수 컴포넌트 렌더/동작 (Tabs 상호작용, Callout type별, FileTree)
- View: data props 주입 시 렌더 검증 (GitHubRepoView/XPostView)
- 어댑터: `/react` MdxContent 가 MDX 문자열을 컴포넌트로 렌더하는지 통합 검증
- 패칭: fetch mock 으로 성공/실패 폴백 검증

## 마이그레이션 (포트폴리오 → 소비자 전환)

| 단계 | 작업 |
|------|------|
| 1 | 독립 패키지 레포 생성, `src/_shared/ui/mdx/*` 코드를 패키지로 이식 + 위 구조로 재배치 |
| 2 | Tailwind 클래스 → `mdx-*` 클래스 + `styles.css` 변환 (현 토큰값을 CSS 변수 기본값으로) |
| 3 | 서버 임베드를 View + `/next` 패처로 분리 |
| 4 | 빌드 + 로컬 검증 (npm link 또는 `npm pack`) |
| 5 | 포트폴리오에서 `@chanooda/mdx` 설치, `src/_shared/ui/mdx/*` 삭제 |
| 6 | `blog/[...slug]/page.tsx` import → `@chanooda/mdx/next` 로 교체 |
| 7 | `projects/[slug]/page.tsx` 의 직접 `MDXRemote` 사용도 `MdxContent` 로 통일 |
| 8 | `styles.css` import, 빌드/렌더 확인 |

## 범위에서 제외 (YAGNI)

- `getBlogApi` 의 `node:fs` 콘텐츠 로딩 → 앱에 잔류 (패키지化 X)
- npm 레지스트리 실제 publish → 별도 작업으로 분리. 이번 설계는 **패키지 완성 + 로컬 소비**까지.

## 성공 기준

- `@chanooda/mdx/next` 로 포트폴리오 blog/projects 페이지가 기존과 동일하게 렌더된다.
- `@chanooda/mdx/react` 가 MDX 문자열을 받아 순수 React 환경에서 동일 컴포넌트로 렌더된다.
- React SPA 소비자가 `next`/`next-mdx-remote` 설치 없이 빌드된다 (그 반대도 동일).
- `styles.css` import + CSS 변수만으로 테마가 적용/오버라이드된다.
- 포트폴리오에서 `src/_shared/ui/mdx/*` 가 제거되고 패키지로 대체된다.
