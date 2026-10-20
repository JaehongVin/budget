const DAYS_PER_WEEK = 7;
//* 연도는 1000~9999 만 받는다. 0050 같은 값은 URL 오타일 뿐이고 표시·계산이 어긋난다
const DATE_KEY_PATTERN = /^([1-9]\d{3})-(\d{2})-(\d{2})$/;
const MONTH_KEY_PATTERN = /^([1-9]\d{3})-(\d{2})$/;

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

const parseMonthKey = (monthKey: string) => {
  const [year = 0, month = 0] = monthKey.split('-').map(Number);
  return { year, month };
};

//* 날짜 계산은 UTC 로 한다. 로컬 타임존의 DST 가 날짜를 하루 밀지 못하게 한다.
//* Date.UTC 는 연도 0~99 를 1900 년대로 바꾸므로 setUTCFullYear 로 만든다
const utcDate = (year: number, monthIndex: number, day: number) => {
  const date = new Date(0);
  date.setUTCFullYear(year, monthIndex, day);
  return date;
};

const toUtcKey = (utc: Date) =>
  `${String(utc.getUTCFullYear()).padStart(4, '0')}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;

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
  const shifted = utcDate(year, month - 1 + delta, 1);
  return `${String(shifted.getUTCFullYear()).padStart(4, '0')}-${pad(shifted.getUTCMonth() + 1)}`;
};

export const getDaysInMonth = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  return utcDate(year, month, 0).getUTCDate();
};

//* 일요일 시작. 앞뒤는 이웃 달 날짜로 채우고, 주 수는 달마다 4~6주다
export const getMonthGrid = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  const leadingDays = utcDate(year, month - 1, 1).getUTCDay();
  const weekCount = Math.ceil(
    (leadingDays + getDaysInMonth(monthKey)) / DAYS_PER_WEEK,
  );

  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: DAYS_PER_WEEK }, (_, weekday) =>
      toUtcKey(
        utcDate(
          year,
          month - 1,
          1 - leadingDays + week * DAYS_PER_WEEK + weekday,
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
  const weekday = WEEKDAY_LABELS[utcDate(year, month - 1, day).getUTCDay()];
  return `${month}월 ${day}일 ${weekday}요일`;
};

export const isValidDateKey = (value: string) => {
  if (!DATE_KEY_PATTERN.test(value)) return false;
  const { year, month, day } = parseDateKey(value);
  //* 2월 30일 같은 값은 Date 가 3월로 넘겨 버리므로 되돌려 비교한다
  return toUtcKey(utcDate(year, month - 1, day)) === value;
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

//* 월을 옮기면 그 달에 오늘이 있을 때 오늘, 없으면 1일을 고른다
export const getDefaultDateInMonth = (monthKey: string, todayKey: string) =>
  toMonthKey(todayKey) === monthKey ? todayKey : buildDateKey(monthKey, 1);

interface CalendarSearch {
  month?: string;
  date?: string;
}

//* month 가 우선이고, 없으면 date 의 달, 둘 다 없으면 이번 달.
//* date 가 표시할 달 밖이면 URL 이 어긋난 것이라 그 달의 기본 날짜로 대신한다
export const resolveCalendarSelection = (
  { month, date }: CalendarSearch,
  todayKey: string,
) => {
  const monthKey = month ?? toMonthKey(date ?? todayKey);
  const selectedDate =
    date && toMonthKey(date) === monthKey
      ? date
      : getDefaultDateInMonth(monthKey, todayKey);
  return { monthKey, selectedDate };
};
