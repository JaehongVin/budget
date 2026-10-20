const assertAmount = (value: number, name: string) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name}은 0 이상의 정수여야 한다: ${value}`);
  }
};

//* percent 는 표시용 실제 사용률, progress 는 막대용으로 100 에서 멈춘 값
export const getBudgetUsage = (spent: number, limit: number) => {
  assertAmount(spent, '지출');
  assertAmount(limit, '예산');
  if (limit === 0) throw new RangeError('예산은 0 보다 커야 한다');

  //* spent / limit 을 먼저 나누면 0.145 * 100 = 14.499… 처럼 .5 가 내림된다. 정수 곱셈을 먼저 한다
  const percent = Math.round((spent * 100) / limit);

  return {
    percent,
    progress: Math.min(percent, 100),
    remaining: Math.max(limit - spent, 0),
    //* 딱 맞게 쓴 건(100%) 초과가 아니다. 1원이라도 넘어야 초과다
    isOver: spent > limit,
  };
};
