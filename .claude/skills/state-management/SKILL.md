---
name: state-management
description: zustand 와 TanStack Query 의 역할 경계, queryKey 설계, queryOptions 패턴, zustand 스토어 작성·selector 구독·persist 규칙. 상태를 어디에 둘지 결정하거나 데이터 페칭 코드를 쓸 때 사용.
---

### 역할 경계 — 가장 중요한 규칙

| 상태 종류 | 담당 | 예시 |
|---|---|---|
| 서버(또는 저장소)가 진실 원천인 데이터 | **TanStack Query** | 거래 내역, 예산, 카테고리 |
| 클라이언트만 아는 UI 상태 | **zustand** | 선택된 월, 필터 조건, 시트 열림 여부 |
| 한 컴포넌트 안에서만 쓰는 상태 | `useState` | 인풋 값, 토글 |

> ⚠️ **서버 데이터를 zustand 에 복사해 두지 마라.** 진실 원천이 둘이 되는 순간 동기화 버그가 시작된다. 데이터가 필요하면 어디서든 같은 queryKey 로 `useQuery` 를 부른다. 캐시가 알아서 공유한다.

zustand 에는 "무엇을 보여줄지"만 담는다. 예: `selectedMonth` 는 zustand, 그 달의 거래 목록은 Query.

> 이 앱에서 **선택된 월·날짜·종류 필터는 URL search params** 가 진실 원천이다 (`/calendar?month=&date=`, `/history?month=&type=`, `app/searchSchemas.ts` 의 zod 스키마로 검증). 뒤로가기·새로고침·공유가 되고 zustand 와 중복되지 않는다. 잘못된 값은 버려져 `undefined` 가 되며, 기본값(이번 달·오늘·`all`)은 각 화면이 채운다. 새 zustand 스토어를 만들기 전에 URL 로 풀 수 있는지 먼저 본다.

### TanStack Query

#### queryOptions 로 정의를 한곳에 모은다

현재 쿼리는 `src/queries/transactionQueries.ts` 의 `transactionsQuery()` 하나다. 거래 전체(이번 달 + 비교용 지난달)를 목 데이터로 돌려주고, 월·종류 필터와 집계는 화면에서 `src/lib/transactions.ts` 로 한다. queryFn 이 오늘 날짜를 쓰므로 queryKey 에 오늘(`YYYY-MM-DD`)이 들어간다. 아래는 월 단위로 나눌 때의 일반 패턴이다.

```typescript
//* src/queries/transactionQueries.ts
import { queryOptions } from '@tanstack/react-query';

export const transactionKeys = {
  all: ['transactions'] as const,
  byMonth: (month: string) => [...transactionKeys.all, 'month', month] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
};

export const transactionsByMonthQuery = (month: string) =>
  queryOptions({
    queryKey: transactionKeys.byMonth(month),
    queryFn: () => fetchTransactionsByMonth(month),
  });
```

```tsx
const { data } = useQuery(transactionsByMonthQuery(month));
```

queryKey 를 컴포넌트에 인라인으로 쓰지 마라. 무효화할 때 키가 어긋난다.

#### queryKey 규칙

- 팩토리 객체(`transactionKeys`)로 한곳에서 관리한다
- 계층 구조로 만들어 `queryClient.invalidateQueries({ queryKey: transactionKeys.all })` 로 묶어서 무효화할 수 있게 한다
- queryFn 이 참조하는 모든 변수는 queryKey 에 들어가야 한다

#### mutation

```typescript
const queryClient = useQueryClient();
const { mutate } = useMutation({
  mutationFn: createTransaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  },
});
```

- 성공 후 무효화가 기본. 낙관적 업데이트는 **체감 지연이 실제로 문제일 때만** 넣는다 (YAGNI). 넣는다면 `onError` 롤백을 반드시 함께 쓴다
- 기본값(`staleTime` 60초, `retry` 1)은 `src/app/providers.tsx` 의 QueryClient 에 있다. 개별 쿼리에서 필요하면 덮어쓴다

### zustand

#### 스토어 작성

```typescript
//* src/stores/filterStore.ts
import { create } from 'zustand';

interface FilterState {
  month: string;
  type: TransactionType | 'all';
  setMonth: (month: string) => void;
  setType: (type: TransactionType | 'all') => void;
  reset: () => void;
}

const INITIAL_FILTER = {
  month: getCurrentMonth(),
  type: 'all',
} as const;

export const useFilterStore = create<FilterState>()((set) => ({
  ...INITIAL_FILTER,
  setMonth: (month) => set({ month }),
  setType: (type) => set({ type }),
  reset: () => set(INITIAL_FILTER),
}));
```

- 액션은 스토어 안에 둔다. 컴포넌트에서 `setState` 를 직접 호출하지 않는다
- 상태와 액션을 한 인터페이스에 둔다. 슬라이스 분리는 스토어가 실제로 커진 뒤에 한다
- `reset` 액션을 둔다. 테스트에서 스토어를 초기화하는 데 쓴다

#### 구독은 반드시 selector 로

```tsx
//* ✅ 필요한 값만 구독 — 다른 값이 바뀌어도 리렌더 안 됨
const month = useFilterStore((state) => state.month);
const setMonth = useFilterStore((state) => state.setMonth);

//* ❌ 스토어 전체 구독 — 무엇이 바뀌든 리렌더
const { month, setMonth } = useFilterStore();
```

객체를 새로 만들어 반환하는 selector 는 매번 새 참조라 무한 리렌더를 만든다. 여러 값이 필요하면 **selector 를 여러 개 쓰거나** `useShallow` 를 쓴다.

```tsx
import { useShallow } from 'zustand/react/shallow';

const { month, type } = useFilterStore(
  useShallow((state) => ({ month: state.month, type: state.type })),
);
```

#### persist

PWA 라 로컬 유지가 필요한 상태가 있다. 그때만 `persist` 미들웨어를 쓴다.

```typescript
import { persist } from 'zustand/middleware';

export const useSettingsStore = create<SettingsState>()(
  persist((set) => ({ ... }), { name: 'budget-settings', version: 1 }),
);
```

- `name` 은 앱 전체에서 유일해야 한다
- 저장 구조를 바꿀 때는 `version` 을 올리고 `migrate` 를 쓴다. 안 그러면 기존 사용자의 localStorage 가 깨진 상태로 복원된다
- 서버 데이터를 persist 하지 마라. 그건 Query 의 영역이다
