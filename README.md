# 가계부

수입과 지출을 기록하는 모바일 우선 PWA.

## 시작하기

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## 명령어

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 개발 서버 |
| `pnpm build` | 타입 체크 + 프로덕션 빌드 + Service Worker 생성 |
| `pnpm preview` | 빌드 결과 확인 (PWA 동작은 여기서만 확인 가능) |
| `pnpm compile` | 타입 체크 + 린트 |
| `pnpm test` | 단위 테스트 (Vitest) |
| `pnpm e2e` | E2E 테스트 (Playwright) |
| `pnpm verify` | 타입 체크 + 린트 + 테스트 |

## 기술 스택

React 19 · TypeScript 7 · Vite 8 · Tailwind CSS 4 · Zustand 5 · TanStack Query 5 · vite-plugin-pwa · Biome · Vitest · Playwright

## AI 하네스

Claude Code(총괄)와 Codex(구현)로 역할이 나뉘어 있다. 자세한 내용은 [CLAUDE.md](./CLAUDE.md)와 [AGENTS.md](./AGENTS.md) 참고.
