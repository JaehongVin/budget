#!/usr/bin/env node
//* PostToolUse 훅: 편집된 파일에 biome check --write 를 적용한다.
//* Claude 의 편집은 에디터를 거치지 않아 formatOnSave 가 발동하지 않으므로, 이 훅이 그 층을 대신한다.
//* Codex 의 편집은 이 훅을 거치지 않는다. 대신 Codex 는 스스로 pnpm verify 를 돌리도록 지시받는다.
//*
//* biome 종료 코드별 처리
//*   0    수정 완료. 조용히 통과
//*   1    자동 수정 불가한 오류. exit 2 로 Claude 에게 즉시 피드백해 고치게 한다
//*   그 외 biome 자체를 못 돌린 인프라 문제. 차단하지 않되 사용자에게 알린다

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const TARGET_EXTENSIONS = /\.(ts|tsx|js|jsx|mjs|cjs|json|jsonc|css)$/;
const UNFIXABLE = 1;

const notify = (message) =>
  process.stdout.write(JSON.stringify({ systemMessage: message }));

//* --no-errors-on-unmatched: gitignore 된 경로(.claude/tmp 등)에 쓸 때 biome 이
//* "처리할 파일 없음"으로 exit 1 을 내는데, 그걸 수정 불가 오류로 오인해 턴을 막으면 안 된다.
//* lint-staged 도 같은 이유로 이 플래그를 쓴다.
const runBiome = (file, cwd) => {
  try {
    execFileSync(
      'pnpm',
      ['exec', 'biome', 'check', '--write', '--no-errors-on-unmatched', file],
      {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    return { status: 0, output: '' };
  } catch (error) {
    return {
      status: error.status ?? -1,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
};

const main = () => {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const file = input.tool_response?.filePath ?? input.tool_input?.file_path;
  if (!file || !TARGET_EXTENSIONS.test(file)) return;

  const cwd = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const { status, output } = runBiome(file, cwd);

  if (status === 0) return;

  if (status === UNFIXABLE) {
    process.stderr.write(
      `Biome이 자동 수정하지 못한 오류가 남았다. 다음 작업으로 넘어가기 전에 고쳐라.\n\n${output.trim()}\n`,
    );
    process.exit(2);
  }

  notify(
    `포맷터 훅이 biome을 실행하지 못했습니다 (종료 코드 ${status}). 자동 포맷이 꺼진 상태입니다.`,
  );
};

try {
  main();
} catch (error) {
  notify(`포맷터 훅 오류: ${error.message}`);
}
