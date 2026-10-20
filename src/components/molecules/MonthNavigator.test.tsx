import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonthNavigator } from './MonthNavigator';

describe('MonthNavigator', () => {
  it('월 제목을 "2026년 9월" 로 보여준다', () => {
    render(<MonthNavigator monthKey="2026-09" onMonthChange={() => {}} />);

    expect(screen.getByText('2026년 9월')).toBeInTheDocument();
  });

  it('이전 달 버튼은 한 달 앞 월 키로 onMonthChange 를 부른다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MonthNavigator monthKey="2026-09" onMonthChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: '이전 달' }));

    expect(handleChange).toHaveBeenCalledWith('2026-08');
  });

  it('다음 달 버튼은 한 달 뒤 월 키로 onMonthChange 를 부른다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MonthNavigator monthKey="2026-09" onMonthChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: '다음 달' }));

    expect(handleChange).toHaveBeenCalledWith('2026-10');
  });

  it('12월에서 다음 달은 다음 해 1월이다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MonthNavigator monthKey="2026-12" onMonthChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: '다음 달' }));

    expect(handleChange).toHaveBeenCalledWith('2027-01');
  });

  it('1월에서 이전 달은 전년 12월이다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<MonthNavigator monthKey="2026-01" onMonthChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: '이전 달' }));

    expect(handleChange).toHaveBeenCalledWith('2025-12');
  });

  it('오른쪽 슬롯을 그린다', () => {
    render(
      <MonthNavigator monthKey="2026-09" onMonthChange={() => {}}>
        <button type="button">오늘</button>
      </MonthNavigator>,
    );

    expect(screen.getByRole('button', { name: '오늘' })).toBeInTheDocument();
  });
});
