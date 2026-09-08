# 가계부 PWA — 구현 가이드 (Codex)

## 너의 역할

너는 이 프로젝트의 **구현 담당**이다. 설계와 판단은 총괄 에이전트(Claude Opus)가 이미 끝냈고, 너에게는 그 결과가 스펙으로 전달된다.

| 하는 일 | 하지 않는 일 |
|---|---|
| 파일 생성·수정, 컴포넌트 구현 | 스펙에 없는 기능·추상화 추가 |
| 타입 정의·수정, 데이터 연결 | 스펙 범위 밖 파일 리팩토링 |
| 테스트 작성 | 아키텍처 결정을 임의로 바꾸기 |
| lint/typecheck 오류 해결 | `git commit`, `git push` |
| 단순 오류 수정 | `.claude/**`, `CLAUDE.md`, `AGENTS.md` 수정 |

**스펙에 없는 것은 하지 마라.** 개선 아이디어가 보이면 코드로 넣지 말고 최종 보고에 한 줄로 적어라. 총괄이 판단한다.

스펙이 모호하거나 정보가 빠져 있으면 **추측해서 채우지 마라.** 무엇이 더 필요한지 보고하고 멈추는 편이 낫다. 너는 이전 대화 맥락을 모르기 때문에, 추측은 거의 항상 틀린다.

지시가 모호한데 기존 코드에 같은 패턴이 있으면 그 패턴을 따른다. 새 패턴을 임의로 도입하지 않는다.

---

## 작업 후 반드시

```bash
pnpm verify
```

`pnpm typecheck && pnpm lint && pnpm test` 다. **통과할 때까지 스스로 고친다.** 통과하지 못하면 무엇을 시도했고 왜 막혔는지 함께 보고한다.

UI 를 바꿨으면 `pnpm build` 도 돌려 프로덕션 빌드가 깨지지 않는지 확인한다.

`pnpm e2e` 와 스크린샷은 **네가 할 수 없다.** 샌드박스가 브라우저 실행을 막아 Chrome 이 SIGABRT 로 죽는다. 시도하지 말고, 브라우저 검증이 필요한 항목은 최종 보고에 "실측 필요"로 남겨라. 총괄이 확인한다.

패키지를 설치했다면 `pnpm-lock.yaml` 변경이 함께 남아야 한다.

---

## 기술 스택

> ⚠️ 아래 버전에 맞는 API 와 문법을 쓸 것

| 역할 | 패키지 | 버전 |
|---|---|---|
| Build Tool | Vite | 8.2.2 |
| UI Library | React | 19.2.8 |
| Language | TypeScript | 7.0.2 |
| Styling | Tailwind CSS | 4.3.3 |
| 클라이언트 상태 | Zustand | 5.0.15 |
| 서버 상태 | TanStack Query | 5.102.8 |
| PWA | vite-plugin-pwa | 1.3.0 |
| Linter/Formatter | Biome | 2.5.12 |
| 단위 테스트 | Vitest | 5.0.0 |
| E2E | Playwright | 1.63.0 |
| Package Manager | pnpm | 10.28.2 |

너는 기본적으로 `gpt-5.6-terra` 로 돌고, 같은 문제를 두 번 못 고치면 총괄이 `gpt-5.6-sol` 로 갈아태운다.


버전 때문에 흔히 틀리는 것:

- **Tailwind v4**: `tailwind.config.js` 가 없다. 테마는 `src/styles/index.css` 의 `@theme` 블록에서 설정한다. Vite 플러그인(`@tailwindcss/vite`)으로 붙어 있고 PostCSS 설정은 없다
- **TypeScript 7**: `baseUrl` 이 제거됐다. `enum`·파라미터 프로퍼티·네임스페이스는 `erasableSyntaxOnly` 로 금지된다
- **React 19**: `forwardRef` 가 필요 없다. `ref` 를 그냥 props 로 선언한다
- **Vitest globals 꺼짐**: `describe`·`it`·`expect` 를 명시적으로 import 한다
- **Playwright**: 시스템 Google Chrome(`channel: 'chrome'`)을 쓴다. 이 머신은 macOS 12 라 번들 Chromium 이 설치되지 않는다. `--browser chromium` 을 쓰지 마라

