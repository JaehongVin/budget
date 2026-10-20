import {
  buildDateKey,
  formatDateLabel,
  formatMonthTitle,
  getDayOfMonth,
  getDaysInMonth,
  getDefaultDateInMonth,
  getMonthGrid,
  getMonthNumber,
  getMonthToDateRange,
  getPreviousMonthSamePeriod,
  getTodayKey,
  isValidDateKey,
  isValidMonthKey,
  resolveCalendarSelection,
  shiftMonth,
  toDateKey,
  toMonthKey,
} from './date';

describe('toDateKey / getTodayKey', () => {
  it('로컬 날짜를 YYYY-MM-DD 로 만든다', () => {
    expect(toDateKey(new Date(2026, 8, 5, 23, 59))).toBe('2026-09-05');
  });

  it('자정 직후도 로컬 날짜 기준이다', () => {
    expect(toDateKey(new Date(2026, 0, 1, 0, 0))).toBe('2026-01-01');
  });

  it('getTodayKey 는 넘겨받은 시각의 로컬 날짜를 쓴다', () => {
    expect(getTodayKey(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31');
  });
});

describe('toMonthKey / getDayOfMonth / getMonthNumber / buildDateKey', () => {
  it('날짜 키에서 월 키를 뽑는다', () => {
    expect(toMonthKey('2026-09-15')).toBe('2026-09');
  });

  it('날짜 키에서 일을 뽑는다', () => {
    expect(getDayOfMonth('2026-09-05')).toBe(5);
  });

  it('월 키에서 월 숫자를 뽑는다', () => {
    expect(getMonthNumber('2026-09')).toBe(9);
  });

  it('월 키와 일로 날짜 키를 만든다', () => {
    expect(buildDateKey('2026-09', 5)).toBe('2026-09-05');
  });
});

describe('shiftMonth', () => {
  it('다음 달로 이동한다', () => {
    expect(shiftMonth('2026-09', 1)).toBe('2026-10');
  });

  it('12월에서 다음 달은 다음 해 1월이다', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });

  it('1월에서 이전 달은 전년 12월이다', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('여러 달을 한 번에 이동한다', () => {
    expect(shiftMonth('2026-11', 14)).toBe('2028-01');
  });

  it('0 이면 그대로다', () => {
    expect(shiftMonth('2026-09', 0)).toBe('2026-09');
  });
});

describe('getDaysInMonth', () => {
  it.each([
    ['2026-01', 31],
    ['2026-02', 28],
    ['2028-02', 29],
    ['2100-02', 28],
    ['2000-02', 29],
    ['2026-04', 30],
    ['2026-12', 31],
  ])('%s 은 %i일이다', (month, days) => {
    expect(getDaysInMonth(month)).toBe(days);
  });
});

describe('getMonthGrid', () => {
  it('일요일에 시작하는 28일짜리 달은 4주다', () => {
    const grid = getMonthGrid('2026-02');

    expect(grid).toHaveLength(4);
    expect(grid[0]?.[0]).toBe('2026-02-01');
    expect(grid[3]?.[6]).toBe('2026-02-28');
  });

  it('앞뒤를 이웃 달 날짜로 채운다 (2026년 9월)', () => {
    const grid = getMonthGrid('2026-09');

    expect(grid).toHaveLength(5);
    expect(grid[0]).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ]);
    expect(grid[4]).toEqual([
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
    ]);
  });

  it('31일이 토요일에 시작하면 6주가 된다 (2026년 8월)', () => {
    const grid = getMonthGrid('2026-08');

    expect(grid).toHaveLength(6);
    expect(grid[0]?.[0]).toBe('2026-07-26');
    expect(grid[0]?.[6]).toBe('2026-08-01');
    expect(grid[5]?.[1]).toBe('2026-08-31');
  });

  it('연도 경계를 넘어 채운다 (2026년 1월)', () => {
    const grid = getMonthGrid('2026-01');

    expect(grid[0]?.[0]).toBe('2025-12-28');
    expect(grid[0]?.[4]).toBe('2026-01-01');
  });

  it('윤년 2월 29일이 들어간다', () => {
    const days = getMonthGrid('2028-02').flat();

    expect(days).toContain('2028-02-29');
    expect(days.every((day) => day.length === 10)).toBe(true);
  });

  it('모든 주는 7일이다', () => {
    expect(getMonthGrid('2026-09').every((week) => week.length === 7)).toBe(
      true,
    );
  });
});

describe('formatMonthTitle / formatDateLabel', () => {
  it('월 제목을 "2026년 9월" 로 만든다', () => {
    expect(formatMonthTitle('2026-09')).toBe('2026년 9월');
  });

  it('월 앞의 0 은 붙이지 않는다', () => {
    expect(formatMonthTitle('2026-01')).toBe('2026년 1월');
  });

  it('날짜 라벨에 요일을 붙인다', () => {
    expect(formatDateLabel('2026-09-15')).toBe('9월 15일 화요일');
  });

  it('일요일과 토요일 라벨', () => {
    expect(formatDateLabel('2026-09-13')).toBe('9월 13일 일요일');
    expect(formatDateLabel('2026-09-19')).toBe('9월 19일 토요일');
  });

  it('윤일의 요일을 맞춘다', () => {
    expect(formatDateLabel('2028-02-29')).toBe('2월 29일 화요일');
  });
});

