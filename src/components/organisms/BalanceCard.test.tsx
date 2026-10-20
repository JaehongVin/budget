import { render, screen } from '@testing-library/react';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard', () => {
  it('월 라벨과 남은 돈, 총 입금·지출을 보여 준다', () => {
    render(
      <BalanceCard
        monthNumber={9}
        balance={1_842_500}
        income={3_420_000}
        expense={1_577_500}
      />,
    );

    expect(screen.getByText('9월 남은 돈')).toBeInTheDocument();
    expect(screen.getByText('1,842,500원')).toBeInTheDocument();
    expect(screen.getByText('3,420,000원')).toBeInTheDocument();
    expect(screen.getByText('1,577,500원')).toBeInTheDocument();
  });

  it('지출이 입금보다 많으면 남은 돈을 마이너스로 보여 준다', () => {
    render(
      <BalanceCard
        monthNumber={8}
        balance={-292_500}
        income={1_500_000}
        expense={1_792_500}
      />,
    );

    expect(screen.getByText('−292,500원')).toBeInTheDocument();
  });

  it('거래가 없으면 0원을 보여 준다', () => {
    render(<BalanceCard monthNumber={9} balance={0} income={0} expense={0} />);

    expect(screen.getByText('9월 남은 돈')).toBeInTheDocument();
    expect(screen.getAllByText('0원')).toHaveLength(3);
  });

  it('더보기 버튼에 접근 가능한 이름이 있다', () => {
    render(<BalanceCard monthNumber={9} balance={0} income={0} expense={0} />);

    expect(screen.getByRole('button', { name: '더보기' })).toBeInTheDocument();
  });
});
