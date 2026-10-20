import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarDay } from './CalendarDay';

describe('CalendarDay', () => {
  it('날짜와 입금·지출 합계를 접근 가능한 이름으로 읽어준다', () => {
    render(<CalendarDay day={15} income={3420000} expense={70500} />);

    expect(
      screen.getByRole('button', {
        name: '15일, 입금 3,420,000원, 지출 70,500원',
      }),
    ).toBeInTheDocument();
  });

  it('입금·지출 금액을 기호와 함께 표시한다', () => {
    render(<CalendarDay day={15} income={3420000} expense={70500} />);

    expect(screen.getByText('+3,420,000')).toBeInTheDocument();
    expect(screen.getByText('−70,500')).toBeInTheDocument();
  });

  it('금액이 0 이거나 없으면 그 줄을 표시하지 않는다', () => {
    render(<CalendarDay day={14} income={0} expense={154500} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '14일, 지출 154,500원' }),
    ).toBeInTheDocument();
  });

  it('누르면 onSelect 가 호출된다', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<CalendarDay day={14} onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: '14일' }));

    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it('선택 상태를 aria-pressed 로 알린다', () => {
    render(<CalendarDay day={15} selected />);

    expect(screen.getByRole('button', { name: '15일' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('오늘은 aria-current="date" 로 알린다', () => {
    render(<CalendarDay day={15} today />);

    expect(screen.getByRole('button', { name: '15일' })).toHaveAttribute(
      'aria-current',
      'date',
    );
  });

  it('이번 달이 아닌 날짜도 누르면 onSelect 가 호출된다 (그 달로 이동은 호출하는 쪽 책임)', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<CalendarDay day={1} outsideMonth onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: '1일' }));

    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it('이번 달이 아닌 날짜는 금액을 표시하지 않는다', () => {
    render(<CalendarDay day={1} outsideMonth expense={5000} />);

    expect(screen.queryByText('−5,000')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1일' })).toBeInTheDocument();
  });
});
