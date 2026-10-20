---
name: web-accessibility
description: 시맨틱 태그 선택 기준, 아이콘 버튼·링크의 sr-only/aria-label 패턴, 폼 레이블 연결, 키보드·포커스·색상 대비, 모바일 터치 타깃 규칙. JSX 마크업을 작성하거나 인터랙티브 UI를 만들 때 사용.
---

### 시맨틱 태그

`<div>` 대신 의미에 맞는 태그를 쓴다. 페이지당 `<main>` 은 하나.

| 태그 | 용도 |
|---|---|
| `<header>` | 화면 머리말, 월 선택·잔액 요약 영역 |
| `<nav>` | 하단 탭바, 네비게이션 링크 묶음 |
| `<main>` | 화면 주 콘텐츠 (1개) |
| `<section>` | 제목을 가진 논리적 구획 |
| `<article>` | 독립적으로 의미가 성립하는 콘텐츠 (거래 카드 등) |
| `<aside>` | 보조 콘텐츠 |

- 목록은 `<ul>`/`<li>` 로 감싼다. 거래 내역·카테고리 목록이 여기 해당한다
- 클릭 가능한 요소는 이동이면 `<a>`, 동작이면 `<button type="button">`. `onClick` 을 단 `<div>` 는 금지 (Biome a11y 가 잡는다)
- 금액 증감 같은 실시간 갱신 영역은 `aria-live="polite"` 를 고려한다

### 아이콘 전용 버튼

시각적 텍스트가 없는 요소에는 **접근 가능한 이름을 반드시 제공**하고, 장식용 SVG 는 접근성 트리에서 제외한다.

```tsx
//* 패턴 A - aria-label
<button type="button" aria-label="거래 추가">
  <PlusIcon aria-hidden="true" />
</button>

//* 패턴 B - sr-only 텍스트
<button type="button">
  <span className="sr-only">필터 열기</span>
  <FilterIcon aria-hidden="true" />
</button>
```

- 의미 없는 장식 요소: `aria-hidden="true"` (구분자, spacer, 아이콘)
- 의미 있는 이미지: `alt` 를 채우고, 장식이면 `alt=""`
- `target="_blank"` 에는 항상 `rel="noopener noreferrer"`

### 폼

가계부는 입력이 본체다. 여기서 접근성이 가장 자주 깨진다.

- 모든 입력 필드는 `<label htmlFor>` 로 연결한다. 시각적 레이블이 없으면 `sr-only` 레이블을 쓴다. placeholder 는 레이블이 **아니다**
- 금액 입력은 `inputMode="numeric"` 을 준다. 모바일에서 숫자 키패드가 뜬다
- 에러 메시지는 `aria-describedby` 로 입력과 연결하고 `aria-invalid` 를 함께 준다

```tsx
<label htmlFor="amount">금액</label>
<input
  id="amount"
  inputMode="numeric"
  aria-invalid={!!error}
  aria-describedby={error ? 'amount-error' : undefined}
/>
{error && <p id="amount-error" role="alert">{error}</p>}
```

### 모바일 터치

- 터치 타깃은 **최소 44x44px**. 아이콘이 작으면 패딩으로 히트 영역을 키운다
- 화면 높이는 `min-h-dvh` 를 쓴다. `100vh` 는 모바일 주소창 때문에 넘친다
- 하단 고정 요소(`position: fixed`)에는 `env(safe-area-inset-bottom)` 여백을 자기 자신에게 준다. iOS 홈 인디케이터에 가려진다
- hover 에만 반응하는 UI 는 만들지 않는다. 터치 기기에는 hover 가 없다

### 키보드 · 포커스

- 모든 인터랙티브 요소는 Tab 으로 도달 가능해야 한다. `tabIndex={-1}` 로 흐름에서 빼지 않는다
- 포커스 링을 `outline-none` 으로 지울 경우 **반드시 대체 표시를 제공**한다

```tsx
//* ❌ 포커스 표시가 사라짐
className="outline-none"

//* ✅ 대체 표시 제공
className="outline-none focus-visible:outline-2 focus-visible:outline-accent"
```

- 모달·바텀시트를 직접 만들면 포커스 트랩, ESC 닫기, 열기 전 포커스 복원을 직접 구현해야 한다. 네이티브 `<dialog>` 나 접근성을 자체 처리하는 라이브러리를 쓰는 편이 안전하다

### 색상 대비

- 본문 텍스트는 배경 대비 **4.5:1**, 큰 텍스트·UI 경계는 **3:1** 이상 (WCAG AA)
- `text-content-muted`(gray400)는 흰 배경에서 대비가 4.5:1 에 못 미친다. 비활성·보조 라벨에만 쓰고, 읽어야 하는 본문 보조 텍스트는 `text-content-secondary`(gray600)를 하한으로 본다
- **수입/지출을 색상만으로 구분하지 않는다.** 부호(+/−)나 아이콘을 함께 쓴다. 색각 이상 사용자에게 초록/빨강은 구분되지 않는다

### 확인 방법

Biome 의 a11y 규칙(`pnpm lint`)이 1차 방어선이지만 마크업 구조 문제는 잡지 못한다. 키보드 Tab 이동만으로 주요 동선이 가능한지는 `e2e/` 스펙에 고정한다.
