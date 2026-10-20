const DAYS_PER_WEEK = 7;
const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_KEY_PATTERN = /^(\d{4})-(\d{2})$/;

export const WEEKDAY_LABELS = [
  '일',
  '월',
  '화',
  '수',
  '목',
  '금',
  '토',
] as const;

export interface DateRange {
  from: string;
  to: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

//* 날짜 계산은 UTC 로 한다. 로컬 타임존의 DST 가 날짜를 하루 밀지 못하게 한다
const parseMonthKey = (monthKey: string) => {
  const [year = 0, month = 0] = monthKey.split('-').map(Number);
  return { year, month };
};

const toUtcKey = (utc: Date) =>
  `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;

const parseDateKey = (dateKey: string) => {
  const [year = 0, month = 0, day = 0] = dateKey.split('-').map(Number);
  return { year, month, day };
};

//* 로컬 타임존 기준 날짜. toISOString() 은 UTC 라서 자정 근처에 하루가 어긋난다
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getTodayKey = (now = new Date()) => toDateKey(now);

export const toMonthKey = (dateKey: string) => dateKey.slice(0, 7);

export const getDayOfMonth = (dateKey: string) => parseDateKey(dateKey).day;

export const getMonthNumber = (monthKey: string) =>
  parseMonthKey(monthKey).month;

export const buildDateKey = (monthKey: string, day: number) =>
  `${monthKey}-${pad(day)}`;

export const shiftMonth = (monthKey: string, delta: number) => {
  const { year, month } = parseMonthKey(monthKey);
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}`;
};

export const getDaysInMonth = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

//* 일요일 시작. 앞뒤는 이웃 달 날짜로 채우고, 주 수는 달마다 4~6주다
export const getMonthGrid = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  const leadingDays = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const weekCount = Math.ceil(
    (leadingDays + getDaysInMonth(monthKey)) / DAYS_PER_WEEK,
  );

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, weekday) =>
      toUtcKey(
        new Date(
          Date.UTC(
            year,
            month - 1,
            1 - leadingDays + week * DAYS_PER_WEEK + weekday,
          ),
        ),
      ),
    ),
  );
};

export const formatMonthTitle = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  return `${year}년 ${month}월`;
};

export const formatDateLabel = (dateKey: string) => {
  const { year, month, day } = parseDateKey(dateKey);
  const weekday =
    WEEKDAY_LABELS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
};

export const isValidDateKey = (value: string) => {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const { year, month, day } = parseDateKey(value);
  //* 2월 30일 같은 값은 Date 가 3월로 넘겨 버리므로 되돌려 비교한다
  return toUtcKey(new Date(Date.UTC(year, month - 1, day))) === value;
};

export const isValidMonthKey = (value: string) => {
  if (!MONTH_KEY_PATTERN.test(value)) return false;
  const { month } = parseMonthKey(value);
  return month >= 1 && month <= 12;
};

export const getMonthToDateRange = (todayKey: string): DateRange => ({
  from: buildDateKey(toMonthKey(todayKey), 1),
  to: todayKey,
});

//* 오늘이 31일인데 지난달이 30일까지면 지난달 말일까지로 자른다
export const getPreviousMonthSamePeriod = (todayKey: string): DateRange => {
  const previousMonth = shiftMonth(toMonthKey(todayKey), -1);
  const lastDay = Math.min(
    getDayOfMonth(todayKey),
    getDaysInMonth(previousMonth),
  );
  return {
    from: buildDateKey(previousMonth, 1),
    to: buildDateKey(previousMonth, lastDay),
  };
};
