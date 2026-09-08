---
name: typescript-conventions
description: Arrow Function 강제, 타입 추론 우선, 객체 타입은 interface(type을 쓸 조건), 상수는 as const + typeof 타입 추출, TypeScript 7 주의사항. .ts/.tsx 코드를 작성하거나 리뷰할 때 사용.
---

CLAUDE.md의 TypeScript 규칙에 대한 상세 예시와 판단 기준이다.

### 함수 선언 — Arrow Function

> ⚠️ 특별한 이유가 없으면 항상 **Arrow Function**

```tsx
//* ✅ 권장
const handleClick = () => { ... };
const formatAmount = (amount: number) => { ... };
export const TransactionRow = () => { ... };

//* ❌ 지양
function handleClick() { ... }
export default function TransactionRow() { ... }
```

컴포넌트는 **named export** 를 쓴다. 이 프로젝트에는 default export 를 요구하는 프레임워크 규약이 없다. 예외는 `React.lazy` 로 코드 스플리팅하는 라우트 모듈 정도다.

### 타입 추론 우선

> ⚠️ TypeScript가 추론할 수 있는 타입은 **명시하지 않는다**

```tsx
//* ✅ 권장 - 추론에 맡기기
const count = 0;
const { data } = useQuery(transactionsQuery());
const handleClick = () => { ... };

//* ❌ 지양 - 불필요한 타입 명시
const count: number = 0;
const handleClick: () => void = () => { ... };
```

**타입을 명시해야 하는 경우**

- 함수 파라미터 (추론 불가)
- 빈 배열·객체 초기화: `const items: Transaction[] = []`
- 타입 단언이 필요한 경우
- 외부에 노출되는 API (export 된 함수의 반환 타입 등)

### 객체 타입은 interface

`interface` 는 flat 객체 타입을 만들고 캐싱되어 타입 체크 성능이 좋다. `type &`(intersection)은 매번 지연 병합되어 상대적으로 느리다.

```tsx
//* ✅ 권장
interface TransactionRowProps {
  transaction: Transaction;
  onSelect: (id: string) => void;
}

//* ✅ 확장은 extends
interface RecurringTransaction extends Transaction {
  intervalDays: number;
}

//* ✅ React 19 - ref 는 props 로 선언한다 (forwardRef 불필요)
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
}

//* ❌ 지양 - 객체 shape 에 type
type TransactionRowProps = {
  transaction: Transaction;
};
```

**`type` 을 사용해야 하는 경우**

- 유니온 타입: `type TransactionType = 'income' | 'expense'`
- 유틸리티·조건부 타입 조합: `type Keys = keyof typeof obj`
- `as const` 객체에서 타입 추출
- 리터럴 제약

### 상수 정의

- **네이밍**: 대문자 스네이크 케이스 (`MAX_AMOUNT`, `STALE_TIME_MS`)
- **enum 스타일 상수**: `as const` 객체로 정의. TS `enum` 은 쓰지 않는다 (`erasableSyntaxOnly` 로 막혀 있다)
- **타입 추출**: `typeof` + 인덱스 접근

```typescript
const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

type TransactionType = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
//* 결과: 'income' | 'expense'
```

매직 넘버·매직 스트링은 상수로 뽑는다. 사용처가 한 feature 뿐이면 그 feature 폴더 안에 둔다 (`project-structure` 스킬 참고).

### any 금지

`any` 대신 `unknown` + 좁히기, 제네릭, 또는 정확한 타입을 쓴다. Biome 의 `noExplicitAny` 가 error 라 lint 에서 막힌다. 외부 라이브러리 타입이 없어 불가피한 경우에만 `//*` 주석으로 이유를 남긴다.

### import

`verbatimModuleSyntax` 가 켜져 있다. 타입만 가져올 때는 반드시 `import type` 을 쓴다.

```typescript
import type { ReactNode } from 'react';
import { useState } from 'react';
```

경로는 `@/` alias 를 쓴다. 같은 feature 안에서만 상대 경로를 허용한다.

```typescript
import { queryClient } from '@/lib/queryClient';   //* ✅ 다른 영역
import { formatAmount } from './formatAmount';      //* ✅ 같은 폴더
import { formatAmount } from '../../lib/format';    //* ❌ 상위로 올라가는 상대 경로
```

> alias 는 `tsconfig.json`(paths)와 `vite.config.ts`(resolve.alias) **양쪽에** 정의돼 있다. 하나를 바꾸면 다른 쪽도 바꿔야 한다.

### noUncheckedIndexedAccess

켜져 있다. 배열·객체 인덱스 접근 결과는 `T | undefined` 다.

```typescript
//* ❌ 타입 에러
const first = transactions[0];
first.amount;

//* ✅ 좁히기
const first = transactions[0];
if (!first) return null;
first.amount;

//* ✅ 또는 at() 과 early return
const [first] = transactions;
if (!first) return null;
```

`!` 단언으로 뭉개지 마라. `noNonNullAssertion` 은 off 지만 예외 상황에만 쓴다.

### TypeScript 7 주의

이 프로젝트는 TypeScript 7 을 쓴다.

- `baseUrl` 은 **제거됐다.** `paths` 는 tsconfig 위치 기준 상대 경로(`./src/*`)로 쓴다.
- `enum`, 파라미터 프로퍼티, 네임스페이스는 `erasableSyntaxOnly` 로 금지된다.

### 검증

```bash
pnpm typecheck   # tsc --noEmit
pnpm compile     # typecheck + lint
pnpm verify      # compile + test
```
