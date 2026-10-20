import type { Transaction } from '@/types/transaction';
import {
  filterByDateRange,
  filterByMonth,
  filterByType,
  getDailyTotals,
  getRecentTransactions,
  getSpendingChangePercent,
  groupByDate,
  summarize,
} from './transactions';

const createTransaction = (
  overrides: Partial<Transaction> = {},
): Transaction => ({
  id: 'tx',
  type: 'expense',
  title: '거래',
  category: '식비',
  paymentMethod: '신한카드',
  amount: 1000,
  date: '2026-09-15',
  ...overrides,
});

describe('summarize', () => {
  it('입금·지출 합계와 남은 돈을 구한다', () => {
    const result = summarize([
      createTransaction({ type: 'income', amount: 3_420_000 }),
      createTransaction({ amount: 1_577_500 }),
    ]);

    expect(result).toEqual({
      income: 3_420_000,
      expense: 1_577_500,
      balance: 1_842_500,
    });
  });

  it('빈 배열이면 전부 0 이다', () => {
    expect(summarize([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it('지출이 입금보다 크면 남은 돈이 음수다', () => {
    const result = summarize([
      createTransaction({ type: 'income', amount: 1_500_000 }),
      createTransaction({ amount: 1_792_500 }),
    ]);

    expect(result.balance).toBe(-292_500);
  });

  it('0원 거래는 합계에 영향이 없다', () => {
    expect(summarize([createTransaction({ amount: 0 })]).expense).toBe(0);
  });

  it('입금과 지출이 같으면 남은 돈은 0 이다 (음수 0 이 아니다)', () => {
    const { balance } = summarize([
      createTransaction({ type: 'income', amount: 500 }),
      createTransaction({ amount: 500 }),
    ]);

    expect(Object.is(balance, 0)).toBe(true);
  });
});

describe('filterByDateRange / filterByMonth', () => {
  const transactions = [
    createTransaction({ id: 'a', date: '2026-08-31' }),
    createTransaction({ id: 'b', date: '2026-09-01' }),
    createTransaction({ id: 'c', date: '2026-09-30' }),
    createTransaction({ id: 'd', date: '2026-10-01' }),
  ];

  it('범위는 시작일과 종료일을 모두 포함한다', () => {
    const result = filterByDateRange(transactions, {
      from: '2026-09-01',
      to: '2026-09-30',
    });

    expect(result.map(({ id }) => id)).toEqual(['b', 'c']);
  });

  it('월 경계(말일·다음 달 1일)를 정확히 나눈다', () => {
    expect(filterByMonth(transactions, '2026-09').map(({ id }) => id)).toEqual([
      'b',
      'c',
    ]);
  });

  it('윤년 2월 29일은 2월에 속한다', () => {
    const leap = [
      createTransaction({ id: 'x', date: '2028-02-29' }),
      createTransaction({ id: 'y', date: '2028-03-01' }),
    ];

    expect(filterByMonth(leap, '2028-02').map(({ id }) => id)).toEqual(['x']);
  });

  it('해당 월 거래가 없으면 빈 배열이다', () => {
    expect(filterByMonth(transactions, '2027-01')).toEqual([]);
  });
});

describe('getDailyTotals', () => {
  it('날짜별로 입금·지출을 따로 합산한다', () => {
    const totals = getDailyTotals([
      createTransaction({ date: '2026-09-15', amount: 5_500 }),
      createTransaction({ date: '2026-09-15', amount: 50_000 }),
      createTransaction({
        date: '2026-09-15',
        type: 'income',
        amount: 3_420_000,
      }),
      createTransaction({ date: '2026-09-14', amount: 154_500 }),
    ]);

    expect(totals['2026-09-15']).toEqual({
      income: 3_420_000,
      expense: 55_500,
    });
    expect(totals['2026-09-14']).toEqual({ income: 0, expense: 154_500 });
  });

  it('거래가 없는 날은 키가 없다', () => {
    expect(getDailyTotals([])['2026-09-16']).toBeUndefined();
  });
});

describe('groupByDate', () => {
  it('최신 날짜가 먼저 온다', () => {
    const groups = groupByDate([
      createTransaction({ id: 'old', date: '2026-09-01' }),
      createTransaction({ id: 'new', date: '2026-09-15' }),
      createTransaction({ id: 'mid', date: '2026-09-14' }),
    ]);

    expect(groups.map(({ date }) => date)).toEqual([
      '2026-09-15',
      '2026-09-14',
      '2026-09-01',
    ]);
  });

  it('같은 날 안에서는 입력 순서를 그대로 유지한다', () => {
    const [group] = groupByDate([
      createTransaction({ id: '1', date: '2026-09-15' }),
      createTransaction({ id: '2', date: '2026-09-15' }),
      createTransaction({ id: '3', date: '2026-09-15' }),
    ]);

    expect(group?.transactions.map(({ id }) => id)).toEqual(['1', '2', '3']);
  });

  it('연도·월 경계를 넘어도 날짜 순으로 정렬한다', () => {
    const groups = groupByDate([
      createTransaction({ date: '2026-01-01' }),
      createTransaction({ date: '2025-12-31' }),
    ]);

    expect(groups.map(({ date }) => date)).toEqual([
      '2026-01-01',
      '2025-12-31',
    ]);
  });

  it('빈 배열이면 빈 배열이다', () => {
    expect(groupByDate([])).toEqual([]);
  });

  it('입력 배열을 바꾸지 않는다', () => {
    const input = [
      createTransaction({ id: 'a', date: '2026-09-01' }),
      createTransaction({ id: 'b', date: '2026-09-02' }),
    ];

    groupByDate(input);

    expect(input.map(({ id }) => id)).toEqual(['a', 'b']);
  });
});

describe('filterByType', () => {
  const transactions = [
    createTransaction({ id: 'in', type: 'income' }),
    createTransaction({ id: 'out', type: 'expense' }),
  ];

  it('all 은 전부 돌려준다', () => {
    expect(filterByType(transactions, 'all')).toHaveLength(2);
  });

  it('income 은 입금만 돌려준다', () => {
    expect(filterByType(transactions, 'income').map(({ id }) => id)).toEqual([
      'in',
    ]);
  });

  it('expense 는 지출만 돌려준다', () => {
    expect(filterByType(transactions, 'expense').map(({ id }) => id)).toEqual([
      'out',
    ]);
  });

  it('해당 종류가 없으면 빈 배열이다', () => {
    expect(filterByType([], 'income')).toEqual([]);
  });
});

describe('getRecentTransactions', () => {
  const transactions = [
    createTransaction({ id: '14', date: '2026-09-14' }),
    createTransaction({ id: '15a', date: '2026-09-15' }),
    createTransaction({ id: '15b', date: '2026-09-15' }),
    createTransaction({ id: '15c', date: '2026-09-15' }),
  ];

  it('최신 날짜부터 N건을 돌려준다', () => {
    expect(getRecentTransactions(transactions, 3).map(({ id }) => id)).toEqual([
      '15a',
      '15b',
      '15c',
    ]);
  });

  it('N 이 전체보다 크면 전부 돌려준다', () => {
    expect(getRecentTransactions(transactions, 10)).toHaveLength(4);
  });

  it('N 이 0 이거나 배열이 비었으면 빈 배열이다', () => {
    expect(getRecentTransactions(transactions, 0)).toEqual([]);
    expect(getRecentTransactions([], 3)).toEqual([]);
  });
});

describe('getSpendingChangePercent', () => {
  it('지난달보다 줄었으면 음수다', () => {
    expect(getSpendingChangePercent(1_577_500, 1_792_500)).toBe(-12);
  });

  it('지난달보다 늘었으면 양수다', () => {
    expect(getSpendingChangePercent(1_200, 1_000)).toBe(20);
  });

  it('같으면 0 이다', () => {
    expect(getSpendingChangePercent(1_000, 1_000)).toBe(0);
  });

  it('지난달 지출이 0원이면 비교할 수 없어 null 이다', () => {
    expect(getSpendingChangePercent(1_000, 0)).toBeNull();
    expect(getSpendingChangePercent(0, 0)).toBeNull();
  });

  it('이번 달 지출이 0원이면 -100% 다', () => {
    expect(getSpendingChangePercent(0, 1_000)).toBe(-100);
  });

  it('.5 는 0 에서 먼 쪽으로 반올림한다 (증가·감소 대칭)', () => {
    expect(getSpendingChangePercent(1_145, 1_000)).toBe(15);
    expect(getSpendingChangePercent(855, 1_000)).toBe(-15);
    expect(getSpendingChangePercent(10_005, 10_000)).toBe(0);
    expect(getSpendingChangePercent(1_005, 1_000)).toBe(1);
    expect(getSpendingChangePercent(995, 1_000)).toBe(-1);
  });
});
