import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { useCounterStore } from './counterStore';

describe('App', () => {
  beforeEach(() => {
    useCounterStore.getState().reset();
  });

  it('버튼 클릭 시 count가 증가한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'count: 0' }));

    expect(
      screen.getByRole('button', { name: 'count: 1' }),
    ).toBeInTheDocument();
  });
});
