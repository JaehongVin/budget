#!/usr/bin/env bash
#* Codex(구현 담당)에게 작업을 위임하는 래퍼.
#*
#* 총괄 에이전트(Claude Opus)는 코드를 직접 쓰지 않는다. 스펙 파일을 작성해서
#* 이 스크립트로 넘기고, 돌아온 결과를 리뷰·검증하는 것이 총괄의 역할이다.
#*
#* 사용법
#*   .claude/scripts/codex-run.sh <스펙파일> [effort] [model]
#*
#* 실행 방식
#*   Orca 안에서 돌면 새 터미널 탭을 띄워 Codex 가 일하는 걸 눈으로 볼 수 있게 하고,
#*   끝나면 원래 탭으로 돌려준다. Orca 밖이면 조용히 백그라운드로 실행한다(폴백).
#*   결과 회수는 두 경우 모두 --output-last-message 파일로 하므로 동작은 같다.
#*
#* 모델 · reasoning effort
#*   gpt-5.6-terra  기본. 구현 담당
#*   gpt-5.6-sol    에스컬레이션. Terra 가 두 번 실패했을 때
#*   effort 는 low | medium | high | xhigh | max
#*
#* 환경 변수
#*   CODEX_MODEL       기본 모델 (기본값 gpt-5.6-terra). 3번째 인자가 우선한다
#*   CODEX_SANDBOX     기본 workspace-write
#*   CODEX_UI          tab | headless (기본 tab). headless 면 탭을 띄우지 않는다
#*   CODEX_KEEP_TAB    1 이면 성공해도 탭을 닫지 않는다 (기본은 실패 시에만 남긴다)
#*   CODEX_TIMEOUT_MS  탭 대기 상한 (기본 1800000 = 30분)

set -euo pipefail

SPEC="${1:-}"
EFFORT="${2:-medium}"
MODEL="${3:-${CODEX_MODEL:-gpt-5.6-terra}}"
SANDBOX="${CODEX_SANDBOX:-workspace-write}"
UI="${CODEX_UI:-tab}"
TIMEOUT_MS="${CODEX_TIMEOUT_MS:-1800000}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"

if [ -z "$SPEC" ] || [ ! -f "$SPEC" ]; then
  echo "사용법: codex-run.sh <스펙파일> [low|medium|high|xhigh|max] [모델]" >&2
  exit 64
fi

case "$EFFORT" in
  low | medium | high | xhigh | max) ;;
  *)
    echo "reasoning effort 는 low|medium|high|xhigh|max 중 하나다: $EFFORT" >&2
    exit 64
    ;;
esac

TMP_DIR="$PROJECT_DIR/.claude/tmp"
mkdir -p "$TMP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$TMP_DIR/codex-$STAMP.log"
LAST="$TMP_DIR/codex-$STAMP.last.md"
STATUS_FILE="$TMP_DIR/codex-$STAMP.status"
RUNNER="$TMP_DIR/codex-$STAMP.runner.sh"

#* Orca CLI 위치. /usr/local/bin/orca 심볼릭 링크는 샌드박스에서 못 읽으므로 실경로를 먼저 본다
find_orca() {
  for candidate in \
    "${ORCA_CODEX_LAUNCH_PREFLIGHT:-}" \
    "/Applications/Orca.app/Contents/Resources/bin/orca"; do
    [ -n "$candidate" ] && [ -x "$candidate" ] && echo "$candidate" && return 0
  done
  return 1
}

#* 탭 안에서 실제로 돌 스크립트. 따옴표 지옥을 피하려고 파일로 뽑는다
cat >"$RUNNER" <<RUNNER_EOF
#!/usr/bin/env bash
echo "▶ Codex  model=$MODEL  effort=$EFFORT"
echo "  spec: $SPEC"
echo "────────────────────────────────────────────────"
codex exec \\
  --model "$MODEL" \\
  --config model_reasoning_effort="$EFFORT" \\
  --config sandbox_workspace_write.network_access=true \\
  --sandbox "$SANDBOX" \\
  --cd "$PROJECT_DIR" \\
  --output-last-message "$LAST" \\
  --color never \\
  --skip-git-repo-check \\
  - <"$SPEC" 2>&1 | tee "$LOG"
