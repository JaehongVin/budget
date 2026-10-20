import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { AppProviders } from './providers';

describe('App', () => {
  it('홈 화면에서 시작해 탭으로 캘린더와 내역으로 이동한다', async () => {
    const user = userEvent.setup();
    render(
      <AppProviders>
        <App />
      </AppProviders>,
    );

    expect(
      await screen.findByRole('heading', { name: '내 가계부' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '캘린더' }));
    expect(
      await screen.findByRole('heading', { name: '캘린더' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: '내역' }));
    expect(
      await screen.findByRole('heading', { name: '입금·지출 내역' }),
    ).toBeInTheDocument();
  });
});
