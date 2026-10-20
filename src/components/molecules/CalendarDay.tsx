import { cva } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';

//* Figma DS/Calendar day — default / selected / today / outside month
const dayNumberVariants = cva(
  'flex size-28 items-center justify-center rounded-full font-medium text-13 text-content-primary',
  {
    variants: {
      today: {
        true: 'bg-accent-subtle font-bold text-accent',
      },
      selected: {
        true: 'bg-accent font-bold text-content-on-accent',
      },
      outsideMonth: {
        true: 'text-content-muted',
      },
    },
    compoundVariants: [
      //* 오늘을 선택하면 선택 스타일이 이긴다
      {
        today: true,
        selected: true,
        class: 'bg-accent text-content-on-accent',
      },
    ],
  },
);

interface CalendarDayProps {
  day: number;
  //* 이웃 달 날짜가 같은 숫자와 구분되도록 월이 들어간 전체 날짜 (예: '10월 1일 목요일')
  dateLabel: string;
  //* 원 단위 0 이상 정수. 0 이거나 없으면 그 줄을 표시하지 않는다
  income?: number;
  expense?: number;
  selected?: boolean;
  today?: boolean;
  outsideMonth?: boolean;
  onSelect?: () => void;
}

const buildLabel = (dateLabel: string, income: number, expense: number) =>
  [
    dateLabel,
    income > 0 && `입금 ${formatAmount(income)}`,
    expense > 0 && `지출 ${formatAmount(expense)}`,
  ]
    .filter(Boolean)
    .join(', ');

//* 셀 H64 · 날짜 28 · 입금 파랑 / 지출 회색
export const CalendarDay = ({
  day,
  dateLabel,
  income = 0,
  expense = 0,
  selected = false,
  today = false,
  outsideMonth = false,
  onSelect,
}: CalendarDayProps) => {
  const visibleIncome = outsideMonth ? 0 : income;
  const visibleExpense = outsideMonth ? 0 : expense;

  return (
    <button
      type="button"
      aria-label={buildLabel(dateLabel, visibleIncome, visibleExpense)}
      aria-pressed={selected}
      aria-current={today ? 'date' : undefined}
      onClick={onSelect}
      className="flex h-64 w-full flex-col items-center gap-3 rounded-8 focus-visible:outline-2 focus-visible:outline-accent"
    >
      {/* variant 가 기본 색·굵기를 덮어쓰므로 cn 으로 충돌을 정리해야 한다 */}
      <span
        className={cn(dayNumberVariants({ today, selected, outsideMonth }))}
      >
        {day}
      </span>
      {visibleIncome > 0 && (
        <span className="font-medium text-8 text-income">
          {formatAmount(visibleIncome, { sign: 'income', unit: false })}
        </span>
      )}
      {visibleExpense > 0 && (
        <span className="font-medium text-8 text-content-secondary">
          {formatAmount(visibleExpense, { sign: 'expense', unit: false })}
        </span>
      )}
    </button>
  );
};
