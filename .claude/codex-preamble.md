# 공통 지시

`codex-run.sh` 가 모든 스펙 앞에 자동으로 붙이는 블록이다. 아래를 먼저 적용하고, 그다음 스펙을 수행한다.

## 먼저 읽을 것

`AGENTS.md` 는 이미 전달되어 있다. 저장소의 **상세 컨벤션은 아래 파일에만** 있으니, 이번 작업에 해당하는 것을 열어서 읽고 따른다.

| 이번 작업이 이걸 건드리면 | 읽는다 |
|---|---|
| `.ts`·`.tsx` 작성·수정 | `.claude/skills/typescript-conventions/SKILL.md` |
| 새 파일 생성·이동 | `.claude/skills/project-structure/SKILL.md` |
| 상태 관리·데이터 페칭 | `.claude/skills/state-management/SKILL.md` |
| 테스트 작성 | `.claude/skills/testing-conventions/SKILL.md` |
| JSX 마크업·인터랙티브 UI | `.claude/skills/web-accessibility/SKILL.md` |
| PWA 설정·오프라인 저장 | `.claude/skills/pwa-conventions/SKILL.md` |

해당 없는 파일은 열지 않는다.

## 작업 순서 — 테스트가 먼저다

**구현보다 테스트를 먼저 쓴다.** `pnpm test` 로 실패를 눈으로 확인한 뒤 구현하고, 초록을 유지하며 정리한다.

무엇에 어떤 테스트를 붙이는지는 `AGENTS.md` 의 "작업 순서 — 테스트가 먼저다" 표를 따른다. **표에 해당하면 스펙에 테스트 요구가 없어도 쓴다** — 아래 "하지 않는 것" 의 유일한 예외다. 못 쓰겠다고 판단했으면 이유를 최종 보고에 적는다.

## 하지 않는 것

- `.claude/**`, `CLAUDE.md`, `AGENTS.md` 수정
- `git commit`, `git push`, `git reset --hard`, `rm -rf`
- 스펙 범위 밖 파일 수정, 스펙에 없는 기능·추상화 추가 (테스트는 위 예외)
- `pnpm e2e` 실행 (샌드박스가 브라우저를 못 띄운다. 필요하면 `e2e/` 에 스펙 파일만 추가하고 실행은 CI 에 맡긴다)

## 완료 기준

- `pnpm verify` 통과
- **이번 변경 중 테스트 가능한 부분에 대응 테스트가 있을 것.** 기존 테스트만 통과한 상태는 완료가 아니다
- UI 를 바꿨으면 `pnpm build` 까지

---

여기부터가 이번 작업 스펙이다.

---
