import { TransactionRow } from '@/components/molecules/TransactionRow';
import { getCategoryIcon } from '@/lib/categoryIcon';
import { formatDateLabel } from '@/lib/date';
import type { DateGroup } from '@/lib/transactions';

interface TransactionGroupListProps {
  groups: DateGroup[];
  todayKey: string;
  //* 그룹이 하나도 없을 때 보여줄 문구
  emptyMessage: string;
}

const TODAY_SUFFIX = ' · 오늘';

//* Figma Transaction list — 카드 radius 20 · 패딩 16/16/10 · 날짜 머리 12/700 + 건수 11/500
export const TransactionGroupList = ({
  groups,
  todayKey,
  emptyMessage,
}: TransactionGroupListProps) => {
  if (groups.length === 0) {
    return (
      <p className="rounded-20 bg-surface px-16 py-40 text-center font-medium text-14 text-content-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-20 bg-surface px-16 pt-16 pb-10">
      {groups.map(({ date, transactions }) => {
        const headingId = `date-group-${date}`;
        return (
          <section
            key={date}
            aria-labelledby={headingId}
            className="flex flex-col gap-2 not-first:pt-15"
          >
            <div className="flex justify-between pb-6">
              <p
                id={headingId}
                className="font-bold text-12 text-content-secondary"
              >
                {formatDateLabel(date)}
                {date === todayKey && TODAY_SUFFIX}
              </p>
              <p className="font-medium text-11 text-content-muted">
                {transactions.length}건
              </p>
            </div>
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                type={transaction.type}
                title={transaction.title}
                description={`${transaction.category} · ${transaction.paymentMethod}`}
                amount={transaction.amount}
                icon={getCategoryIcon(transaction.category)}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
};