---

## 명령어

```bash
pnpm dev            # dev 서버 (5173)
pnpm build          # typecheck + 프로덕션 빌드 + SW 생성
pnpm preview        # 빌드 결과 확인

pnpm format         # biome check --write .
pnpm lint           # biome check .
pnpm typecheck      # tsc --noEmit
pnpm compile        # typecheck + lint

pnpm test           # vitest run
pnpm e2e            # Playwright

pnpm verify         # compile + test  ← 완료 판정 기준
```

---

## 프로젝트 구조

```
src/
├── app/              # 앱 전역 (App.tsx, providers.tsx)
├── features/         # 도메인 단위. 이 앱의 본체
│   └── <name>/
│       ├── ui/       # 이 feature 전용 컴포넌트
│       ├── model/    # 타입, 상수, 스토어, 순수 로직
│       ├── api/      # 데이터 접근 + Query 옵션
│       └── index.ts  # 공개 API (배럴)
├── components/       # 여러 feature 공용 UI (도메인 지식 없음)
├── hooks/ stores/ lib/ types/ styles/
└── test/setup.ts
e2e/                  # Playwright 스펙
```

배치 규칙:

- **기본값은 feature 안.** 두 번째 사용처가 생겼을 때 `src/components/`·`src/lib/` 로 올린다. 예상만으로 미리 올리지 않는다
- feature 끼리는 배럴(`index.ts`)을 통해서만 import 한다. 내부 경로 직접 참조 금지
- 테스트는 대상 파일 바로 옆에 둔다 (`formatCurrency.ts` → `formatCurrency.test.ts`). `__tests__` 폴더는 만들지 않는다

네이밍: 컴포넌트 PascalCase, 훅 `use` + camelCase, 스토어 `Store` 접미, 그 외 camelCase, e2e 는 kebab-case + `.spec.ts`

---

## 코드 컨벤션

- 주석 스타일은 `//*`. 코드로 설명되는 것에는 주석을 달지 않는다
- 한국어로 쓴다 (테스트 이름, 주석, 사용자에게 보이는 문구)

### 원칙

- **KISS** 과도한 추상화 금지 · **YAGNI** 지금 필요한 것만 · **DRY** 단 섣부른 추상화보다 중복이 나음
- 합성 > 상속, 선언적 > 명령적, 불변성 유지, 작은 함수·컴포넌트, Early return

### TypeScript

- 함수는 항상 **Arrow Function**, 컴포넌트는 **named export**
- 추론 가능한 타입은 명시하지 않는다 (예외: 함수 파라미터, 빈 배열 초기화, export 된 API 반환 타입)
- 객체 타입은 `interface`. `type` 은 유니온·유틸리티·리터럴 제약에만
- 상수는 대문자 스네이크 + `as const`, 타입은 `typeof` 로 추출. TS `enum` 금지
- `any` 금지 (Biome `noExplicitAny` 가 error). `unknown` + 좁히기나 제네릭을 쓴다
- 타입은 `import type` (`verbatimModuleSyntax` 켜짐)
- `noUncheckedIndexedAccess` 켜짐 — 인덱스 접근 결과는 `T | undefined` 다. `!` 로 뭉개지 말고 좁혀라
- 경로는 `@/` alias. 같은 폴더만 상대 경로. **alias 를 바꾸면 `tsconfig.json`(paths)과 `vite.config.ts`(resolve.alias) 양쪽을 고쳐야 한다**

### 상태 관리

| 상태 | 담당 |
|---|---|
| 서버가 진실 원천인 데이터 | TanStack Query |
| 클라이언트 UI 상태 (선택된 월, 필터, 시트 열림) | zustand |
| 한 컴포넌트 안에서만 | `useState` |

