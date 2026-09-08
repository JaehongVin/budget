---
name: codex-delegation
description: 구현 작업을 Codex(gpt-5.6-terra)에 위임하는 절차. 스펙 파일 작성 규칙, codex-run.sh 사용법, reasoning effort 에스컬레이션 단계, 위임하지 말아야 할 작업의 기준. 코드를 새로 쓰거나 고쳐야 할 때 사용.
---

이 저장소에서 **총괄 에이전트(Claude Opus)는 코드를 직접 쓰지 않는다.** 구현은 Codex 담당이다.
총괄의 산출물은 코드가 아니라 **스펙**이다. 스펙의 품질이 결과의 품질을 결정한다.

## 위임 흐름

```
요구사항 분석 · 기존 구조 파악 · 설계 · 위험 파악   ← 총괄 (Opus)
        ↓  스펙 파일 작성
Codex gpt-5.6-terra (effort medium)                ← 구현
        ↓  diff
diff 확인 → code-reviewer                          ← 총괄 (Opus)
        ↓  critical 있으면 스펙 갱신 후 재위임 (티어 ↑)
pnpm verify 통과 → 사용자 보고                       ← 총괄 (Opus)
```

## 명령어

```bash
.claude/scripts/codex-run.sh <스펙파일> [effort] [model]
```

Orca 안에서 돌면 **새 터미널 탭이 열려 Codex 가 일하는 게 실시간으로 보이고**, 끝나면 원래 탭으로 돌아온다. 성공하면 탭은 자동으로 정리되고, 실패하면 눈으로 확인하라고 남긴다 (`CODEX_KEEP_TAB=1` 로 항상 보존). Orca 밖이면 조용히 백그라운드로 돈다. 결과 회수는 두 경우 모두 파일 기반이라 동작은 같다.

스크립트가 `.claude/codex-preamble.md` 를 스펙 앞에 자동으로 붙인다. 스킬 경로 표·금지 사항·완료 기준이 거기 들어 있으니 **스펙에 매번 다시 적을 필요는 없다.** 이번 작업에 결정적인 스킬만 본문에서 한 번 더 짚으면 된다. 실제로 넘어간 입력은 `.claude/tmp/codex-<타임스탬프>.prompt.md` 에 남는다.

스펙 파일은 `.claude/tmp/` 아래에 둔다 (gitignore 됨).

```bash
mkdir -p .claude/tmp
# 스펙을 .claude/tmp/spec-transaction-form.md 로 작성한 뒤
.claude/scripts/codex-run.sh .claude/tmp/spec-transaction-form.md medium
```

스크립트는 Codex의 최종 보고와 `git status` 만 출력하고, 전체 트랜스크립트는 `.claude/tmp/codex-*.log` 에 남긴다. 무엇을 시도했는지 봐야 할 때만 로그를 읽는다.

## 에스컬레이션 단계

같은 문제로 다시 부를 때마다 티어를 올린다. **같은 스펙을 그대로 다시 던지지 마라** — 실패했다는 건 스펙이 부족했거나 원인 진단이 틀렸다는 뜻이다.

| 시도 | 모델 | effort | 총괄이 추가로 해야 할 일 |
|---|---|---|---|
| 1차 | `gpt-5.6-terra` | `medium` | — |
| 2차 | `gpt-5.6-terra` | `high` | 1차에서 무엇이 왜 틀렸는지를 스펙에 명시 |
| 3차 | **`gpt-5.6-sol`** | `high` | 실패한 접근을 "이건 시도했고 이래서 안 됐다"로 배제 조건에 기록 |
| 최종 | **`gpt-5.6-sol`** | `max` | 먼저 `debugger` 서브에이전트로 근본 원인을 특정하고, 그 분석을 스펙에 통째로 넣는다 |

```bash
.claude/scripts/codex-run.sh .claude/tmp/spec.md high gpt-5.6-sol
```

`sol max` 까지 갔는데도 안 되면 반복하지 말고 사용자에게 남은 문제를 보고하고 멈춘다.

> Terra 는 일상 구현용, Sol 은 막혔을 때 꺼내는 카드다. 두 번 실패했다는 건 추론 깊이만의 문제가 아닐 가능성이 크므로 **모델 자체를 바꾼다.**
>
> 사용 가능한 모델은 `gpt-6-astra`, `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.5`, `gpt-5.4-mini` 다. 목록은 `$CODEX_HOME/models_cache.json` 에 있다 — Orca 가 `CODEX_HOME` 을 관리 계정 경로로 덮어쓰므로 `~/.codex` 가 아니라 이 환경 변수를 봐야 한다.

## 스펙 작성 규칙

Codex는 이 대화의 맥락을 모른다. **스펙 하나만 읽고 작업이 가능해야 한다.** 아래 5개 항목을 채운다.

