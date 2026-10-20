import { IncomeExpenseSummary } from '@/components/molecules/IncomeExpenseSummary';
import { cn } from '@/lib/cn';
import { formatBalance } from '@/lib/formatAmount';

interface MonthlySummaryCardProps {
  //* 원 단위 0 이상 정수
  income: number;
  expense: number;
  //* 입금 − 지출. 음수가 될 수 있다
  balance: number;
}

//* Figma Monthly summary — 카드 radius 20 · 패딩 20 · 남은 돈 행 radius 8 (패딩 12/9)
export const MonthlySummaryCard = ({
  income,
  expense,
  balance,
}: MonthlySummaryCardProps) => (
  <section
    aria-label="월 합계"
    className="flex flex-col gap-16 rounded-20 bg-surface p-20"
  >
    <IncomeExpenseSummary income={income} expense={expense} />
    <dl className="flex justify-between rounded-8 bg-surface-subtle px-12 py-9">
      <dt className="font-medium text-12 text-content-secondary">남은 돈</dt>
      <dd
        className={cn(
          'font-bold text-14',
          balance < 0 ? 'text-negative' : 'text-content-primary',
        )}
      >
        {formatBalance(balance)}
      </dd>
    </dl>
  </section>
);
