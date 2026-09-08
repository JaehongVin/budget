import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HOOK = fileURLToPath(
  new URL('../hooks/guard-dangerous-command.mjs', import.meta.url),
);

const run = (command) => {
  const out = execFileSync('node', [HOOK], {
    input: JSON.stringify({ tool_input: { command } }),
    encoding: 'utf8',
  });
  if (!out.trim()) return 'allow';
  return JSON.parse(out).hookSpecificOutput.permissionDecision;
};

const cases = [
  //* 단일 명령 — 기존 동작 회귀 확인
  ['git push origin main', 'allow'],
  ['git commit -m "feat: x"', 'allow'],
  ['pnpm verify', 'allow'],
  ['.claude/scripts/codex-run.sh .claude/tmp/spec.md medium', 'allow'],
  ['rm -r ./dist', 'allow'],
  ['rm -f ./a.txt', 'allow'],
  ['git push --force origin main', 'deny'],
  ['git push -f origin main', 'deny'],
  ['git push origin +main', 'deny'],
  ['git commit --no-verify -m x', 'deny'],
  ['git commit -nm x', 'deny'],
  ['git reset --hard HEAD~1', 'deny'],
  ['git clean -fd', 'deny'],
  ['rm -rf /tmp/x', 'deny'],
  ['rm -r -f /tmp/x', 'deny'],
  ['codex exec --dangerously-bypass-approvals-and-sandbox hi', 'deny'],

  //* 복합 명령 — 이번에 고친 오탐
  ['rm -f a.txt; rm -r ./dist', 'allow'],
  ['rm -f a.txt && rm -r ./dist', 'allow'],
  ['rm -r ./dist\nrm -f b.txt', 'allow'],
  ['pnpm build | grep -f patterns; rm -r ./dist', 'allow'],
  ['echo "rm -rf is dangerous" && ls', 'allow'],

  //* 복합 명령 안에 진짜 위험 명령이 있으면 여전히 차단
  ['pnpm build; rm -rf /tmp/x', 'deny'],
  ['ls && git push --force origin main', 'deny'],
  ['echo hi | tee log; git reset --hard', 'deny'],
];

let failed = 0;
for (const [command, expected] of cases) {
  const actual = run(command);
  const ok = actual === expected;
  if (!ok) failed += 1;
  const shown = command.replace(/\n/g, '\\n');
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${expected.padEnd(5)} ${shown}`);
}
console.log(
  failed === 0 ? `\n${cases.length}건 전부 통과` : `\n실패 ${failed}건`,
);
process.exit(failed === 0 ? 0 : 1);
