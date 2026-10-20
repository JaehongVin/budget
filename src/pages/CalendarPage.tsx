import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { CalendarDays } from 'lucide-react';
import { IncomeExpenseSummary } from '@/components/molecules/IncomeExpenseSummary';
import { MonthNavigator } from '@/components/molecules/MonthNavigator';
import { ScreenHeader } from '@/components/molecules/ScreenHeader';
import { DayTransactions } from '@/components/organisms/DayTransactions';
import { MonthCalendar } from '@/components/organisms/MonthCalendar';
import {
  getDefaultDateInMonth,
  getTodayKey,
  resolveCalendarSelection,
  toMonthKey,
} from '@/lib/date';
import {
  filterByDateRange,
  filterByMonth,
  getDailyTotals,
  summarize,
} from '@/lib/transactions';
import { transactionsQuery } from '@/queries/transactionQueries';

export const CalendarPage = () => {
  const search = useSearch({ from: '/calendar' });
  const navigate = useNavigate();
  const { data: transactions = [] } = useQuery(transactionsQuery());

  const todayKey = getTodayKey();
  const { monthKey, selectedDate } = resolveCalendarSelection(search, todayKey);

  const monthTransactions = filterByMonth(transactions, monthKey);
  const { income, expense } = summarize(monthTransactions);
  const selectedTransactions = filterByDateRange(transactions, {
    from: selectedDate,
    to: selectedDate,
  });

  const goTo = (month: string, date: string) =>
    navigate({ to: '/calendar', search: { month, date } });

  return (
    <>
      <ScreenHeader
        title="캘린더"
        icon={CalendarDays}
        iconLabel="캘린더 보기"
      />
      <div className="flex flex-col gap-16 py-20">
        <div className="px-24">
          <MonthNavigator
            monthKey={monthKey}
            onMonthChange={(month) =>
              goTo(month, getDefaultDateInMonth(month, todayKey))
            }
          >
            <button
              type="button"
              onClick={() => goTo(toMonthKey(todayKey), todayKey)}
              className="relative rounded-8 bg-surface px-12 py-5 font-medium text-12 text-content-secondary after:absolute after:-inset-y-8 after:inset-x-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-accent"
            >
              오늘
            </button>
          </MonthNavigator>
        </div>
        <section
          aria-label="월 달력"
          className="flex flex-col gap-10 bg-surface px-20 pt-16 pb-10"
        >
          <IncomeExpenseSummary income={income} expense={expense} />
          <div aria-hidden="true" className="h-1 bg-border" />
          <MonthCalendar
            monthKey={monthKey}
            selectedDate={selectedDate}
            todayKey={todayKey}
            dailyTotals={getDailyTotals(monthTransactions)}
            onSelectDate={(dateKey) => goTo(toMonthKey(dateKey), dateKey)}
          />
        </section>
        <DayTransactions
          dateKey={selectedDate}
          isToday={selectedDate === todayKey}
          transactions={selectedTransactions}
        />
      </div>
    </>
  );
};
