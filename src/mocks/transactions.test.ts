import {
  getMonthToDateRange,
  getPreviousMonthSamePeriod,
  shiftMonth,
  toMonthKey,
} from '@/lib/date';
import {
  filterByDateRange,
  filterByMonth,
  getDailyTotals,
  getRecentTransactions,
  getSpendingChangePercent,
  groupByDate,
  summarize,
} from '@/lib/transactions';
import { createMockTransactions } from './transactions';

const FIGMA_TODAY = '2026-09-15';
const FIGMA_DAILY_EXPENSE = [
  650_000, 58_000, 24_000, 42_000, 86_000, 18_000, 35_000, 120_000, 32_000,
  45_500, 19_000, 98_000, 125_000, 154_500, 70_500,
];

describe('createMockTransactions — 오늘이 2026-09-15 (Figma 시안)', () => {
  const transactions = createMockTransactions(FIGMA_TODAY);
  const september = filterByMonth(transactions, '2026-09');

  it('9월 총 입금·총 지출·남은 돈이 시안과 같다', () => {
    expect(summarize(september)).toEqual({
      income: 3_420_000,
      expense: 1_577_500,
      balance: 1_842_500,
    });
  });

  it('1일부터 15일까지 일별 지출이 시안과 같다', () => {
    const totals = getDailyTotals(september);

    FIGMA_DAILY_EXPENSE.forEach((expense, index) => {
      const date = `2026-09-${String(index + 1).padStart(2, '0')}`;
      expect(totals[date]?.expense, date).toBe(expense);
    });
  });

  it('입금은 15일 월급뿐이다', () => {
    const totals = getDailyTotals(september);
    const incomeDays = Object.entries(totals).filter(
      ([, { income }]) => income > 0,
    );

    expect(incomeDays).toEqual([
      ['2026-09-15', { income: 3_420_000, expense: 70_500 }],
    ]);
  });

  it('15일은 4건이고 시안의 순서와 같다', () => {
    const [today] = groupByDate(september);

    expect(today?.date).toBe('2026-09-15');
    expect(
      today?.transactions.map(
        ({ title, category, paymentMethod, amount, type }) => [
          title,
          category,
          paymentMethod,
          amount,
          type,
        ],
      ),
    ).toEqual([
      ['스타벅스', '카페', '신한카드', 5_500, 'expense'],
      ['월급', '급여', '국민은행', 3_420_000, 'income'],
      ['지하철 충전', '교통', '신한카드', 50_000, 'expense'],
      ['점심 식사', '식비', '신한카드', 15_000, 'expense'],
    ]);
  });

  it('14일은 이마트 1건이다', () => {
    const group = groupByDate(september).find(
      ({ date }) => date === '2026-09-14',
    );

    expect(group?.transactions).toHaveLength(1);
    expect(group?.transactions[0]).toMatchObject({
      title: '이마트',
      category: '장보기',
      paymentMethod: '신한카드',
      amount: 154_500,
    });
  });

  it('홈 최근 내역 3건은 스타벅스·월급·지하철 충전이다', () => {
    expect(
      getRecentTransactions(transactions, 3).map(({ title }) => title),
    ).toEqual(['스타벅스', '월급', '지하철 충전']);
  });

  it('지난달보다 12% 덜 쓴 것으로 계산된다', () => {
    const current = summarize(
      filterByDateRange(transactions, getMonthToDateRange(FIGMA_TODAY)),
    );
    const previous = summarize(
      filterByDateRange(transactions, getPreviousMonthSamePeriod(FIGMA_TODAY)),
    );

    expect(getSpendingChangePercent(current.expense, previous.expense)).toBe(
      -12,
    );
  });

  it('지난달은 지출이 입금보다 많아 남은 돈이 음수다', () => {
    expect(summarize(filterByMonth(transactions, '2026-08')).balance).toBe(
      -292_500,
    );
  });

  it('지난달에는 입금만 있는 날과 지출만 있는 날이 모두 있다', () => {
    const totals = Object.values(
      getDailyTotals(filterByMonth(transactions, '2026-08')),
    );

    expect(
      totals.some(({ income, expense }) => income > 0 && expense === 0),
    ).toBe(true);
    expect(
      totals.some(({ income, expense }) => income === 0 && expense > 0),
    ).toBe(true);
  });

  it('이번 달·지난달 밖의 거래는 없다', () => {
    const months = new Set(transactions.map(({ date }) => toMonthKey(date)));

    expect([...months].sort()).toEqual(['2026-08', '2026-09']);
  });
});

describe('createMockTransactions — 규칙', () => {
  it.each([
    '2026-09-15',
    '2026-10-21',
    '2026-10-05',
    '2026-01-03',
    '2026-03-31',
    '2028-03-01',
  ])('오늘(%s) 이후 날짜에는 거래가 없다', (today) => {
    const transactions = createMockTransactions(today);

    expect(transactions.every(({ date }) => date <= today)).toBe(true);
  });

  it('오늘이 15일 이후면 이번 달 합계가 시안과 같고 앞쪽 날짜가 비는 대신 상대 위치로 밀린다', () => {
    const today = '2026-10-21';
    const transactions = createMockTransactions(today);
    const october = filterByMonth(transactions, '2026-10');

    expect(summarize(october).expense).toBe(1_577_500);
    expect(getDailyTotals(october)['2026-10-21']).toEqual({
      income: 3_420_000,
      expense: 70_500,
    });
    expect(getDailyTotals(october)['2026-10-07']?.expense).toBe(650_000);
    expect(getDailyTotals(october)['2026-10-06']).toBeUndefined();
  });

  it('월 초라 날짜가 모자라면 그만큼 생략한다', () => {
    const transactions = createMockTransactions('2026-10-05');
    const october = filterByMonth(transactions, '2026-10');

    expect(getDailyTotals(october)['2026-10-05']).toEqual({
      income: 3_420_000,
      expense: 70_500,
    });
    expect(summarize(october).expense).toBeLessThan(1_577_500);
  });

  it('오늘이 1일이면 이번 달에는 오늘 거래만 남는다', () => {
    const october = filterByMonth(
      createMockTransactions('2026-10-01'),
      '2026-10',
    );

    expect(october.every(({ date }) => date === '2026-10-01')).toBe(true);
    expect(october).toHaveLength(4);
  });

  it('지난달 같은 기간 합계는 오늘이 15일 이후면 항상 1,792,500원이다', () => {
    for (const today of [
      '2026-09-15',
      '2026-10-21',
      '2026-10-31',
      '2026-03-31',
    ]) {
      const transactions = createMockTransactions(today);
      const previous = summarize(
        filterByDateRange(transactions, getPreviousMonthSamePeriod(today)),
      );

      expect(previous.expense, today).toBe(1_792_500);
    }
  });

  it('연도 경계: 1월이면 지난달은 전년 12월이다', () => {
    const transactions = createMockTransactions('2026-01-20');

    expect(
      filterByMonth(transactions, shiftMonth('2026-01', -1)).length,
    ).toBeGreaterThan(0);
    expect(transactions.some(({ date }) => date.startsWith('2025-12'))).toBe(
      true,
    );
  });

  it('모든 금액은 0 이상 정수이고 id 는 겹치지 않는다', () => {
    const transactions = createMockTransactions('2026-09-15');

    expect(
      transactions.every(
        ({ amount }) => Number.isInteger(amount) && amount >= 0,
      ),
    ).toBe(true);
    expect(new Set(transactions.map(({ id }) => id)).size).toBe(
      transactions.length,
    );
  });
});
