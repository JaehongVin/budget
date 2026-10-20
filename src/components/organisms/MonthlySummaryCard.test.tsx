import { render, screen } from '@testing-library/react';
import { MonthlySummaryCard } from './MonthlySummaryCard';

describe('MonthlySummaryCard', () => {
  it('총 입금·총 지출·남은 돈을 보여준다', () => {
    render(
      <MonthlySummaryCard
        income={3_420_000}
        expense={1_577_500}
        balance={1_842_500}
      />,
    );

    expect(screen.getByText('3,420,000원')).toBeInTheDocument();
    expect(screen.getByText('1,577,500원')).toBeInTheDocument();
    expect(screen.getByText('남은 돈')).toBeInTheDocument();
    expect(screen.getByText('1,842,500원')).toBeInTheDocument();
  });

  it('남은 돈이 음수면 마이너스 기호를 붙인다', () => {
    render(
      <MonthlySummaryCard
        income={1_500_000}
        expense={1_792_500}
        balance={-292_500}
      />,
    );

    expect(screen.getByText('−292,500원')).toBeInTheDocument();
  });

  it('거래가 없으면 모두 0원이다', () => {
    render(<MonthlySummaryCard income={0} expense={0} balance={0} />);

    expect(screen.getAllByText('0원')).toHaveLength(3);
  });
});
