---
name: pwa-conventions
description: vite-plugin-pwa 설정 구조, Service Worker 캐시로 인한 변경 미반영 대응, manifest·아이콘 규칙, 오프라인·로컬 저장 설계 원칙. PWA 설정을 건드리거나 오프라인 동작·설치 관련 작업을 할 때 사용.
---

이 앱은 설치형 PWA 다. 설정은 `vite.config.ts` 의 `VitePWA({ ... })` 한 곳에 모여 있다.

### 현재 설정 요약

| 항목 | 값 | 의미 |
|---|---|---|
| `registerType` | `autoUpdate` | 새 SW 를 감지하면 자동 갱신. 사용자에게 "새로고침" 프롬프트를 띄우지 않는다 |
| `devOptions.enabled` | `false` | **dev 서버에서는 SW 가 돌지 않는다.** 캐시가 HMR 을 방해하기 때문 |
| `workbox.globPatterns` | js/css/html/svg/png/woff2 | precache 대상 |
| `workbox.cleanupOutdatedCaches` | `true` | 옛 버전 캐시 정리 |

### Service Worker 때문에 생기는 문제

PWA 디버깅에서 가장 자주 헛짚는 부분이다.

- **dev 에서 오프라인 동작이 안 되는 건 정상이다.** `devOptions.enabled: false` 라서 SW 자체가 없다. 오프라인을 확인하려면 `pnpm build && pnpm preview`
- **변경이 반영 안 된다**면 이전 SW 가 옛 자산을 서빙하는 것이다. DevTools > Application > Service Workers 에서 unregister 하거나 hard reload 한다
- 프로덕션 증상을 조사할 때는 `dist/sw.js` 와 빌드 로그의 precache 목록(`pnpm build` 출력)을 먼저 본다

### manifest

`vite.config.ts` 의 `manifest` 가 `dist/manifest.webmanifest` 로 생성된다. `public/` 에 manifest 를 직접 만들지 마라 — 두 개가 생겨 충돌한다.

아이콘은 `public/` 에 있고 manifest 가 참조한다.

| 파일 | 용도 |
|---|---|
| `favicon.svg` | 브라우저 탭 |
| `apple-touch-icon.png` (180) | iOS 홈 화면 |
| `pwa-192x192.png`, `pwa-512x512.png` | Android 설치 |
| `pwa-maskable-512x512.png` | Android adaptive icon (안전 영역 16% 여백) |

> ⚠️ 현재 PNG 아이콘은 자동 생성한 **플레이스홀더**다. 실제 디자인이 나오면 같은 파일명·크기로 교체한다. 파일명을 바꾸면 manifest 도 함께 고쳐야 한다.

manifest 를 바꾼 뒤에는 `pnpm build` 로 실제 생성물을 확인한다. 오타가 나도 빌드는 통과하고 설치만 조용히 실패한다.

### 오프라인 · 로컬 저장 설계

가계부는 오프라인에서 입력할 수 있어야 쓸모가 있다. 저장소를 고를 때의 기준:

| 저장소 | 용도 |
|---|---|
| `localStorage` (zustand persist) | 설정, 마지막 선택 월 같은 소량 UI 상태 |
| IndexedDB | 거래 내역 등 실제 데이터. 용량·구조화 질의 모두 필요하다 |

- **금액은 원 단위 정수로 저장한다.** 부동소수점으로 돈을 다루면 합계가 어긋난다
- 서버 동기화를 붙이는 시점에는 마지막 쓰기가 이기는(last-write-wins) 규칙을 먼저 정하고 시작한다. 충돌 해소를 나중에 붙이면 데이터가 이미 어긋나 있다
- 저장 스키마를 바꿀 때는 마이그레이션 경로를 같이 만든다. 사용자 기기에 이전 버전 데이터가 이미 들어 있다

### 확인 방법

```bash
pnpm build     # SW 생성 + precache 목록 출력
pnpm preview   # SW 가 실제로 도는 환경. 오프라인 확인은 여기서
```

설치 가능 여부는 Chrome DevTools > Application > Manifest 의 경고를 본다.