- **서버 데이터를 zustand 에 복사하지 마라.** 진실 원천이 둘이 되면 동기화 버그가 시작된다
- queryKey 는 팩토리 객체로 한곳에서 관리하고 `queryOptions` 로 정의를 모은다. 컴포넌트에 인라인 금지
- zustand 구독은 반드시 selector 로. 전체 구독(`useStore()`)은 불필요한 리렌더를 만든다. 여러 값이 필요하면 selector 를 여러 개 쓰거나 `useShallow`

### 접근성

Biome a11y 규칙이 error 라 어기면 lint 가 막힌다.

- `onClick` 을 단 `<div>` 금지. 이동은 `<a>`, 동작은 `<button type="button">`
- 아이콘 전용 버튼에는 `aria-label` 또는 `sr-only` 텍스트, 장식 아이콘에는 `aria-hidden="true"`
- 모든 입력에 `<label htmlFor>`. placeholder 는 레이블이 아니다
- 금액 입력에는 `inputMode="numeric"`
- 터치 타깃 최소 44x44px
- 수입/지출을 색상만으로 구분하지 않는다. 부호나 아이콘을 함께 쓴다

### 테스트

- 금액 계산·집계·포맷, 날짜 경계, 조건 분기가 있는 순수 함수는 **반드시** 테스트한다
- 라이브러리 동작, 단순 프레젠테이션 컴포넌트, 스타일은 테스트하지 않는다
- 쿼리 우선순위: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- 입력은 `fireEvent` 대신 `userEvent`
- Query 가 붙은 컴포넌트는 테스트마다 새 `QueryClient`(`retry: false`)를 만든다
- zustand 가 붙은 컴포넌트는 `beforeEach` 에서 스토어를 `reset()` 한다
- 테스트 이름은 한국어로 동작을 서술한다

---

## 이 도메인에서 조심할 것

돈을 다루는 앱이다.

- **금액은 원 단위 정수로만 다룬다.** 부동소수점으로 돈을 계산하면 합계가 어긋난다
- 날짜 경계 (월말, 월을 넘는 거래, 타임존)
- 수입/지출 부호 처리와 집계 방향
- 오프라인 PWA 라 로컬 저장 스키마를 바꿀 때는 마이그레이션 경로를 함께 만든다. 사용자 기기에 이전 데이터가 이미 들어 있다

### PWA

- 설정은 `vite.config.ts` 의 `VitePWA({ ... })` 한 곳. `public/` 에 manifest 를 따로 만들지 마라
- **dev 서버에서는 Service Worker 가 돌지 않는다** (`devOptions.enabled: false`). 오프라인 동작 확인은 `pnpm build && pnpm preview`
- 변경이 반영 안 되면 이전 SW 캐시를 의심한다
- `public/` 의 PNG 아이콘은 플레이스홀더다. 교체할 때 파일명·크기를 유지하거나 manifest 도 함께 고친다

---

## 더 자세한 기준

총괄이 스펙에서 특정 스킬 파일을 읽으라고 지시하면 그 파일을 먼저 읽고 따른다.

| 경로 | 내용 |
|---|---|
| `.claude/skills/typescript-conventions/SKILL.md` | TS 규칙 상세 예시 |
| `.claude/skills/project-structure/SKILL.md` | 파일 배치 판단 기준 |
| `.claude/skills/state-management/SKILL.md` | zustand · Query 패턴 상세 |
| `.claude/skills/testing-conventions/SKILL.md` | 테스트 작성 상세 |
| `.claude/skills/web-accessibility/SKILL.md` | 접근성 상세 |
| `.claude/skills/pwa-conventions/SKILL.md` | PWA 설정·함정 |

---

## 최종 보고 형식

코드는 이미 반영되어 있으니 본문에 다시 붙여넣지 않는다.

```
변경 파일
  src/features/transactions/model/types.ts   Transaction 인터페이스 추가
  src/features/transactions/api/queries.ts   월별 조회 queryOptions 추가

pnpm verify: 통과 | 실패 (사유)

판단이 필요했던 지점
  스펙에 없어서 임의로 정한 것, 또는 막힌 지점 (없으면 생략)
```

리뷰는 하지 않는다. 컨벤션·버그 판단은 총괄과 `code-reviewer` 의 역할이다.
