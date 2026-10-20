import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { InsightBanner } from '@/components/molecules/InsightBanner';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { BalanceCard } from '@/components/organisms/BalanceCard';
import { BudgetProgressCard } from '@/components/organisms/BudgetProgressCard';
import { RecentTransactions } from '@/components/organisms/RecentTransactions';
import { MONTHLY_BUDGET } from '@/lib/budget';
import {
  formatDateLabel,
  getMonthNumber,
  getMonthToDateRange,
  getPreviousMonthSamePeriod,
  getTodayKey,
  toMonthKey,
} from '@/lib/date';
import {
  filterByDateRange,
  filterByMonth,
  getRecentTransactions,
  getSpendingChangePercent,
  summarize,
} from '@/lib/transactions';
import { MOCK_USER_NAME } from '@/mocks/transactions';
import { transactionsQuery } from '@/queries/transactionQueries';

const RECENT_COUNT = 3;

export const HomePage = () => {
  const { data: transactions = [] } = useQuery(transactionsQuery());
  const today = getTodayKey();
  const monthNumber = getMonthNumber(toMonthKey(today));

  const { income, expense, balance } = summarize(
    filterByMonth(transactions, toMonthKey(today)),
  );
  const changePercent = getSpendingChangePercent(
    summarize(filterByDateRange(transactions, getMonthToDateRange(today)))
      .expense,
    summarize(
      filterByDateRange(transactions, getPreviousMonthSamePeriod(today)),
    ).expense,
  );

  return (
    <>
      <ScreenHeader title="내 가계부" icon={Bell} iconLabel="알림" />
      <div className="flex flex-col gap-16 px-20 pt-22 pb-24">
        <div className="flex items-center justify-between">
          <p className="font-medium text-15 text-content-secondary">
            {MOCK_USER_NAME}님, 반가워요
          </p>
          <p className="font-medium text-11 text-content-muted">
            {formatDateLabel(today)}
          </p>
        </div>
        <BalanceCard
          monthNumber={monthNumber}
          balance={balance}
          income={income}
          expense={expense}
        />
        <BudgetProgressCard
          title={`${monthNumber}월 생활비 예산`}
          spent={expense}
          limit={MONTHLY_BUDGET}
        />
        <RecentTransactions
          transactions={getRecentTransactions(
            filterByMonth(transactions, toMonthKey(today)),
            RECENT_COUNT,
          )}
        />
        <InsightBanner changePercent={changePercent} />
      </div>
    </>
  );
};
