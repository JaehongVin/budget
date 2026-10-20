import { ChartNoAxesCombined } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/cn';

interface InsightBannerProps {
  //* 지난달 같은 기간 대비 지출 증감률(정수 %). 지난달 지출이 0원이라 비교할 수 없으면 null
  changePercent: number | null;
}

interface InsightMessage {
  title: string;
  description: string;
  tone: 'good' | 'warning' | 'neutral';
}

const TONE_CLASS = {
  good: { container: 'bg-accent-subtle', title: 'text-accent-pressed' },
  warning: { container: 'bg-negative-subtle', title: 'text-negative' },
  neutral: { container: 'bg-surface-subtle', title: 'text-content-primary' },
} as const;

const getInsightMessage = (changePercent: number | null): InsightMessage => {
  if (changePercent === null) {
    return {
      title: '지난달과 비교할 내역이 없어요',
      description: '지난달 지출이 쌓이면 비교해 드려요',
      tone: 'neutral',
    };
  }
  if (changePercent < 0) {
    return {
      title: `지난달보다 ${-changePercent}% 덜 썼어요`,
      description: '같은 기간 기준 · 좋은 흐름이에요!',
      tone: 'good',
    };
  }
  if (changePercent > 0) {
    return {
      title: `지난달보다 ${changePercent}% 더 썼어요`,
      description: '같은 기간 기준 · 지출을 점검해 보세요',
      tone: 'warning',
    };
  }
  return {
    title: '지난달과 비슷하게 썼어요',
    description: '같은 기간 기준 · 꾸준한 흐름이에요',
    tone: 'neutral',
  };
};

//* Figma Spending insight — 아이콘 24 · 제목 13/700 · 설명 11/500 · 패딩 16 · 라운드 12.
//* 시안에는 "덜 씀"만 있다. 나머지 상태는 DS 색(negative·surface-subtle)으로 정했다
export const InsightBanner = ({ changePercent }: InsightBannerProps) => {
  const { title, description, tone } = getInsightMessage(changePercent);
  const toneClass = TONE_CLASS[tone];

  return (
    <div
      className={cn(
        'flex items-center gap-12 rounded-12 p-16',
        toneClass.container,
      )}
    >
      <span className={toneClass.title}>
        <Icon icon={ChartNoAxesCombined} size={24} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className={cn('font-bold text-13', toneClass.title)}>{title}</p>
        <p className="font-medium text-11 text-content-secondary">
          {description}
        </p>
      </div>
    </div>
  );
};
