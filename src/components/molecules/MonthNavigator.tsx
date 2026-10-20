import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/atoms/Icon';
import { formatMonthTitle, shiftMonth } from '@/lib/date';

interface MonthNavigatorProps {
  monthKey: string;
  onMonthChange: (monthKey: string) => void;
  //* 오른쪽 슬롯. 캘린더는 "오늘" 버튼, 내역은 필터 설정 아이콘
  children?: ReactNode;
}

const arrowButtonClass =
  '-m-13 flex size-44 items-center justify-center text-content-secondary focus-visible:outline-2 focus-visible:outline-accent';

//* Figma Month controls — 화살표 17 · 제목 20/700 · 간격 14. 화살표는 터치 타깃 44 로 키우고 음수 마진으로 시각 위치를 맞춘다
export const MonthNavigator = ({
  monthKey,
  onMonthChange,
  children,
}: MonthNavigatorProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-14">
      <button
        type="button"
        aria-label="이전 달"
        onClick={() => onMonthChange(shiftMonth(monthKey, -1))}
        className={arrowButtonClass}
      >
        <Icon icon={ChevronLeft} size={17} />
      </button>
      <p aria-live="polite" className="font-bold text-20 text-content-primary">
        {formatMonthTitle(monthKey)}
      </p>
      <button
        type="button"
        aria-label="다음 달"
        onClick={() => onMonthChange(shiftMonth(monthKey, 1))}
        className={arrowButtonClass}
      >
        <Icon icon={ChevronRight} size={17} />
      </button>
    </div>
    {children}
  </div>
);
