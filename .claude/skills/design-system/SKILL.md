---
name: design-system
description: 가계부 디자인 시스템(Figma 3:3079)의 토큰 이름과 쓰는 법, 컴포넌트 목록과 API, cva·cn 규칙, 아이콘 규칙, 토큰 추가 절차. className 을 쓰거나 UI 컴포넌트를 만들·고칠 때, Figma 디자인을 코드로 옮길 때 사용.
---

원본은 Figma `tQpYDVzxG5ZUTwuK2WnN9P` 의 노드 `3:3079` ("가계부 디자인 시스템") 이다. 코드와 Figma 가 다르면 Figma 를 다시 읽어 확인한다.

### 토큰 구조 (2-tier)

| 파일 | 내용 | 직접 써도 되나 |
|---|---|---|
| `src/styles/tokens.css` | Primitive (`--gray-50` … `--green-600`) | ❌ 컴포넌트에서 쓰지 않는다 |
| `src/styles/theme.css` | Semantic → Tailwind `@theme` | ✅ 유틸리티로만 쓴다 |

Tailwind 기본 팔레트·글자 크기·라운드는 `initial` 로 지웠다. **DS 에 없는 값은 클래스 자체가 없다.** `bg-gray-100`, `text-sm`, `rounded-lg` 는 동작하지 않는다.

### 색 (Semantic)

