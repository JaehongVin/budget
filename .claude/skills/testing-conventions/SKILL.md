---
name: testing-conventions
description: Vitest 단위·컴포넌트 테스트와 Playwright e2e 의 역할 분담, 무엇을 테스트하고 무엇을 하지 않는지, Testing Library 쿼리 우선순위, Query·zustand 가 얽힌 컴포넌트 테스트 방법. 테스트를 쓰거나 리뷰할 때 사용.
---

### 도구별 역할

| 도구 | 대상 | 위치 |
|---|---|---|
| Vitest | 순수 함수, 훅, 컴포넌트 단위 | 대상 파일 옆 `*.test.ts(x)` |
| Playwright | 사용자 시나리오, 실제 브라우저 동작 | `e2e/*.spec.ts` |

```bash
pnpm test            # vitest run
pnpm test:watch      # 개발 중
pnpm test:coverage
pnpm e2e             # Playwright (dev 서버 자동 기동·재사용)
pnpm e2e --project=mobile
```

### 무엇을 테스트하는가

**반드시 테스트한다**

- 금액 계산·집계·통화 포맷 — 이 앱에서 틀리면 가장 아픈 부분이다
- 날짜·기간 경계 (월말, 월 넘어가는 거래, 타임존)
- 조건 분기가 있는 순수 함수
- 사용자가 실제로 밟는 핵심 동선 (e2e 로)

**테스트하지 않는다**

- 라이브러리 동작 (zustand 가 상태를 저장하는지, Query 가 캐시하는지)
- 단순 렌더링만 하는 프레젠테이션 컴포넌트
- 스타일·클래스명
- 커버리지 숫자를 채우기 위한 테스트

> 테스트는 **동작**에 붙인다. 구현 세부(내부 state 이름, 클래스명, 호출 횟수)에 붙은 테스트는 리팩토링을 막는 부채다.

### Testing Library 쿼리 우선순위

접근성 트리로 찾는 것을 우선한다. 사용자가 화면을 인식하는 방식과 같기 때문이고, 덤으로 a11y 회귀도 잡힌다.

```
getByRole > getByLabelText > getByPlaceholderText > getByText > getByTestId
```

`getByTestId` 는 위 방법이 전부 불가능할 때의 마지막 수단이다.

```tsx
//* ✅
screen.getByRole('button', { name: '거래 추가' });
screen.getByLabelText('금액');

//* ❌
container.querySelector('.submit-btn');
```

비동기는 `findBy*` 또는 `waitFor` 를 쓴다. 임의의 `setTimeout` 대기는 쓰지 않는다.

### 컴포넌트 테스트 셋업

`src/test/setup.ts` 가 jest-dom 매처와 `afterEach(cleanup)` 을 걸어 둔다. 테스트 파일에서 다시 설정하지 않는다.

globals 는 꺼져 있다. `describe`·`it`·`expect` 를 **명시적으로 import** 한다.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
```

#### TanStack Query 가 붙은 컴포넌트

테스트마다 **새 QueryClient** 를 만든다. 재사용하면 이전 테스트 캐시가 새어 들어온다. 재시도는 꺼야 실패가 즉시 드러난다.

```tsx
const renderWithQuery = (ui: ReactNode) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
};
```

#### zustand 스토어가 붙은 컴포넌트

스토어는 모듈 전역이라 테스트 간에 상태가 남는다. `beforeEach` 에서 초기화한다.

```tsx
beforeEach(() => {
  useFilterStore.getState().reset();
});
```

이래서 스토어에 `reset` 액션을 두는 것이다.

### 테스트 작성 형태

- 테스트 이름은 **한국어로 동작을 서술**한다: `it('지출은 음수로 합산한다')`
- Arrange–Act–Assert 를 빈 줄로 구분한다
- 한 `it` 에 하나의 동작만 검증한다
- 사용자 입력은 `fireEvent` 대신 `userEvent` 를 쓴다 (실제 이벤트 시퀀스를 재현한다)

```tsx
it('금액을 입력하면 원 단위로 포맷한다', async () => {
  const user = userEvent.setup();
  render(<AmountInput />);

  await user.type(screen.getByLabelText('금액'), '12000');

  expect(screen.getByLabelText('금액')).toHaveValue('12,000');
});
```

### e2e

- `e2e/` 아래 `*.spec.ts`. Vitest 수집 대상에서 제외돼 있다
- 프로젝트는 `mobile`(Pixel 7)과 `desktop`(Desktop Chrome) 두 개. **모바일이 기본**이다
- `channel: 'chrome'` 으로 시스템 Google Chrome 을 쓰므로 **WebKit 기기 서술자(iPhone 등)는 쓰지 않는다.** `devices['iPhone 15']` 는 `defaultBrowserType: 'webkit'` 이라 조합이 어긋난다
- `webServer` 설정이 dev 서버를 자동으로 띄우고, 이미 떠 있으면 재사용한다
- 시나리오 단위로 쓴다. 단위 테스트로 커버되는 것을 e2e 로 다시 확인하지 않는다 (느리고 불안정하다)
- 로케이터도 `getByRole` 우선
