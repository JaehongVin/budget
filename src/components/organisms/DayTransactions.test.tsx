import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DayTransactions } from '@/components/organisms/DayTransactions';
import type { Transaction } from '@/types/transaction';
import { CATEGORY, TRANSACTION_TYPE } from '@/types/transaction';

const DATE = '2026-09-15';

const createTransaction = (
  overrides: Partial<Transaction> & Pick<Transaction, 'id'>,
): Transaction => ({
  type: TRANSACTION_TYPE.EXPENSE,
  title: '스타벅스',
  category: CATEGORY.CAFE,
  paymentMethod: '신한카드',
  amount: 5_500,
  date: DATE,
  ...overrides,
});

const COFFEE = createTransaction({ id: 'a', title: '스타벅스' });
const SALARY = createTransaction({
  id: 'b',
  type: TRANSACTION_TYPE.INCOME,
  title: '월급',
  category: CATEGORY.SALARY,
  paymentMethod: '국민은행',
  amount: 3_420_000,
});
const SUBWAY = createTransaction({ id: 'c', title: '지하철', amount: 1_500 });
const LUNCH = createTransaction({ id: 'd', title: '점심', amount: 63_500 });
const FOUR = [COFFEE, SALARY, SUBWAY, LUNCH];

describe('DayTransactions', () => {
  it('날짜 제목과 건수와 입금·지출 요약을 보여준다', () => {
    render(<DayTransactions dateKey={DATE} isToday transactions={FOUR} />);

    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
    expect(screen.getByText('4건')).toBeInTheDocument();
    expect(
      screen.getByText('입금 3,420,000원 · 지출 70,500원'),
    ).toBeInTheDocument();
  });

  it('오늘이면 오늘 배지를 보여주고 아니면 보여주지 않는다', () => {
    const { rerender } = render(
      <DayTransactions dateKey={DATE} isToday transactions={FOUR} />,
    );
    expect(screen.getByText('오늘')).toBeInTheDocument();

    rerender(
      <DayTransactions dateKey={DATE} isToday={false} transactions={FOUR} />,
    );
    expect(screen.queryByText('오늘')).not.toBeInTheDocument();
  });

  it('처음 2건만 보여주고 더 보기로 나머지를 펼친다', async () => {
    const user = userEvent.setup();
    render(<DayTransactions dateKey={DATE} isToday transactions={FOUR} />);

    expect(screen.getByText('스타벅스')).toBeInTheDocument();
    expect(screen.getByText('월급')).toBeInTheDocument();
    expect(screen.queryByText('지하철')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '내역 2건 더 보기' }));

    expect(screen.getByText('지하철')).toBeInTheDocument();
    expect(screen.getByText('점심')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /더 보기/ }),
    ).not.toBeInTheDocument();
  });

  it('2건 이하면 더 보기를 보여주지 않는다', () => {
    render(
      <DayTransactions
        dateKey={DATE}
        isToday={false}
        transactions={FOUR.slice(0, 2)}
      />,
    );

    expect(screen.getByText('2건')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /더 보기/ }),
    ).not.toBeInTheDocument();
  });

  it('3건이면 1건 더 보기를 보여준다', () => {
    render(
      <DayTransactions
        dateKey={DATE}
        isToday={false}
        transactions={FOUR.slice(0, 3)}
      />,
    );

    expect(
      screen.getByRole('button', { name: '내역 1건 더 보기' }),
    ).toBeInTheDocument();
  });

  it('지출만 있으면 지출만 요약한다', () => {
    render(
      <DayTransactions
        dateKey={DATE}
        isToday={false}
        transactions={[COFFEE, SUBWAY]}
      />,
    );

    expect(screen.getByText('지출 7,000원')).toBeInTheDocument();
  });

  it('입금만 있으면 입금만 요약한다', () => {
    render(
      <DayTransactions
        dateKey={DATE}
        isToday={false}
        transactions={[SALARY]}
      />,
    );

    expect(screen.getByText('입금 3,420,000원')).toBeInTheDocument();
  });

  it('거래가 없으면 빈 상태를 보여주고 건수·요약은 없다', () => {
    render(
      <DayTransactions dateKey={DATE} isToday={false} transactions={[]} />,
    );

    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
    expect(screen.getByText('이 날은 내역이 없어요')).toBeInTheDocument();
    expect(screen.queryByText('0건')).not.toBeInTheDocument();
  });

  it('날짜가 바뀌면 펼침 상태를 접는다', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <DayTransactions dateKey={DATE} isToday transactions={FOUR} />,
    );
    await user.click(screen.getByRole('button', { name: '내역 2건 더 보기' }));

    rerender(
      <DayTransactions
        dateKey="2026-09-14"
        isToday={false}
        transactions={FOUR}
      />,
    );

    expect(screen.queryByText('지하철')).not.toBeInTheDocument();
  });
});
