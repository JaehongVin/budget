---
name: project-structure
description: 새 컴포넌트·훅·스토어·타입 파일을 어디에 둘지 결정하는 규칙. feature 단위 배치, feature 내부 구조(ui/model/api), 앱 공용으로 올리는 기준. 새 파일을 만들거나 옮길 때 사용.
---

> 관련된 코드는 사용하는 곳 가까이에 둔다. 도메인이 폴더 경계를 만든다.

### 전체 구조

```
src/
├── app/              # 앱 전역 (App.tsx, providers.tsx, 라우터)
├── features/         # 도메인 단위. 이 앱의 본체
│   └── transactions/
│       ├── ui/       # 이 feature 전용 컴포넌트
│       ├── model/    # 타입, 상수, 스토어, 순수 도메인 로직
│       ├── api/      # 데이터 접근 + TanStack Query 옵션
│       └── index.ts  # 이 feature 의 공개 API (배럴)
├── components/       # 여러 feature 가 함께 쓰는 UI (Button, Sheet 등)
├── hooks/            # 여러 feature 가 함께 쓰는 훅
├── stores/           # 여러 feature 가 공유하는 전역 zustand 스토어
├── lib/              # 순수 유틸, 외부 클라이언트 설정 (queryClient 등)
├── types/            # 앱 전역 공용 타입
├── styles/           # 전역 CSS
└── test/             # 테스트 셋업
e2e/                  # Playwright 스펙
```

### 배치 결정 규칙

**아래 순서대로 판단하고, 조건을 만족하는 첫 위치에 둔다.**

| 사용 범위 | 위치 | 예시 |
|---|---|---|
| 한 feature 안에서만 사용 | `features/<name>/ui|model|api/` | `features/transactions/ui/TransactionRow.tsx` |
| 여러 feature 가 공유 (UI) | `src/components/` | `components/AmountInput.tsx` |
| 여러 feature 가 공유 (로직) | `src/hooks/`, `src/lib/`, `src/stores/` | `lib/formatCurrency.ts` |

핵심 원칙:

- **기본값은 feature 안.** 두 번째 사용처가 생겼을 때 위로 올린다
- 재사용될 것 같다는 예상만으로 미리 올리지 않는다 (YAGNI)
- `src/components/` 로 올라간 컴포넌트에는 **도메인 지식이 없어야 한다.** `TransactionRow` 는 올라가지 않고 `AmountInput` 은 올라간다

### feature 간 의존

feature 는 서로의 내부를 직접 import 하지 않는다. 반드시 배럴(`index.ts`)을 통한다.

```typescript
//* ✅ 공개 API 를 통해
import { useTransactions } from '@/features/transactions';

//* ❌ 내부 구현을 직접
import { useTransactions } from '@/features/transactions/api/useTransactions';
```

feature A 와 B 가 서로를 참조하기 시작하면 그건 **경계가 잘못 그어졌다는 신호**다. 공통 부분을 `src/lib/` 이나 별도 feature 로 빼거나, 두 feature 를 하나로 합친다. 상호 참조를 그대로 두지 마라.

### 파일 네이밍

| 종류 | 규칙 | 예시 |
|---|---|---|
| 컴포넌트 | PascalCase | `TransactionRow.tsx` |
| 훅 | camelCase, `use` 접두 | `useTransactions.ts` |
| 스토어 | camelCase, `Store` 접미 | `filterStore.ts` |
| 그 외 모듈 | camelCase | `formatCurrency.ts` |
| 테스트 | 대상 파일명 + `.test` | `formatCurrency.test.ts` |
| e2e | kebab-case + `.spec` | `e2e/add-transaction.spec.ts` |

테스트는 **대상 파일 바로 옆**에 둔다. 별도 `__tests__` 폴더를 만들지 않는다.

### 배럴 파일

배럴은 **feature 루트 하나만** 만든다. `ui/index.ts`, `model/index.ts` 처럼 층마다 만들면 순환 참조와 번들 비대화의 원인이 된다.
