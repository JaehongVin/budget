import { TransactionRow } from '@/components/molecules/TransactionRow';
import { getCategoryIcon } from '@/lib/categoryIcon';
import type { Transaction } from '@/types/transaction';

interface TransactionItemProps {
  transaction: Transaction;
}

//* Transaction 을 TransactionRow 의 표시용 props 로 바꾼다
export const TransactionItem = ({
  transaction: { type, title, category, paymentMethod, amount },
}: TransactionItemProps) => (
  <TransactionRow
    type={type}
    title={title}
    description={`${category} · ${paymentMethod}`}
    amount={amount}
    icon={getCategoryIcon(category)}
  />
);
