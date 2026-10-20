import { formatAmount } from '@/lib/formatAmount';

interface IncomeExpenseSummaryProps {
  //* 원 단위 0 이상 정수
  income: number;
  expense: number;
}

//* Figma Monthly totals — 총 입금(파랑) | 구분선 H42 | 총 지출. 라벨 13/500 · 금액 19/700 · 간격 12
export const IncomeExpenseSummary = ({
  income,
  expense,
}: IncomeExpenseSummaryProps) => (
  <dl className="flex items-start gap-12">
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <dt className="font-medium text-13 text-content-secondary">총 입금</dt>
      <dd className="font-bold text-19 text-income">{formatAmount(income)}</dd>
    </div>
    <div aria-hidden="true" className="h-42 w-1 shrink-0 bg-border" />
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <dt className="font-medium text-13 text-content-secondary">총 지출</dt>
      <dd className="font-bold text-19 text-content-primary">
        {formatAmount(expense)}
      </dd>
    </div>
  </dl>
);
