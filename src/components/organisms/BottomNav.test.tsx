import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/renderRoute';

describe('BottomNav', () => {
  it('세 개의 탭 링크를 보여준다', async () => {
    await renderRoute('/');

    const nav = await screen.findByRole('navigation', { name: '주요 메뉴' });
    expect(nav).toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(3);
  });

  it('현재 경로의 탭에만 aria-current="page" 가 붙는다', async () => {
    await renderRoute('/calendar');

    expect(await screen.findByRole('link', { name: '캘린더' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute(
      'aria-current',
    );
    expect(screen.getByRole('link', { name: '내역' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('홈 탭은 /history 에서 활성이 아니다', async () => {
    await renderRoute('/history');

    expect(await screen.findByRole('link', { name: '내역' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: '홈' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('쿼리스트링이 있어도 그 경로의 탭이 활성이다', async () => {
    await renderRoute('/calendar?month=2026-08');

    expect(await screen.findByRole('link', { name: '캘린더' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('탭을 누르면 그 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/');

    await user.click(await screen.findByRole('link', { name: '내역' }));

    expect(router.state.location.pathname).toBe('/history');
    expect(
      await screen.findByRole('heading', { name: '입금·지출 내역' }),
    ).toBeInTheDocument();
  });
});
