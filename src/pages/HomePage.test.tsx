import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/renderRoute';
import type { Transaction } from '@/types/transaction';

const TODAY = new Date(2026, 8, 15, 12);

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'tx-1',
  type: 'expense',
  title: '점심',
  category: '식비',
  paymentMethod: '신한카드',
  amount: 10_000,
  date: '2026-09-10',
  ...overrides,
});

describe('HomePage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: TODAY, toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('제목 h1 은 하나이고 알림 버튼이 있다', async () => {
    await renderRoute('/');

    expect(
      await screen.findByRole('heading', { level: 1, name: '내 가계부' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  });

  it('인사말과 오늘 날짜를 보여 준다', async () => {
    await renderRoute('/');

    expect(await screen.findByText('민지님, 반가워요')).toBeInTheDocument();
    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
  });

  it('이번 달 남은 돈과 총 입금·지출을 시안 숫자로 보여 준다', async () => {
    await renderRoute('/');

    expect(await screen.findByText('9월 남은 돈')).toBeInTheDocument();
    expect(screen.getByText('1,842,500원')).toBeInTheDocument();
    expect(screen.getByText('3,420,000원')).toBeInTheDocument();
    expect(screen.getAllByText('1,577,500원').length).toBeGreaterThan(0);
  });

  it('생활비 예산 사용률과 남은 금액을 보여 준다', async () => {
    await renderRoute('/');

    const budget = await screen.findByRole('region', {
      name: '9월 생활비 예산',
    });
    expect(within(budget).getByText('79% 사용')).toBeInTheDocument();
    expect(within(budget).getByText('422,500원 남음')).toBeInTheDocument();
  });

  it('최근 내역 3건을 최신순으로 보여 준다', async () => {
    await renderRoute('/');

    const recent = await screen.findByRole('region', { name: '최근 내역' });
    expect(within(recent).getByText('스타벅스')).toBeInTheDocument();
    expect(within(recent).getByText('월급')).toBeInTheDocument();
    expect(within(recent).getByText('지하철 충전')).toBeInTheDocument();
    expect(within(recent).queryByText('점심 식사')).not.toBeInTheDocument();
    expect(within(recent).getByText('−5,500원')).toBeInTheDocument();
    expect(within(recent).getByText('+3,420,000원')).toBeInTheDocument();
  });

  it('지난달보다 12% 덜 썼다는 배너를 보여 준다', async () => {
    await renderRoute('/');

    expect(
      await screen.findByText('지난달보다 12% 덜 썼어요'),
    ).toBeInTheDocument();
  });

  it('전체 보기를 누르면 내역 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    const { router } = await renderRoute('/');

    await user.click(await screen.findByRole('link', { name: '전체 보기' }));

    expect(router.state.location.pathname).toBe('/history');
  });

  it('거래가 하나도 없으면 빈 상태와 0원을 보여 준다', async () => {
    await renderRoute('/', { transactions: [] });

    expect(await screen.findByText('아직 내역이 없어요')).toBeInTheDocument();
    expect(screen.getAllByText('0원')).toHaveLength(3);
    expect(
      screen.getByText('지난달과 비교할 내역이 없어요'),
    ).toBeInTheDocument();
    expect(screen.getByText('0% 사용')).toBeInTheDocument();
  });

  it('이번 달 지출이 입금보다 많으면 남은 돈이 마이너스다', async () => {
    await renderRoute('/', {
      transactions: [
        tx({ id: 'a', type: 'income', category: '급여', amount: 100_000 }),
        tx({ id: 'b', amount: 392_500 }),
      ],
    });

    expect(await screen.findByText('−292,500원')).toBeInTheDocument();
  });

  it('지난달보다 더 쓰면 더 썼다는 배너를 보여 준다', async () => {
    await renderRoute('/', {
      transactions: [
        tx({ id: 'a', date: '2026-08-05', amount: 100_000 }),
        tx({ id: 'b', date: '2026-09-05', amount: 150_000 }),
      ],
    });

    expect(
      await screen.findByText('지난달보다 50% 더 썼어요'),
    ).toBeInTheDocument();
  });

  it('지난달 거래가 없으면 비교할 수 없다는 배너를 보여 준다', async () => {
    await renderRoute('/', { transactions: [tx({ id: 'b' })] });

    expect(
      await screen.findByText('지난달과 비교할 내역이 없어요'),
    ).toBeInTheDocument();
  });
});
