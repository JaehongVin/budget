import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import type { TransactionType } from '@/types/transaction';

const categoryIconVariants = cva(
  'flex size-42 shrink-0 items-center justify-center rounded-14',
  {
    variants: {
      type: {
        income: 'bg-accent-subtle text-income',
        expense: 'bg-surface-subtle text-content-secondary',
      },
    },
  },
);

const amountVariants = cva('shrink-0 font-bold text-15', {
  variants: {
    type: {
      income: 'text-income',
      expense: 'text-expense',
    },
  },
});

interface TransactionRowProps {
  type: TransactionType;
  title: string;
  description: string;
  //* 원 단위 0 이상 정수. 입금/지출은 type 으로 구분한다
  amount: number;
  icon: LucideIcon;
}

//* Figma DS/Transaction row — H70 · 아이콘 42 · 제목 15/700 · 금액 15/700
export const TransactionRow = ({
  type,
  title,
  description,
  amount,
  icon,
}: TransactionRowProps) => (
  <div className="flex h-70 items-center gap-12">
    <span className={cn(categoryIconVariants({ type }))}>
      <Icon icon={icon} size={20} />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <p className="truncate font-bold text-15 text-content-primary">{title}</p>
      <p className="truncate font-medium text-11 text-content-secondary">
        {description}
      </p>
    </div>
    <p className={cn(amountVariants({ type }))}>
      {formatAmount(amount, { sign: type })}
    </p>
  </div>
);
