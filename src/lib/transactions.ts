import type { DateRange } from '@/lib/date';
import {
  buildDateKey,
  getDaysInMonth,
  getMonthToDateRange,
  getPreviousMonthSamePeriod,
} from '@/lib/date';
import type { Transaction, TypeFilter } from '@/types/transaction';
import { TRANSACTION_TYPE, TYPE_FILTER } from '@/types/transaction';

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface DailyTotal {
  income: number;
  expense: number;
}

export interface DateGroup {
  date: string;
  transactions: Transaction[];
}

//* 남은 돈은 음수가 될 수 있다
export const summarize = (transactions: Transaction[]): Summary => {
  const income = sumAmount(transactions, TRANSACTION_TYPE.INCOME);
  const expense = sumAmount(transactions, TRANSACTION_TYPE.EXPENSE);
  return { income, expense, balance: income - expense };
};

const sumAmount = (transactions: Transaction[], type: Transaction['type']) =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((sum, { amount }) => sum + amount, 0);

//* YYYY-MM-DD 는 문자열 비교가 곧 날짜 비교다. 시작일·종료일 모두 포함한다
export const filterByDateRange = (
  transactions: Transaction[],
  { from, to }: DateRange,
) => transactions.filter(({ date }) => date >= from && date <= to);

export const filterByMonth = (transactions: Transaction[], monthKey: string) =>
  filterByDateRange(transactions, {
    from: buildDateKey(monthKey, 1),
    to: buildDateKey(monthKey, getDaysInMonth(monthKey)),
  });

export const getDailyTotals = (transactions: Transaction[]) => {
  const totals: Record<string, DailyTotal> = {};
  for (const { date, type, amount } of transactions) {
    const total = totals[date] ?? { income: 0, expense: 0 };
    totals[date] = { ...total, [type]: total[type] + amount };
  }
  return totals;
};

//* 최신 날짜가 먼저. 같은 날 안에서는 입력 순서를 유지한다 (Array.prototype.sort 는 stable)
export const groupByDate = (transactions: Transaction[]): DateGroup[] => {
  const groups = new Map<string, Transaction[]>();
  for (const transaction of transactions) {
    groups.set(transaction.date, [
      ...(groups.get(transaction.date) ?? []),
      transaction,
    ]);
  }
  return [...groups]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, grouped]) => ({ date, transactions: grouped }));
};

export const filterByType = (
  transactions: Transaction[],
  filter: TypeFilter,
) =>
  filter === TYPE_FILTER.ALL
    ? transactions
    : transactions.filter(({ type }) => type === filter);

export const getRecentTransactions = (
  transactions: Transaction[],
  count: number,
) =>
  groupByDate(transactions)
    .flatMap(({ transactions: grouped }) => grouped)
    .slice(0, count);

//* 증감률(%) 정수. 지난달이 0원이면 비교할 수 없어 null.
//* 정수 곱셈을 먼저 하고, .5 는 증가·감소 모두 0 에서 먼 쪽으로 올린다 (getBudgetUsage 와 같은 이유)
export const getSpendingChangePercent = (current: number, previous: number) => {
  if (previous === 0) return null;
  const difference = current - previous;
  const magnitude = Math.round((Math.abs(difference) * 100) / previous);
  //* + 0 으로 -0 을 0 에 맞춘다
  return (difference < 0 ? -magnitude : magnitude) + 0;
};

//* 이번 달 오늘까지 지출이 지난달 같은 기간 대비 몇 % 변했는지. 비교할 수 없으면 null
export const getMonthToDateSpendingChange = (
  transactions: Transaction[],
  todayKey: string,
) =>
  getSpendingChangePercent(
    summarize(filterByDateRange(transactions, getMonthToDateRange(todayKey)))
      .expense,
    summarize(
      filterByDateRange(transactions, getPreviousMonthSamePeriod(todayKey)),
    ).expense,
  );