```markdown
## 목표
한두 문장. 무엇이 되면 완료인지.

## 배경
왜 이 변경이 필요한지, 지금 코드가 어떤 상태인지. 관련 파일 경로를 명시한다.

## 작업
1. `src/features/transactions/model/types.ts` 에 `Transaction` 인터페이스 추가
   - 필드: id(string), amount(number, 원 단위 정수), type('income' | 'expense'), ...
2. ...

구체적인 파일 경로와 시그니처까지 적는다. "적절히 만들어라"는 스펙이 아니다.

## 제약
- `.claude/skills/typescript-conventions/SKILL.md` 와 `project-structure` 를 따를 것
- 금액은 원 단위 정수로만 다룬다. 부동소수점 금지
- 이 작업 범위 밖의 파일은 건드리지 말 것
- 지금 필요 없는 추상화·확장성 추가 금지 (YAGNI)

## 완료 조건
- `pnpm verify` 통과
- `src/features/transactions/model/sumByType.test.ts` 에 아래 케이스가 있고 전부 통과
  - 지출만 있는 달의 합계
  - 수입·지출이 섞인 달의 합계 (부호 방향)
  - 월말 경계(31일)에 걸친 거래가 해당 월에 포함되는지
```

**완료 조건에 테스트를 적지 않으면 테스트는 안 온다.** Codex 의 1순위 규칙이 "스펙에 없는 것은 하지 마라" 이기 때문이다. `AGENTS.md` 가 TDD 를 요구하고 있어도, 스펙에서 **검증할 동작을 케이스 단위로 지정**해야 원하는 테스트가 나온다. "테스트도 써라" 한 줄로는 형식만 채운 테스트가 온다.

### 스펙에서 흔히 빠지는 것

- **하지 말아야 할 것.** Codex는 시키지 않은 리팩토링·추상화를 잘 얹는다. 범위를 명시적으로 닫아라.
- **참고할 기존 코드.** "`src/features/budgets/` 와 같은 구조로" 한 줄이 설명 열 줄보다 정확하다.
- **완료 조건.** `pnpm verify` 를 명시하지 않으면 검증 없이 끝낼 수 있다.
- **검증할 테스트 케이스.** 파일 경로만 적지 말고 **어떤 동작을 검증할지**를 케이스로 나열해라. 경계값(월말, 0원, 음수)을 여기서 못 박아야 Codex 가 해피 패스만 테스트하고 끝내지 않는다.
- **스킬 파일 경로.** Codex는 `AGENTS.md` 는 자동으로 읽지만 `.claude/skills/**` 는 안 읽는다. 프리앰블이 전체 표를 넘기긴 하지만, 이번 작업의 핵심 스킬은 경로를 찍어 "읽고 따르라"고 한 번 더 써라.

## Codex 샌드박스의 한계

Codex 는 `workspace-write` 샌드박스에서 돈다. 파일 쓰기와 `pnpm` 실행은 되지만 **브라우저를 띄우지 못한다.** Chrome 을 실행하면 SIGABRT 로 죽는다.

따라서 `pnpm e2e` (Playwright) 는 스펙의 완료 조건에 넣어도 Codex 가 수행할 수 없다.

Codex 에게는 코드 레벨 검증(`pnpm verify`, `pnpm build`)까지만 요구한다. 브라우저에서만 드러나는 회귀는 **e2e 스펙으로 고정**한다 — 스펙에 "이 동작을 검증하는 e2e 를 `e2e/` 에 추가하라"고 적으면 Codex 가 스펙 파일은 작성할 수 있고, 실제 실행은 CI 의 e2e 잡이 한다.

## 위임하지 않는 작업

아래는 총괄이 직접 한다. Codex를 부르는 오버헤드가 작업보다 크다.

- 파일 읽기·검색·구조 파악 (분석은 애초에 총괄의 일이다)
- `.claude/**` 하네스 설정, `CLAUDE.md`·`AGENTS.md` 수정
- 스펙 파일 자체 작성
- `git` 조작, 커밋 메시지

반대로 아래는 사소해 보여도 위임한다 — 총괄이 손대기 시작하면 경계가 무너진다.

- `src/`·`e2e/` 아래 모든 코드 작성·수정 (한 줄짜리 오타 수정 포함)
- 타입 수정, lint/typecheck 오류 해결, 테스트 작성
- 패키지 설치와 그에 따른 설정 변경

> 유일한 예외: Stop 훅이 마지막 라운드(4회차)임을 알렸고 `debugger` 분석 후에도 Codex가 못 고친 경우. 그때는 사용자에게 보고하는 것이 먼저고, 직접 고치는 건 사용자가 요청했을 때만 한다.

## 위임 후

1. `git diff` 를 **직접 읽는다.** Codex의 요약 보고만 믿지 않는다. 스펙 밖의 변경이 섞였는지 여기서 잡는다.
2. `code-reviewer` 를 돌린다.
3. critical 이 있으면 스펙을 갱신해 재위임한다. 리뷰 지적을 **그대로 복사해 스펙에 넣는다** — 요약하면 정보가 날아간다.
