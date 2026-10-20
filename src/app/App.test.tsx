import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';

describe('App (DS 미리보기)', () => {
  it('필터 칩을 누르면 선택이 바뀐다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('radio', { name: '지출' }));

    expect(screen.getByRole('radio', { name: '지출' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '전체' })).not.toBeChecked();
  });

  it('다른 달 날짜를 누르면 그 달로 이동한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '1일' }));

    expect(screen.getByText('10월')).toBeInTheDocument();
  });

  it('하단 탭을 누르면 활성 탭이 바뀐다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: '캘린더' }));

    expect(screen.getByRole('button', { name: '캘린더' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
