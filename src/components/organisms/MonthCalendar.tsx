import { CalendarDay } from '@/components/molecules/CalendarDay';
import { cn } from '@/lib/cn';
import {
  formatDateLabel,
  getDayOfMonth,
  getMonthGrid,
  toMonthKey,
  WEEKDAY_LABELS,
} from '@/lib/date';
import type { DailyTotal } from '@/lib/transactions';

const SUNDAY_INDEX = 0;
const SATURDAY_INDEX = 6;

interface MonthCalendarProps {
  monthKey: string;
  selectedDate: string;
  todayKey: string;
  //* 날짜 키별 합계. 거래 없는 날은 키가 없다
  dailyTotals: Record<string, DailyTotal>;
  //* 이웃 달 날짜도 그 날짜 키 그대로 넘긴다. 달 이동은 호출하는 쪽이 한다
  onSelectDate: (dateKey: string) => void;
}

//* Figma Month calendar 의 요일 머리 + 주 단위 그리드. 요일 머리 H26 · 일 빨강 · 토 파랑, 주 간격 2
export const MonthCalendar = ({
  monthKey,
  selectedDate,
  todayKey,
  dailyTotals,
  onSelectDate,
}: MonthCalendarProps) => (
  <table className="w-full table-fixed border-separate [border-spacing:0_2px]">
    <thead>
      <tr>
        {WEEKDAY_LABELS.map((label, index) => (
          <th
            key={label}
            scope="col"
            className={cn(
              'h-26 font-medium text-11 text-content-muted',
              index === SUNDAY_INDEX && 'text-negative',
              index === SATURDAY_INDEX && 'text-income',
            )}
          >
            {label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {getMonthGrid(monthKey).map((week) => (
        <tr key={week[0]}>
          {week.map((dateKey) => (
            <td key={dateKey} className="p-0">
              <CalendarDay
                day={getDayOfMonth(dateKey)}
                dateLabel={formatDateLabel(dateKey)}
                income={dailyTotals[dateKey]?.income}
                expense={dailyTotals[dateKey]?.expense}
                selected={dateKey === selectedDate}
                today={dateKey === todayKey}
                outsideMonth={toMonthKey(dateKey) !== monthKey}
                onSelect={() => onSelectDate(dateKey)}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
