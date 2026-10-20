import { render, screen } from '@testing-library/react';
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
});
