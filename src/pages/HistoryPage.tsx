import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { FilterChipGroup } from '@/components/molecules/FilterChipGroup';
import { MonthNavigator } from '@/components/molecules/MonthNavigator';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { MonthlySummaryCard } from '@/components/organisms/MonthlySummaryCard';
import { TransactionGroupList } from '@/components/organisms/TransactionGroupList';
import { getTodayKey, toMonthKey } from '@/lib/date';
import {
  filterByMonth,
  filterByType,
  groupByDate,
  summarize,
} from '@/lib/transactions';
import { transactionsQuery } from '@/queries/transactionQueries';
import { TYPE_FILTER } from '@/types/transaction';

const CATEGORY_CHIP = 'category';

const FILTER_OPTIONS = [
  { value: TYPE_FILTER.ALL, label: '전체' },
  { value: TYPE_FILTER.INCOME, label: '입금' },
  { value: TYPE_FILTER.EXPENSE, label: '지출' },
  { value: CATEGORY_CHIP, label: '카테고리⌄', disabled: true },
] as const;

const EMPTY_MONTH_MESSAGE = '이 달에는 내역이 없어요';

const EMPTY_FILTER_MESSAGE = {
  [TYPE_FILTER.ALL]: EMPTY_MONTH_MESSAGE,
  [TYPE_FILTER.INCOME]: '입금 내역이 없어요',
  [TYPE_FILTER.EXPENSE]: '지출 내역이 없어요',
} as const;

export const HistoryPage = () => {
  const todayKey = getTodayKey();
  const search = useSearch({ from: '/history' });
  const navigate = useNavigate();
  const { data: transactions = [] } = useQuery(transactionsQuery());

  const monthKey = search.month ?? toMonthKey(todayKey);
  const type = search.type ?? TYPE_FILTER.ALL;

  const monthTransactions = filterByMonth(transactions, monthKey);
  const { income, expense, balance } = summarize(monthTransactions);
  const groups = groupByDate(filterByType(monthTransactions, type));
  const emptyMessage =
    monthTransactions.length === 0
      ? EMPTY_MONTH_MESSAGE
      : EMPTY_FILTER_MESSAGE[type];

  return (
    <>
      <ScreenHeader title="입금·지출 내역" icon={Search} iconLabel="검색" />
      <div className="flex flex-col gap-18 p-20">
        <MonthNavigator
          monthKey={monthKey}
          onMonthChange={(month) =>
            navigate({ to: '/history', search: (prev) => ({ ...prev, month }) })
          }
        >
          <button
            type="button"
            aria-label="필터 설정"
            className="-mr-12 flex size-44 items-center justify-center text-content-secondary focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon icon={SlidersHorizontal} size={20} />
          </button>
        </MonthNavigator>
        <MonthlySummaryCard
          income={income}
          expense={expense}
          balance={balance}
        />
        <FilterChipGroup
          label="내역 종류"
          options={FILTER_OPTIONS}
          value={type}
          onValueChange={(next) => {
            if (next === CATEGORY_CHIP) return;
            navigate({
              to: '/history',
              search: (prev) => ({ ...prev, type: next }),
            });
          }}
        />
        <TransactionGroupList
          groups={groups}
          todayKey={todayKey}
          emptyMessage={emptyMessage}
        />
        <Button>
          <Icon icon={Plus} size={18} />
          내역 추가
        </Button>
      </div>
    </>
  );
};
