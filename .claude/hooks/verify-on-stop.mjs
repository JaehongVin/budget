#!/usr/bin/env node
//* Stop 훅: 코드 변경을 감지해 검증 서브에이전트를 실행하도록 요청한다.
//*   .ts 변경          -> code-reviewer
//*   .tsx/.css 변경    -> code-reviewer + ui-qa (병렬)
//*
//* critical 이 나오면 총괄 에이전트는 직접 고치지 않고 스펙을 써서 Codex 에 위임한다.
//* 라운드가 올라갈수록 reasoning effort 를 올려 에스컬레이션한다.
//* diff 지문이 바뀔 때만 다시 걸고, 상한(MAX_ROUNDS)을 둬 무한 루프를 막는다.
//* 어떤 이유로든 실패하면 조용히 통과시킨다 (턴이 막히는 것이 검증을 놓치는 것보다 나쁘다).

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REVIEW_TARGETS = ['*.ts', '*.tsx', '*.css'];
const UI_EXTENSIONS = ['.tsx', '.css'];
const MAX_ROUNDS = 4;
//* 라운드별 Codex 모델·reasoning effort. 안 고쳐질수록 올린다.
//* Terra 가 두 번 실패하면 Sol 로 갈아탄다 (모델 자체를 바꾸는 에스컬레이션).
const TIER_BY_ROUND = [
  { model: 'gpt-5.6-terra', effort: 'medium' },
  { model: 'gpt-5.6-terra', effort: 'high' },
  { model: 'gpt-5.6-sol', effort: 'high' },
  { model: 'gpt-5.6-sol', effort: 'max' },
];
//* 이 시간 안에 이어진 변경만 "같은 수정 사이클"로 보고 라운드를 누적한다.
//* 넘기면 별개의 새 작업으로 취급해 라운드를 리셋한다.
const ROUND_RESET_MS = 15 * 60 * 1000;

const git = (args, cwd) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

const readStdin = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
};

const readMarker = (path) => {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
};

const buildReason = ({ changed, needsUiQa, round, isLastRound }) => {
  const header =
    round === 1
      ? '코드 변경이 감지되었다. 총괄 에이전트로서 검증을 거쳐야 턴을 끝낼 수 있다.'
      : `${round - 1}차 수정에 대한 재검증이 필요하다.`;

  const reviewStep = needsUiQa
    ? 'Agent 툴로 "code-reviewer"와 "ui-qa"를 한 메시지에서 병렬로, foreground로(run_in_background: false) 실행하라.'
    : 'Agent 툴로 subagent_type "code-reviewer"를 foreground로(run_in_background: false) 실행하라.';

  const tier =
    TIER_BY_ROUND[round - 1] ?? TIER_BY_ROUND[TIER_BY_ROUND.length - 1];

  const closing = isLastRound
    ? [
        `이번이 마지막 자동 재검증이다 (상한 ${MAX_ROUNDS}회).`,
        '같은 문제가 반복해서 안 고쳐졌다면 Codex를 또 부르기 전에 Agent 툴로 "debugger"를 실행해 근본 원인을 먼저 특정하라.',
        `debugger가 원인을 찾으면 그 내용을 스펙에 그대로 담아 최상위 티어로 위임하라: .claude/scripts/codex-run.sh <스펙> ${tier.effort} ${tier.model}`,
        '그러고도 critical이 남으면 더 반복하지 말고, 남은 문제를 사용자에게 한국어로 보고하고 종료하라.',
      ]
    : [
        'critical 지적이나 레이아웃 문제가 있으면 절대 네가 직접 Write·Edit 하지 마라. 구현은 Codex 담당이다.',
        `수정 스펙을 .claude/tmp/ 아래 파일로 쓰고 위임하라: .claude/scripts/codex-run.sh <스펙파일> ${tier.effort} ${tier.model}`,
        '스펙 작성 규칙은 .claude/skills/codex-delegation/SKILL.md 를 따른다.',
        '위임 후 돌아온 diff를 직접 읽어 확인한 뒤 다음 행동을 이어가라.',
        '수정이 끝나면 평소처럼 턴을 종료하면 된다 — 변경된 부분이 있으면 자동으로 다시 검증된다.',
      ];

  return [
    header,
    reviewStep,
    ...closing,
    '검증 결과는 매 라운드 사용자에게 한국어로 요약 보고한다.',
    '',
    '변경 파일:',
    changed.join('\n'),
  ].join('\n');
};

const main = () => {
  const input = readStdin();

  const cwd =
    process.env.CLAUDE_PROJECT_DIR ??
    git(['rev-parse', '--show-toplevel'], process.cwd()).trim();

  const status = git(
    ['status', '--porcelain', '--', ...REVIEW_TARGETS],
    cwd,
  ).trim();
  if (!status) return;

  const changed = status.split('\n').map((line) => line.slice(3));

  //* 추적 중인 변경은 diff로, 추적 안 되는 새 파일은 내용으로 지문을 만든다
  const untracked = status
    .split('\n')
    .filter((line) => line.startsWith('??'))
    .map((line) => line.slice(3));
  const fingerprint = [
    status,
    git(['diff', 'HEAD', '--', ...REVIEW_TARGETS], cwd),
    ...untracked.map((file) => readFileSync(join(cwd, file), 'utf8')),
  ].join('\n');

  const digest = createHash('sha1').update(fingerprint).digest('hex');
  const markerPath = join(
    tmpdir(),
    `claude-verify-${input.session_id ?? 'nosession'}`,
  );
  const marker = readMarker(markerPath);

  //* 이전에 검증한 것과 같은 상태면 몇 번을 다시 멈추려 해도 통과시킨다
  if (marker?.digest === digest) return;

  const now = Date.now();
  const sameCycle = marker && now - marker.ts <= ROUND_RESET_MS;
  const round = sameCycle ? marker.round + 1 : 1;
  writeFileSync(markerPath, JSON.stringify({ digest, round, ts: now }));

  //* 상한을 넘겼으면 직전 라운드에서 이미 "보고하고 종료" 지시를 내렸으니 더 막지 않는다
  if (round > MAX_ROUNDS) return;

  const needsUiQa = changed.some((file) =>
    UI_EXTENSIONS.some((ext) => file.endsWith(ext)),
  );

  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: buildReason({
        changed,
        needsUiQa,
        round,
        isLastRound: round === MAX_ROUNDS,
      }),
    }),
  );
};

try {
  main();
} catch {
  //* 통과
}
