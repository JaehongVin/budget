# 가계부

오프라인에서도 입력할 수 있는 설치형 가계부 PWA.

## 요구 사항

- Node.js 24 (`.nvmrc`)
- pnpm 12 (`packageManager` 필드로 고정, corepack 이 자동으로 맞춘다)
- e2e 실행 시 Google Chrome

## 시작하기

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## 명령어

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 타입 체크 + 프로덕션 빌드 (Service Worker 생성) |
| `pnpm preview` | 빌드 결과 확인. PWA·오프라인 동작은 여기서 확인 |
| `pnpm format` | Biome 포맷 + 자동 수정 |
| `pnpm lint` | Biome 린트 |
| `pnpm typecheck` | TypeScript 타입 체크 |
| `pnpm test` | Vitest 단위·컴포넌트 테스트 |
| `pnpm e2e` | Playwright e2e (빌드 후 4173 포트에서 실행) |
| `pnpm knip` | 미사용 파일·export·의존성 검사 |
| `pnpm verify` | typecheck + lint + test + knip. 작업 완료 기준 |

커밋 시 husky + lint-staged 가 staged 파일에 Biome 을 적용한다. CI 는 `pnpm verify`·`pnpm build`·`pnpm e2e` 를 돌린다.

## 기술 스택

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Zustand 5 · TanStack Query 5 · TanStack Router 1 · zod 4 · vite-plugin-pwa 2 · Biome 2 · Vitest 5 · Playwright 1 · knip 6

UI: class-variance-authority · Radix (ToggleGroup) · lucide-react · Noto Sans KR

## 디자인 시스템

Figma 의 "가계부 디자인 시스템" 을 옮긴 것이다. 토큰은 `src/styles/`, 컴포넌트는 `src/components/` (아토믹 디자인). Tailwind 기본 팔레트 대신 DS 토큰만 쓰고, 간격은 Figma 수치 그대로(`p-16` = 16px)다. 화면은 홈(`/`)·캘린더(`/calendar`)·내역(`/history`) 세 개이고, 지금 데이터는 오늘 날짜 기준으로 만든 목 데이터다.

## 구조

```
src/
├── app/          # 앱 전역 (App, providers, router)
├── components/   # atoms / molecules / organisms / templates
├── pages/        # 라우트 화면
├── queries/      # TanStack Query
├── mocks/        # 목 데이터
├── lib/          # 순수 로직 (금액 포맷, 날짜, 집계, 예산 계산)
├── styles/       # 디자인 토큰
├── types/
├── test/         # 테스트 셋업, 라우터 렌더 헬퍼
└── main.tsx
e2e/            # Playwright 스펙
public/         # PWA 아이콘, favicon
```

## AI 하네스

규칙의 진실의 원천은 `CLAUDE.md` 와 `.claude/skills/` 다. Codex 는 심볼릭 링크(`AGENTS.md`, `.agents/skills`)로 같은 파일을 읽는다. 세부 버전·컨벤션은 `CLAUDE.md` 를 본다.
