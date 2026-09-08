#!/usr/bin/env node
//* PreToolUse(Bash) 훅: 되돌리기 어렵거나 품질 게이트를 우회하는 명령을 차단한다.
//* deny 이므로 승인 없이 바로 막힌다. 의도한 작업이면 명령을 직접 수정해서 재시도해야 한다.
//* 평범한 git commit·push 는 막지 않는다. 그건 사용자가 직접 지시하는 작업이다.
//*
//* 플래그는 결합형(-rf)·분리형(-r -f)·긴 형식(--force) 어느 쪽으로 와도 잡히도록
//* 정규식 대신 토큰 단위로 쪼개서 검사한다.
//*
//* 검사는 반드시 개별 명령 단위로 한다. 복합 명령을 통째로 토큰화하면 서로 다른
//* 명령의 플래그가 한 바구니에 섞여, 각각은 안전한 조합이 위험 명령으로 오판된다.

import { readFileSync } from 'node:fs';

const SEGMENT_SEPARATORS = /\s*(?:\|\||&&|;|\||\n)\s*/;
const segments = (command) =>
  command.split(SEGMENT_SEPARATORS).filter((part) => part.trim().length > 0);

const tokenize = (command) => command.split(/\s+/).filter(Boolean);

const isShortFlagCluster = (token) => /^-[a-zA-Z]+$/.test(token);
const shortFlagHas = (tokens, char) =>
  tokens.some(
    (token) => isShortFlagCluster(token) && token.slice(1).includes(char),
  );

//* "git <subcommand>" 바로 뒤에 오는 인자들만 뽑아낸다. 못 찾으면 null
const gitSubcommandArgs = (tokens, subcommand) => {
  const idx = tokens.findIndex(
    (token, i) => token === 'git' && tokens[i + 1] === subcommand,
  );
  return idx === -1 ? null : tokens.slice(idx + 2);
};

const RULES = [
  {
    reason: 'force push 는 원격 히스토리를 덮어쓴다',
    test: (tokens) => {
      const args = gitSubcommandArgs(tokens, 'push');
      if (!args) return false;
      return (
        args.includes('--force') ||
        args.includes('--force-with-lease') ||
        shortFlagHas(args, 'f') ||
        args.some((token) => token.startsWith('+') && token.length > 1) //* +refspec 형태의 강제 push
      );
    },
  },
  {
    reason: 'pre-commit 검사(lint-staged)를 우회한다',
    test: (tokens) => {
      const args = gitSubcommandArgs(tokens, 'commit');
      if (!args) return false;
      return args.includes('--no-verify') || shortFlagHas(args, 'n');
    },
  },
  {
    reason: '커밋되지 않은 작업이 사라진다',
    test: (tokens) =>
      gitSubcommandArgs(tokens, 'reset')?.includes('--hard') ?? false,
  },
  {
    reason: '추적되지 않는 파일을 삭제한다. 되돌릴 수 없다',
    test: (tokens) => {
      const args = gitSubcommandArgs(tokens, 'clean');
      if (!args) return false;
      return args.includes('--force') || shortFlagHas(args, 'f');
    },
  },
  {
    reason: '재귀 강제 삭제다',
    test: (tokens) => {
      const idx = tokens.indexOf('rm');
      if (idx === -1) return false;
      const args = tokens.slice(idx + 1);
      const recursive =
        args.includes('--recursive') ||
        shortFlagHas(args, 'r') ||
        shortFlagHas(args, 'R');
      const force = args.includes('--force') || shortFlagHas(args, 'f');
      return recursive && force;
    },
  },
  {
    reason:
      'Codex 를 샌드박스 없이 돌린다. 위임은 .claude/scripts/codex-run.sh 를 써라',
    test: (tokens) =>
      tokens.includes('codex') &&
      tokens.includes('--dangerously-bypass-approvals-and-sandbox'),
  },
];

const main = () => {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const command = input.tool_input?.command;
  if (!command) return;

  //* 세그먼트 하나라도 규칙에 걸리면 차단한다
  const hit = segments(command)
    .map((segment) => RULES.find((rule) => rule.test(tokenize(segment))))
    .find(Boolean);
  if (!hit) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `위험한 명령이라 차단했습니다: ${hit.reason}.\n\n  ${command}\n\n의도한 작업이면 명령을 직접 수정해서 다시 실행하세요.`,
      },
    }),
  );
};

try {
  main();
} catch {
  //* 판단 못 하면 통과시킨다. 훅 오류로 모든 Bash 를 막지 않는다
}
