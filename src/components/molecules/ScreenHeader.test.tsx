import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bell } from 'lucide-react';
import { ScreenHeader } from './ScreenHeader';

describe('ScreenHeader', () => {
  it('제목을 h1 으로, 아이콘 버튼을 aria-label 로 노출한다', () => {
    render(<ScreenHeader title="내 가계부" icon={Bell} iconLabel="알림" />);

    expect(
      screen.getByRole('heading', { level: 1, name: '내 가계부' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  });

  it('아이콘 버튼을 누르면 onIconClick 이 불린다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ScreenHeader
        title="내 가계부"
        icon={Bell}
        iconLabel="알림"
        onIconClick={handleClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: '알림' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('onIconClick 이 없어도 눌러도 에러가 나지 않는다', async () => {
    const user = userEvent.setup();
    render(<ScreenHeader title="내 가계부" icon={Bell} iconLabel="알림" />);

    await user.click(screen.getByRole('button', { name: '알림' }));

    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  });
});
