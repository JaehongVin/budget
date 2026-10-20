import { Ellipsis } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { IncomeExpenseSummary } from '@/components/molecules/IncomeExpenseSummary';
import { cn } from '@/lib/cn';
import { formatBalance } from '@/lib/formatAmount';

interface BalanceCardProps {
  monthNumber: number;
  //* 원 단위 정수. 지출이 입금보다 많으면 음수
  balance: number;
  income: number;
  expense: number;
}

//* Figma Monthly balance card — 패딩 20 · 라운드 20 · 라벨 15/500 · 금액 32/700. ⋯ 는 동작 없는 자리표시 버튼
export const BalanceCard = ({
  monthNumber,
  balance,
  income,
  expense,
}: BalanceCardProps) => (
  <section
    aria-label={`${monthNumber}월 남은 돈`}
    className="flex flex-col gap-22 rounded-20 bg-surface p-20"
  >
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <p className="font-medium text-15 text-content-secondary">
          {monthNumber}월 남은 돈
        </p>
        <button
          type="button"
          aria-label="더보기"
          className="-m-12 flex size-44 items-center justify-center text-content-muted focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Icon icon={Ellipsis} size={20} />
        </button>
      </div>
      <p
        className={cn(
          'font-bold text-32',
          balance < 0 ? 'text-negative' : 'text-content-primary',
        )}
      >
        {formatBalance(balance)}
      </p>
    </div>
    <IncomeExpenseSummary income={income} expense={expense} />
  </section>
);
