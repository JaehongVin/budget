import { Link } from '@tanstack/react-router';
import { ChevronRight } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { TransactionItem } from '@/components/molecules/TransactionItem';
import type { Transaction } from '@/types/transaction';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

//* Figma Recent transactions — 패딩 위 18·아래 10·좌우 20 · 제목 18/700. 전체 보기는 내역 탭으로 이동한다
export const RecentTransactions = ({
  transactions,
}: RecentTransactionsProps) => (
  <section
    aria-label="최근 내역"
    className="flex flex-col gap-8 rounded-20 bg-surface px-20 pt-18 pb-10"
  >
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-18 text-content-primary">최근 내역</h2>
      <Link
        to="/history"
        className="-my-12 flex min-h-44 items-center gap-3 font-medium text-12 text-content-secondary focus-visible:outline-2 focus-visible:outline-accent"
      >
        전체 보기
        <Icon icon={ChevronRight} size={14} />
      </Link>
    </div>
    {transactions.length === 0 ? (
      <p className="py-24 text-center font-medium text-13 text-content-muted">
        아직 내역이 없어요
      </p>
    ) : (
      <ul>
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            <TransactionItem transaction={transaction} />
          </li>
        ))}
      </ul>
    )}
  </section>
);
