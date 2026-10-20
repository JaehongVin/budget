import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/renderRoute';

describe('HistoryPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 8, 15, 12), toFake: ['Date'] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('제목 h1 이 하나이고 이번 달 합계와 남은 돈을 보여준다', async () => {
    await renderRoute('/history');

    expect(
      await screen.findByRole('heading', { level: 1, name: '입금·지출 내역' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('2026년 9월')).toBeInTheDocument();
    expect(screen.getByText('3,420,000원')).toBeInTheDocument();
    expect(screen.getByText('1,577,500원')).toBeInTheDocument();
    expect(screen.getByText('1,842,500원')).toBeInTheDocument();
  });

  it('오늘 그룹은 4건이고 14일 이마트가 이어진다', async () => {
    await renderRoute('/history');

    const today = await screen.findByRole('region', {
      name: /9월 15일 화요일 · 오늘/,
    });
    expect(within(today).getByText('4건')).toBeInTheDocument();
    expect(within(today).getByText('스타벅스')).toBeInTheDocument();
    const yesterday = screen.getByRole('region', { name: /9월 14일 월요일/ });
    expect(within(yesterday).getByText('이마트')).toBeInTheDocument();
  });

  it('입금 필터를 누르면 월급만 남고 URL 에 type 이 반영되며 합계는 달 전체다', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/history');

    await user.click(await screen.findByRole('radio', { name: '입금' }));

    expect(await screen.findByText('월급')).toBeInTheDocument();
    expect(screen.queryByText('스타벅스')).not.toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ type: 'income' });
    expect(screen.getByText('1,577,500원')).toBeInTheDocument();
  });

  it('type 쿼리로 들어오면 그 필터가 선택돼 있다', async () => {
    await renderRoute('/history?type=expense');

    expect(await screen.findByRole('radio', { name: '지출' })).toBeChecked();
    expect(screen.queryByText('월급')).not.toBeInTheDocument();
  });

  it('이전 달로 이동하면 URL 이 바뀌고 남은 돈이 음수로 보인다', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/history');

    await user.click(await screen.findByRole('button', { name: '이전 달' }));

    expect(await screen.findByText('2026년 8월')).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ month: '2026-08' });
    expect(screen.getByText('−292,500원')).toBeInTheDocument();
  });

  it('월을 옮겨도 선택한 필터는 유지된다', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/history?type=income');

    await user.click(await screen.findByRole('button', { name: '이전 달' }));

    await screen.findByText('2026년 8월');
    expect(router.state.location.search).toMatchObject({
      month: '2026-08',
      type: 'income',
    });
  });

  it('거래가 없는 달은 빈 상태 안내를 보여주고 합계는 0원이다', async () => {
    await renderRoute('/history?month=2026-07');

    expect(
      await screen.findByText('이 달에는 내역이 없어요'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('0원').length).toBeGreaterThanOrEqual(3);
  });

  it('거래가 없는 달에 필터를 걸어도 달 빈 상태 안내를 보여준다', async () => {
    await renderRoute('/history?month=2026-10&type=income');

    expect(
      await screen.findByText('이 달에는 내역이 없어요'),
    ).toBeInTheDocument();
  });

  it('입금 내역이 없는 달에 입금 필터를 걸면 필터 안내를 보여준다', async () => {
    await renderRoute('/history?month=2026-09&type=income', {
      transactions: [
        {
          id: 'x',
          type: 'expense',
          title: '커피',
          category: '카페',
          paymentMethod: '카드',
          amount: 4_000,
          date: '2026-09-10',
        },
      ],
    });

    expect(await screen.findByText('입금 내역이 없어요')).toBeInTheDocument();
  });

  it('카테고리 칩은 비활성이고 동작 없는 버튼에도 접근 가능한 이름이 있다', async () => {
    await renderRoute('/history');

    expect(
      await screen.findByRole('radio', { name: '카테고리' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: '검색' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '필터 설정' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '내역 추가' }),
    ).toBeInTheDocument();
  });
});
