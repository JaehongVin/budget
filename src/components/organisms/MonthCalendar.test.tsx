import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthCalendar } from '@/components/organisms/MonthCalendar';

const DAILY_TOTALS = {
  '2026-09-15': { income: 3_420_000, expense: 70_500 },
  '2026-09-14': { income: 0, expense: 154_500 },
};

const renderCalendar = (
  props: Partial<Parameters<typeof MonthCalendar>[0]> = {},
) => {
  const onSelectDate = vi.fn();
  render(
    <MonthCalendar
      monthKey="2026-09"
      selectedDate="2026-09-15"
      todayKey="2026-09-15"
      dailyTotals={DAILY_TOTALS}
      onSelectDate={onSelectDate}
      {...props}
    />,
  );
  return { onSelectDate };
};

describe('MonthCalendar', () => {
  it('요일 머리를 일요일부터 보여준다', () => {
    renderCalendar();

    const labels = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(labels).toEqual(['일', '월', '화', '수', '목', '금', '토']);
  });

  it('일별 입금·지출 금액을 셀에 보여준다', () => {
    renderCalendar();

    expect(
      screen.getByRole('button', {
        name: '9월 15일 화요일, 입금 3,420,000원, 지출 70,500원',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '9월 14일 월요일, 지출 154,500원' }),
    ).toBeInTheDocument();
  });

  it('거래 없는 날은 금액 없이 날짜만 보여준다', () => {
    renderCalendar();

    expect(
      screen.getByRole('button', { name: '9월 16일 수요일' }),
    ).toBeInTheDocument();
  });

  it('선택한 날짜와 오늘을 표시한다', () => {
    renderCalendar({ selectedDate: '2026-09-14' });

    expect(screen.getByRole('button', { name: /^9월 14일/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /^9월 15일/ })).toHaveAttribute(
      'aria-current',
      'date',
    );
  });

  it('날짜를 누르면 그 날짜 키로 선택을 알린다', async () => {
    const user = userEvent.setup();
    const { onSelectDate } = renderCalendar();

    await user.click(screen.getByRole('button', { name: /^9월 14일/ }));

    expect(onSelectDate).toHaveBeenCalledWith('2026-09-14');
  });

  it('이웃 달 날짜를 누르면 그 달의 날짜 키로 선택을 알린다', async () => {
    const user = userEvent.setup();
    const { onSelectDate } = renderCalendar();

    //* 2026-09 그리드의 첫 주는 8/30, 8/31 로 시작하고 마지막 주는 10/1~10/3 으로 끝난다
    await user.click(screen.getByRole('button', { name: '8월 31일 월요일' }));
    await user.click(screen.getByRole('button', { name: '10월 3일 토요일' }));

    expect(onSelectDate).toHaveBeenNthCalledWith(1, '2026-08-31');
    expect(onSelectDate).toHaveBeenNthCalledWith(2, '2026-10-03');
  });

  it('이웃 달 날짜는 월이 포함된 이름이라 같은 숫자의 날짜와 구분된다', () => {
    renderCalendar();

    expect(
      screen.getByRole('button', { name: '9월 1일 화요일' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '10월 1일 목요일' }),
    ).toBeInTheDocument();
  });

  it('이웃 달 날짜에는 금액을 보여주지 않는다', () => {
    renderCalendar({
      dailyTotals: {
        ...DAILY_TOTALS,
        '2026-08-31': { income: 0, expense: 9_000 },
      },
    });

    expect(
      screen.queryByRole('button', { name: /9,000원/ }),
    ).not.toBeInTheDocument();
  });
});