| 유틸리티 이름 | Figma 변수 | 값 |
|---|---|---|
| `background` | surface/background | gray50 |
| `surface` / `surface-subtle` | surface/card · surface/subtle | white / gray100 |
| `border` / `disabled` | border/default | gray200 |
| `content-primary` / `-secondary` / `-muted` / `-on-accent` | text/* | gray900 / gray600 / gray400 / white |
| `accent` / `accent-pressed` / `accent-subtle` | action/* | blue500 / blue600 / blue50 |
| `income` / `expense` | amount/* | blue600 / gray800 |
| `negative` / `negative-subtle` | feedback/* | red500 / red50 |
| `positive` / `positive-subtle` | (문서의 Feedback 항목) | green600 / green50 |

- 입금·지출은 **색만으로 구분하지 않는다.** `formatAmount(amount, { sign })` 로 +/− 기호를 함께 쓴다
- 지출 기호는 하이픈(`-`)이 아니라 마이너스 기호(`−`, U+2212)다

### 간격 · 라운드 · 글자

- **간격**: `--spacing` 이 1px 라서 숫자가 곧 px 이다. `p-16` = 16px, `gap-12` = 12px, `h-52` = 52px. Figma 수치를 그대로 쓴다
- **라운드**: `rounded-3` `-6` `-8` `-12` `-14` `-16` `-18` `-20`, Pill 은 `rounded-full`
- **글자**: `text-8` `10` `11` `12` `13` `14` `15` `16` `18` `19` `20` `24` `28` `32`. 행간 1.45·자간 −0.3px 가 크기에 포함돼 있다. 굵기는 `font-medium`(500) / `font-bold`(700) 두 가지만 쓴다
- **폰트**: Noto Sans KR (`@fontsource-variable/noto-sans-kr`, 직접 호스팅)

### 컴포넌트

아토믹 분류 기준은 `project-structure` 스킬. 도메인 계산은 컴포넌트 안에 두지 않고 `src/lib/` 의 순수 함수로 뺀다.

| 컴포넌트 | 위치 | Figma | API 요약 |
|---|---|---|---|
| `Icon` | atoms | (lucide 아이콘) | `icon`, `size`. 선 굵기 1.8px 고정, 색은 currentColor |
| `Button` | atoms | DS/Button | `variant: primary \| secondary`. pressed 는 `:active`, disabled 는 `disabled` 속성 |
| `Chip` | atoms | DS/Filter chip | `selected`, `disabled` |
| `ProgressBar` | atoms | Progress track/fill | `value`(0~100), `label` |
| `FilterChipGroup` | molecules | Filter chip 묶음 | `options`, `value`, `onValueChange`. Radix ToggleGroup(`radiogroup`). 선택 해제 불가 |
| `TransactionRow` | molecules | DS/Transaction row | `type`, `title`, `description`, `amount`, `icon` |
| `CalendarDay` | molecules | DS/Calendar day | `day`, `income`, `expense`, `selected`, `today`, `outsideMonth`, `onSelect`. 다른 달 날짜도 누를 수 있고, 누르면 **그 달로 이동**한다. 이동은 호출하는 쪽(캘린더 그리드)이 `onSelect` 에서 처리한다 |
| `BudgetFeedback` | molecules | DS/Budget feedback | `message`. `role="status"` |
| `BudgetProgressCard` | organisms | DS/Budget progress card | `title`, `spent`, `limit`. 사용률·남은 금액·초과 여부는 `getBudgetUsage` 로 파생. **예산보다 1원이라도 많이 쓴 경우에만** 초과로 보고 `BudgetFeedback` 을 함께 띄운다. 딱 맞게 쓴 100% 는 초과가 아니다 |
| `BottomNav` | organisms | DS/Bottom navigation | props 없음. 탭 3개(`/`, `/calendar`, `/history`) 고정이고 TanStack Router `Link` 다. 현재 경로의 탭에 `aria-current="page"` (`exact`, 쿼리스트링 무시). 렌더하려면 라우터가 필요하다 (`renderRoute`) |
| `ScreenHeader` | molecules | App header | `title`(h1), `icon`, `iconLabel`(aria-label), `onIconClick?`. H66 · 좌우 24. 아이콘 버튼은 터치 타깃 44 |
| `MonthNavigator` | molecules | Month controls | `monthKey`(`YYYY-MM`), `onMonthChange`, `children`(오른쪽 슬롯). 이전/다음 달 버튼(aria-label `이전 달`·`다음 달`)이 `shiftMonth` 로 월 키를 만들어 넘긴다 |
| `IncomeExpenseSummary` | molecules | Monthly totals | `income`, `expense`. 총 입금(파랑 19/700) \| 구분선 \| 총 지출. 홈 카드·캘린더·내역이 같은 수치라 공통이다 |
| `AppShell` | templates | (화면 골격) | `children`. `<main>` + 하단 sticky `BottomNav`, 폭 `max-w-390` |

- 금액 props 는 전부 **원 단위 0 이상 정수**다. 방향(입금/지출)은 `type`·`sign` 으로 넘긴다. 남은 돈처럼 음수가 될 수 있는 값은 `formatBalance` 로 포맷한다 (`−292,500원`, 마이너스 기호 U+2212)
- 캘린더 요일 머리의 일요일 빨강·토요일 파랑은 새 토큰 없이 `text-negative`·`text-income` 이다 (Figma 가 feedback/negative, action/pressed 를 쓴다)
- 카테고리 아이콘은 `getCategoryIcon(category)` (`src/lib/categoryIcon.ts`)로 얻어 `TransactionRow` 의 `icon` 에 넘긴다
- Figma 의 Home indicator 막대(Bottom nav 아래)는 OS 가 그리는 요소라 구현하지 않는다. `env(safe-area-inset-bottom)` 여백으로 대신한다
- 예산 카드의 "초과" 상태 디자인은 Figma 에 없다. 지금은 경고 컴포넌트를 함께 띄우기만 한다

### cva · cn 규칙

- variant 는 `cva` 로 정의하고, 최종 className 은 **반드시 `cn()` 으로 감싼다.** variant 가 기본 클래스의 색·굵기를 덮어쓸 때 `cn` 이 없으면 두 클래스가 다 붙고, 어느 쪽이 이길지 CSS 생성 순서로 정해진다 (실제로 `CalendarDay` 의 오늘+선택 상태에서 났던 버그)
- 외부에서 `className` 을 받는 컴포넌트는 `cn(variants(...), className)` 순서로 합친다
- `cn` 은 `src/lib/cn.ts` 에 있고, 커스텀 글자 크기·라운드 토큰을 tailwind-merge 에 등록해 둔다. **`theme.css` 에 글자 크기나 라운드 토큰을 추가하면 `cn.ts` 의 목록에도 추가한다.** 안 하면 `text-15` 와 `text-content-primary` 처럼 크기와 색이 같은 종류로 취급돼 하나가 지워진다

### 아이콘

- Figma 아이콘은 lucide 다. `lucide-react` 의 같은 이름 아이콘을 `Icon` atom 으로 감싸 쓴다 (`<Icon icon={Plus} size={18} />`)
- 크기는 Figma 수치(18·20·23·28)를 `size` 로 넘긴다. CSS 로 크기를 바꾸면 선 굵기 보정이 깨진다
- 장식용이라 기본으로 `aria-hidden` 이다. 아이콘만 있는 버튼은 버튼에 `aria-label` 을 준다

### 토큰·컴포넌트를 추가할 때

1. Figma 에서 `get_variable_defs` / `get_design_context` 로 실제 값을 확인한다 (Figma MCP, `CLAUDE.md` 의 MCP 항목)
2. Primitive 는 `tokens.css`, Semantic 은 `theme.css` 에 추가한다. 컴포넌트 전용 토큰(`button-primary-bg` 같은 3번째 층)은 만들지 않는다
3. 이 문서의 표를 갱신한다

### 확인

DS 미리보기 화면은 실제 화면으로 대체돼 없다. 컴포넌트를 바꿨으면 `pnpm dev` 로 화면에 띄워 390px 폭에서 Figma 와 비교한다.
