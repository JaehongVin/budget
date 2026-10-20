---
name: project-structure
description: 새 컴포넌트·훅·스토어·타입·로직 파일을 어디에 둘지 결정하는 규칙. 아토믹 디자인(atoms/molecules/organisms) 분류 기준, 도메인 로직을 lib 로 빼는 기준, 파일 네이밍. 새 파일을 만들거나 옮길 때 사용.
---

### 전체 구조

```
src/
├── app/              # 앱 전역 (App.tsx, providers.tsx)
├── components/       # UI 전부. 아토믹 디자인
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── lib/              # 순수 로직 (포맷, 계산, cn)
├── styles/           # 디자인 토큰 (tokens.css, theme.css)
├── types/            # 앱 전역 타입
└── test/             # 테스트 셋업
e2e/                  # Playwright 스펙
```

아래 폴더는 **처음 필요해질 때** 만든다. 빈 폴더를 미리 만들지 않는다.

| 폴더 | 언제 |
|---|---|
| `components/templates/` | 화면 골격(헤더 + 본문 + 하단 탭 배치)이 두 화면 이상에서 반복될 때 |
| `pages/` | 라우터를 붙여 실제 화면을 만들 때. 데이터를 받아 template·organism 에 넘긴다 |
| `hooks/` | 커스텀 훅 |
| `stores/` | zustand 스토어 |
| `queries/` | TanStack Query 의 queryKey 팩토리·queryOptions·mutation (`state-management` 스킬) |

### 아토믹 분류 기준

컴포넌트는 **크기와 조합 단계**로 나눈다. 가계부 도메인을 아는 컴포넌트(TransactionRow 등)도 같은 기준으로 분류한다.

| 단계 | 기준 | 예 |
|---|---|---|
| atoms | 다른 컴포넌트를 쓰지 않는 최소 단위. 더 쪼개면 의미가 없다 | `Button`, `Chip`, `ProgressBar`, `Icon` |
| molecules | atom 몇 개가 모여 **한 가지 일**을 한다 | `FilterChipGroup`, `TransactionRow`, `CalendarDay`, `BudgetFeedback` |
| organisms | molecule·atom 이 모여 **화면에서 독립된 한 구역**이 된다 | `BudgetProgressCard`, `BottomNav` |
| templates | 화면 골격. 데이터 없이 배치만 | (아직 없음) |
| pages | template 에 실제 데이터를 채운 화면 | (아직 없음) |

헷갈리면 이 순서로 판단한다.

1. 다른 컴포넌트를 import 하는가? 아니면 **atom**
2. 화면에서 따로 떼어 놓아도 하나의 구역으로 의미가 있는가(카드, 내비게이션, 목록 전체)? 그러면 **organism**
3. 나머지는 **molecule**

- 상위 단계는 하위 단계만 import 한다. atom 이 molecule 을 import 하거나 molecule 이 organism 을 import 하면 분류가 잘못된 것이다
- 같은 단계끼리 import 하는 건 허용한다 (예: organism 안에 다른 organism)

### 도메인 로직은 lib 로

아토믹은 크기 기준이라 도메인 컴포넌트도 `components/` 에 들어간다. 대신 **계산은 컴포넌트 안에 두지 않는다.**

- 금액 포맷, 예산 사용률, 날짜 계산처럼 규칙이 있는 로직은 `src/lib/` 의 순수 함수로 만들고 단위 테스트를 붙인다
- 컴포넌트는 그 함수를 호출해 결과를 그리기만 한다 (예: `BudgetProgressCard` 는 `getBudgetUsage` 를 부른다)
- 앱 전역 타입·상수(`TRANSACTION_TYPE`)는 `src/types/`

### import

- 컴포넌트는 파일 경로로 직접 가져온다: `import { Button } from '@/components/atoms/Button'`
- `index.ts` 배럴은 만들지 않는다. 미사용 export 는 `pnpm knip` 이 잡는다

### 파일 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `TransactionRow.tsx` |
| 훅 | camelCase, `use` 접두 | `useTransactions.ts` |
| 스토어 | camelCase, `Store` 접미 | `filterStore.ts` |
| 그 외 모듈 | camelCase | `formatAmount.ts` |
| 테스트 | 대상 파일명 + `.test` | `formatAmount.test.ts` |
| e2e | kebab-case + `.spec` | `e2e/add-transaction.spec.ts` |

테스트는 **대상 파일 바로 옆**에 둔다. 별도 `__tests__` 폴더를 만들지 않는다.
