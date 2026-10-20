import { render, screen } from '@testing-library/react';
import { InsightBanner } from './InsightBanner';

describe('InsightBanner', () => {
  it('지난달보다 덜 쓰면 줄어든 비율과 격려 문구를 보여 준다', () => {
    render(<InsightBanner changePercent={-12} />);

    expect(screen.getByText('지난달보다 12% 덜 썼어요')).toBeInTheDocument();
    expect(
      screen.getByText('같은 기간 기준 · 좋은 흐름이에요!'),
    ).toBeInTheDocument();
  });

  it('지난달보다 더 쓰면 늘어난 비율을 보여 준다', () => {
    render(<InsightBanner changePercent={8} />);

    expect(screen.getByText('지난달보다 8% 더 썼어요')).toBeInTheDocument();
    expect(
      screen.getByText('같은 기간 기준 · 지출을 점검해 보세요'),
    ).toBeInTheDocument();
  });

  it('지난달과 같으면 같다고 알려 준다', () => {
    render(<InsightBanner changePercent={0} />);

    expect(screen.getByText('지난달과 비슷하게 썼어요')).toBeInTheDocument();
    expect(
      screen.getByText('같은 기간 기준 · 꾸준한 흐름이에요'),
    ).toBeInTheDocument();
  });

  it('지난달 지출이 없어 비교할 수 없으면 비율 없이 안내한다', () => {
    render(<InsightBanner changePercent={null} />);

    expect(
      screen.getByText('지난달과 비교할 내역이 없어요'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});
