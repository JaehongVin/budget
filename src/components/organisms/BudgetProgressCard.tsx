import { ProgressBar } from '@/components/atoms/ProgressBar';
import { BudgetFeedback } from '@/components/molecules/BudgetFeedback';
import { getBudgetUsage } from '@/lib/budget';
import { formatAmount } from '@/lib/formatAmount';

interface BudgetProgressCardProps {
  title: string;
  //* 원 단위 0 이상 정수
  spent: number;
  limit: number;
}

const OVER_BUDGET_MESSAGE = '예산을 초과했어요 · 100% 이상';

//* Figma DS/Budget progress card — 사용률·남은 금액·초과 여부는 spent/limit 에서 파생한다
export const BudgetProgressCard = ({
  title,
  spent,
  limit,
}: BudgetProgressCardProps) => {
  const { percent, progress, remaining, isOver } = getBudgetUsage(spent, limit);

  return (
    <section
      aria-label={title}
      className="flex flex-col gap-14 rounded-20 bg-surface p-20"
    >
      <div className="flex items-start justify-between font-bold">
        <p className="text-15 text-content-primary">{title}</p>
        <p className="text-13 text-accent">{percent}% 사용</p>
      </div>
      <ProgressBar value={progress} label={`${title} 사용률`} />
      <div className="flex items-start justify-between text-12">
        <p className="font-medium text-content-secondary">
          {formatAmount(spent, { unit: false })} / {formatAmount(limit)}
        </p>
        <p className="font-bold text-accent">{formatAmount(remaining)} 남음</p>
      </div>
      {isOver && <BudgetFeedback message={OVER_BUDGET_MESSAGE} />}
    </section>
  );
};
