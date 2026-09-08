---
name: playwright-qa
description: UI 컴포넌트/스타일/레이아웃 변경 후 Playwright로 브라우저 QA를 수행하는 방법과 필요·불필요 기준, 뷰포트 선택. className, Tailwind 클래스, 새 컴포넌트를 변경했을 때 사용.
---

UI 컴포넌트, 스타일, 레이아웃이 변경되는 작업 후에는 Playwright 로 브라우저 QA 를 수행한다.

### QA 가 필요한 경우

- 컴포넌트 스타일 추가·수정 (className, Tailwind 클래스 변경)
- 새 컴포넌트 추가 또는 레이아웃 구조 변경
- 폼·다이얼로그·바텀시트 등 인터랙션 UI 변경

### QA 가 불필요한 경우

- 타입, 유틸리티 함수, 스토어, 쿼리 로직만 변경
- 테스트 파일만 변경
- 패키지 설치·제거

### dev 서버

사용자가 로컬 dev 서버를 이미 띄워놓고 있을 수 있으므로, **자체 서버를 별도로 띄우지 않는다.**

```bash
curl -sI http://localhost:5173
```

응답이 없으면 사용자에게 `pnpm dev` 실행을 요청한다. 부득이하게 직접 띄워야 하면 기본 포트(5173)를 피한다.

> `pnpm e2e` 는 예외다. `playwright.config.ts` 의 `webServer` 가 dev 서버를 알아서 띄우고, 이미 떠 있으면 재사용한다.

### 브라우저

시스템에 설치된 **Google Chrome** 을 쓴다 (`playwright.config.ts` 의 `channel: 'chrome'`). 이 머신은 macOS 12 라 Playwright 1.63 이 번들 Chromium 을 더 이상 배포하지 않는다. `--browser chromium` 으로 실행하면 "Playwright does not support chromium on mac12-arm64" 로 실패한다. 스크린샷 CLI 에서도 `--channel chrome` 을 붙여라.

### 뷰포트

모바일 우선 PWA 다. **390px 이 기본**이다.

| 뷰포트 | 언제 |
|---|---|
| 390x844 | 모든 UI 변경 |
| 1440x900 | breakpoint·레이아웃 구조가 바뀐 경우 추가 |

```bash
pnpm exec playwright screenshot --channel chrome --viewport-size "390,844" \
  --wait-for-selector "main" --wait-for-timeout 500 \
  "http://localhost:5173/" <스크래치패드>/mo-home.png

pnpm exec playwright screenshot --channel chrome --viewport-size "1440,900" \
  --wait-for-selector "main" --wait-for-timeout 500 \
  "http://localhost:5173/" <스크래치패드>/dt-home.png
```

> ⚠️ `--wait-for-selector` 없이 찍으면 **React 가 렌더되기 전에 캡처되어 빈 화면이 나온다.** CSR 앱이라 초기 HTML 이 비어 있다. 빈 스크린샷을 보고 "화면이 안 뜬다"고 오판하지 마라 — 먼저 대기 옵션을 붙여 다시 찍어본다.

스크린샷은 찍고 끝내지 말고 **Read 로 직접 열어서 확인**한다.

### 회귀 확인

e2e 스펙이 있으면 함께 돌린다.

```bash
pnpm e2e --project=mobile
```

실패하면 `playwright-report/` 에 트레이스가 남는다.

### 확인 항목

- 레이아웃 깨짐: 요소 겹침, 가로 스크롤 발생, 잘린 텍스트
- 모바일 safe-area 침범, 하단 고정 요소가 홈 인디케이터에 가리는지
- 터치 타깃 44px 이상
- 긴 금액·긴 카테고리명에서 줄바꿈·overflow 가 깨지지 않는지
- 콘솔 에러