describe('isValidDateKey / isValidMonthKey', () => {
  it.each(['2026-09-15', '2028-02-29', '2026-12-31'])(
    '%s 은 유효하다',
    (key) => {
      expect(isValidDateKey(key)).toBe(true);
    },
  );

  it.each([
    '2026-02-29',
    '2026-02-30',
    '2026-13-01',
    '2026-00-10',
    '2026-09-00',
    '2026-9-5',
    '20260915',
    '',
    '2026-09',
    '0050-01-01',
  ])('%s 은 유효하지 않다', (key) => {
    expect(isValidDateKey(key)).toBe(false);
  });

  it('월 키 검증', () => {
    expect(isValidMonthKey('2026-09')).toBe(true);
    expect(isValidMonthKey('2026-12')).toBe(true);
    expect(isValidMonthKey('2026-13')).toBe(false);
    expect(isValidMonthKey('2026-00')).toBe(false);
    expect(isValidMonthKey('2026-9')).toBe(false);
    expect(isValidMonthKey('0050-01')).toBe(false);
    expect(isValidMonthKey('0000-12')).toBe(false);
    expect(isValidMonthKey('0100-01')).toBe(false);
    expect(isValidMonthKey('1000-01')).toBe(true);
    expect(isValidMonthKey('2026-09-01')).toBe(false);
  });
});

describe('getMonthToDateRange / getPreviousMonthSamePeriod', () => {
  it('이번 달 1일부터 오늘까지다', () => {
    expect(getMonthToDateRange('2026-09-15')).toEqual({
      from: '2026-09-01',
      to: '2026-09-15',
    });
  });

  it('지난달 같은 기간은 지난달 1일부터 같은 일자까지다', () => {
    expect(getPreviousMonthSamePeriod('2026-09-15')).toEqual({
      from: '2026-08-01',
      to: '2026-08-15',
    });
  });

  it('지난달에 그 일자가 없으면 지난달 말일까지로 자른다', () => {
    expect(getPreviousMonthSamePeriod('2026-10-31')).toEqual({
      from: '2026-09-01',
      to: '2026-09-30',
    });
    expect(getPreviousMonthSamePeriod('2026-03-30')).toEqual({
      from: '2026-02-01',
      to: '2026-02-28',
    });
  });

  it('1월이면 지난달은 전년 12월이다', () => {
    expect(getPreviousMonthSamePeriod('2026-01-10')).toEqual({
      from: '2025-12-01',
      to: '2025-12-10',
    });
  });
});

describe('연도 0~99 도 1900 년대로 바뀌지 않는다 (Date.UTC 회피)', () => {
  it('0100-01 에서 이전 달은 0099-12 다', () => {
    expect(shiftMonth('0100-01', -1)).toBe('0099-12');
  });

  it('0100년 1월 그리드는 0100 년 날짜로 채운다', () => {
    expect(getMonthGrid('0100-01').flat()).toContain('0100-01-31');
  });
});

describe('getDefaultDateInMonth', () => {
  it('그 달에 오늘이 있으면 오늘이다', () => {
    expect(getDefaultDateInMonth('2026-09', '2026-09-15')).toBe('2026-09-15');
  });

  it('그 달에 오늘이 없으면 1일이다', () => {
    expect(getDefaultDateInMonth('2026-08', '2026-09-15')).toBe('2026-08-01');
  });
});

describe('resolveCalendarSelection', () => {
  const TODAY = '2026-09-15';

  it('month 만 있고 이번 달이면 오늘을 선택한다', () => {
    expect(resolveCalendarSelection({ month: '2026-09' }, TODAY)).toEqual({
      monthKey: '2026-09',
      selectedDate: '2026-09-15',
    });
  });

  it('month 만 있고 다른 달이면 그 달 1일을 선택한다', () => {
    expect(resolveCalendarSelection({ month: '2026-08' }, TODAY)).toEqual({
      monthKey: '2026-08',
      selectedDate: '2026-08-01',
    });
  });

  it('date 만 있으면 그 날짜의 달을 표시하고 그 날짜를 선택한다', () => {
    expect(resolveCalendarSelection({ date: '2026-08-05' }, TODAY)).toEqual({
      monthKey: '2026-08',
      selectedDate: '2026-08-05',
    });
  });

  it('month 와 date 가 맞으면 그대로 쓴다', () => {
    expect(
      resolveCalendarSelection({ month: '2026-08', date: '2026-08-05' }, TODAY),
    ).toEqual({ monthKey: '2026-08', selectedDate: '2026-08-05' });
  });

  it('date 가 month 밖이면 month 를 따르고 그 달의 기본 날짜로 대신한다', () => {
    expect(
      resolveCalendarSelection({ month: '2026-08', date: '2026-09-15' }, TODAY),
    ).toEqual({ monthKey: '2026-08', selectedDate: '2026-08-01' });
  });

  it('둘 다 없으면 이번 달의 오늘이다', () => {
    expect(resolveCalendarSelection({}, TODAY)).toEqual({
      monthKey: '2026-09',
      selectedDate: '2026-09-15',
    });
  });
});