echo "\${PIPESTATUS[0]}" >"$STATUS_FILE"
echo "────────────────────────────────────────────────"
echo "완료. 종료 코드 \$(cat "$STATUS_FILE")"
RUNNER_EOF
chmod +x "$RUNNER"

report() {
  local status="$1"
  echo
  echo "── Codex 최종 보고 ──────────────────────────────"
  if [ -s "$LAST" ]; then
    cat "$LAST"
  else
    tail -n 40 "$LOG" 2>/dev/null || echo "(출력 없음)"
  fi

  echo
  echo "── 작업 트리 상태 ───────────────────────────────"
  git -C "$PROJECT_DIR" status --porcelain

  echo
  echo "전체 로그: $LOG   (codex exit=$status)"
}

run_in_tab() {
  local orca="$1" handle created status
  local title="Codex · ${MODEL#gpt-} · $EFFORT"

  #* Orca 런타임이 순간적으로 바쁠 때 create 가 실패할 수 있어 한 번 재시도한다.
  #* stderr 를 버리지 않는다 — 실패 사유가 안 보이면 원인을 못 찾는다.
  local attempt err
  for attempt in 1 2; do
    err="$TMP_DIR/codex-$STAMP.create-err.$attempt"
    created="$("$orca" terminal create \
      --worktree "path:$PROJECT_DIR" \
      --title "$title" \
      --command "bash '$RUNNER'; exit" \
      --focus --json 2>"$err")" && break
    echo "  terminal create 실패 (시도 $attempt): $(tr '\n' ' ' <"$err" | cut -c1-300)" >&2
    created=""
  done
  if [ -z "$created" ]; then
    return 1
  fi

  handle="$(printf '%s' "$created" | python3 -c \
    'import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(1)
def find(node):
    if isinstance(node, dict):
        for key in ("handle", "terminalHandle"):
            v = node.get(key)
            if isinstance(v, str) and v.startswith("term_"):
                return v
        for v in node.values():
            r = find(v)
            if r:
                return r
    elif isinstance(node, list):
        for v in node:
            r = find(v)
            if r:
                return r
    return None
h = find(d)
print(h or "")' 2>/dev/null)"

  if [ -z "$handle" ]; then
    echo "  terminal create 응답에서 핸들을 못 찾았다: $(printf '%s' "$created" | tr '\n' ' ' | cut -c1-300)" >&2
    return 1
  fi

  echo "▶ Codex 탭 생성됨: $title  ($handle)"
  echo "  작업이 끝나면 이 탭으로 돌아온다."

  "$orca" terminal wait --terminal "$handle" --for exit \
    --timeout-ms "$TIMEOUT_MS" >/dev/null 2>&1 || true

  #* 원래 탭으로 복귀
  if [ -n "${ORCA_TERMINAL_HANDLE:-}" ]; then
    "$orca" terminal switch --terminal "$ORCA_TERMINAL_HANDLE" >/dev/null 2>&1 || true
  fi

  status="$(cat "$STATUS_FILE" 2>/dev/null || echo 1)"

  #* 성공했고 보존 요청이 없으면 탭을 정리한다. 실패한 탭은 눈으로 보라고 남긴다
  if [ "$status" = "0" ] && [ -z "${CODEX_KEEP_TAB:-}" ]; then
    "$orca" terminal close --terminal "$handle" --tab >/dev/null 2>&1 || true
  else
    echo "  (탭을 남겨뒀다: $title)"
  fi

  report "$status"
  return "$status"
}

run_headless() {
  echo "▶ Codex 위임(headless)  model=$MODEL  effort=$EFFORT  spec=$SPEC"
  local status=0
  bash "$RUNNER" >/dev/null 2>&1 || true
  status="$(cat "$STATUS_FILE" 2>/dev/null || echo 1)"
  report "$status"
  return "$status"
}

STATUS=0
if [ "$UI" = "tab" ] && ORCA="$(find_orca)"; then
  run_in_tab "$ORCA" || STATUS=$?
  #* 탭 경로가 통째로 실패하면(핸들 못 얻음 등) headless 로 떨어진다
  if [ ! -f "$STATUS_FILE" ]; then
    echo "  Orca 탭 생성에 실패했다. headless 로 실행한다." >&2
    STATUS=0
    run_headless || STATUS=$?
  fi
else
  run_headless || STATUS=$?
fi

rm -f "$RUNNER"
exit "$STATUS"
