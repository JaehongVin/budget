import { render, screen } from '@testing-library/react';
import { BudgetProgressCard } from './BudgetProgressCard';

describe('BudgetProgressCard', () => {
  it('사용률, 사용액/예산, 남은 금액을 보여준다', () => {
    render(
      <BudgetProgressCard
        title="9월 생활비 예산"
        spent={1577500}
        limit={2000000}
      />,
    );

    expect(screen.getByText('79% 사용')).toBeInTheDocument();
    expect(screen.getByText('1,577,500 / 2,000,000원')).toBeInTheDocument();
    expect(screen.getByText('422,500원 남음')).toBeInTheDocument();
  });

  it('진행 막대에 사용률을 알린다', () => {
    render(
      <BudgetProgressCard
        title="9월 생활비 예산"
        spent={1577500}
        limit={2000000}
      />,
    );

    expect(
      screen.getByRole('progressbar', { name: '9월 생활비 예산 사용률' }),
    ).toHaveAttribute('aria-valuenow', '79');
  });

  it('예산 안이면 초과 경고를 보여주지 않는다', () => {
    render(
      <BudgetProgressCard
        title="9월 생활비 예산"
        spent={1577500}
        limit={2000000}
      />,
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('예산을 딱 맞게 쓰면 초과 경고를 보여주지 않는다', () => {
    render(
      <BudgetProgressCard
        title="9월 생활비 예산"
        spent={2000000}
        limit={2000000}
      />,
    );

    expect(screen.getByText('100% 사용')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('예산을 넘으면 초과 경고를 보여주고 막대는 100 에서 멈춘다', () => {
    render(
      <BudgetProgressCard
        title="9월 생활비 예산"
        spent={2500000}
        limit={2000000}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      '예산을 초과했어요 · 100% 이상',
    );
    expect(screen.getByText('125% 사용')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });
});
