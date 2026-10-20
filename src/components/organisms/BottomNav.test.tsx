import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('세 개의 탭을 보여준다', () => {
    render(<BottomNav active="home" onSelect={() => {}} />);

    const nav = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('활성 탭에만 aria-current="page" 가 붙는다', () => {
    render(<BottomNav active="calendar" onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: '캘린더' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: '홈' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('탭을 누르면 그 탭의 키로 onSelect 가 호출된다', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<BottomNav active="home" onSelect={handleSelect} />);

    await user.click(screen.getByRole('button', { name: '내역' }));

    expect(handleSelect).toHaveBeenCalledWith('history');
  });
});
