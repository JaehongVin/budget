import { calendarSearchSchema, historySearchSchema } from './searchSchemas';

describe('calendarSearchSchema', () => {
  it('유효한 month 와 date 는 그대로 통과한다', () => {
    expect(
      calendarSearchSchema.parse({ month: '2026-09', date: '2026-09-15' }),
    ).toEqual({ month: '2026-09', date: '2026-09-15' });
  });

  it('값이 없으면 비어 있다 (기본값은 페이지가 오늘 기준으로 채운다)', () => {
    expect(calendarSearchSchema.parse({})).toEqual({});
  });

  it.each([
    ['형식이 틀린 month', { month: '2026-9' }],
    ['없는 달', { month: '2026-13' }],
    ['숫자가 들어온 month', { month: 202609 }],
    ['날짜 형식의 month', { month: '2026-09-01' }],
    ['0050년 month', { month: '0050-01' }],
  ])('%s 는 버린다', (_, input) => {
    expect(calendarSearchSchema.parse(input).month).toBeUndefined();
  });

  it.each([
    ['없는 날', { date: '2026-02-30' }],
    ['형식이 틀린 date', { date: '2026/09/15' }],
    ['월 형식의 date', { date: '2026-09' }],
    ['null', { date: null }],
    ['0050년 date', { date: '0050-01-01' }],
  ])('%s 는 버린다', (_, input) => {
    expect(calendarSearchSchema.parse(input).date).toBeUndefined();
  });

  it('한쪽이 틀려도 다른 쪽은 살린다', () => {
    expect(
      calendarSearchSchema.parse({ month: 'bad', date: '2026-09-15' }),
    ).toEqual({ month: undefined, date: '2026-09-15' });
  });

  it('윤일은 유효하다', () => {
    expect(calendarSearchSchema.parse({ date: '2028-02-29' }).date).toBe(
      '2028-02-29',
    );
  });
});

describe('historySearchSchema', () => {
  it.each(['all', 'income', 'expense'])('type=%s 는 통과한다', (type) => {
    expect(historySearchSchema.parse({ type }).type).toBe(type);
  });

  it('type 이 없으면 비어 있다', () => {
    expect(historySearchSchema.parse({}).type).toBeUndefined();
  });

  it.each(['category', 'INCOME', '', 1, null])(
    '알 수 없는 type(%s)은 버린다',
    (type) => {
      expect(historySearchSchema.parse({ type }).type).toBeUndefined();
    },
  );

  it('month 검증은 캘린더와 같다', () => {
    expect(historySearchSchema.parse({ month: '2026-12' }).month).toBe(
      '2026-12',
    );
    expect(
      historySearchSchema.parse({ month: '2026-00' }).month,
    ).toBeUndefined();
  });
});
