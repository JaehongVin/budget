import { useId, useState } from 'react';
import { TransactionItem } from '@/components/molecules/TransactionItem';
import { formatDateLabel } from '@/lib/date';
import { formatAmount } from '@/lib/formatAmount';
import { summarize } from '@/lib/transactions';
import type { Transaction } from '@/types/transaction';

const INITIAL_VISIBLE_COUNT = 2;

interface DayTransactionsProps {
  dateKey: string;
  isToday: boolean;
  //* 선택한 날의 거래만. 순서는 그대로 보여준다
  transactions: Transaction[];
}

const buildSummaryText = (transactions: Transaction[]) => {
  const { income, expense } = summarize(transactions);
  return [
    income > 0 && `입금 ${formatAmount(income)}`,
    expense > 0 && `지출 ${formatAmount(expense)}`,
  ]
    .filter(Boolean)
    .join(' · ');
};

//* Figma Selected day transactions — 날짜 16/700 · 오늘 배지 · 건수 11 · 요약 11 · 처음 2건 + "내역 N건 더 보기"
export const DayTransactions = ({
  dateKey,
  isToday,
  transactions,
}: DayTransactionsProps) => {
  const headingId = useId();
  //* 펼친 날짜를 기억해 날짜가 바뀌면 자동으로 접힌다
  const [expandedDateKey, setExpandedDateKey] = useState<string>();
  const isExpanded = expandedDateKey === dateKey;
  const visibleTransactions = isExpanded
    ? transactions
    : transactions.slice(0, INITIAL_VISIBLE_COUNT);
  const hiddenCount = transactions.length - visibleTransactions.length;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 px-24">
      <div className="flex items-center justify-between pb-8">
        <div className="flex items-center gap-8">
          <h2 id={headingId} className="font-bold text-16 text-content-primary">
            {formatDateLabel(dateKey)}
          </h2>
          {isToday && (
            <span className="rounded-6 bg-accent-subtle px-7 py-3 font-medium text-10 text-income">
              오늘
            </span>
          )}
        </div>
        {transactions.length > 0 && (
          <p className="font-medium text-11 text-content-secondary">
            {transactions.length}건
          </p>
        )}
      </div>
      {transactions.length === 0 ? (
        <p className="py-24 text-center font-medium text-13 text-content-muted">
          이 날은 내역이 없어요
        </p>
      ) : (
        <>
          <p className="font-medium text-11 text-content-secondary">
            {buildSummaryText(transactions)}
          </p>
          <ul>
            {visibleTransactions.map((transaction) => (
              <li key={transaction.id}>
                <TransactionItem transaction={transaction} />
              </li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpandedDateKey(dateKey)}
              className="min-h-44 font-bold text-12 text-accent focus-visible:outline-2 focus-visible:outline-accent"
            >
              내역 {hiddenCount}건 더 보기
            </button>
          )}
        </>
      )}
    </section>
  );
};
