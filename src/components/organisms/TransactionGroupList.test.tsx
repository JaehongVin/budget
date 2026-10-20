import { render, screen, within } from '@testing-library/react';
import type { DateGroup } from '@/lib/transactions';
import { TransactionGroupList } from './TransactionGroupList';

const groups: DateGroup[] = [
  {
    date: '2026-09-15',
    transactions: [
      {
        id: 'a',
        type: 'expense',
        title: '스타벅스',
        category: '카페',
        paymentMethod: '신한카드',
        amount: 5_500,
        date: '2026-09-15',
      },
      {
        id: 'b',
        type: 'income',
        title: '월급',
        category: '급여',
        paymentMethod: '국민은행',
        amount: 3_420_000,
        date: '2026-09-15',
      },
    ],
  },
  {
    date: '2026-09-14',
    transactions: [
      {
        id: 'c',
        type: 'expense',
        title: '이마트',
        category: '장보기',
        paymentMethod: '신한카드',
        amount: 154_500,
        date: '2026-09-14',
      },
    ],
  },
];

describe('TransactionGroupList', () => {
  it('날짜 머리와 건수를 보여주고 오늘 그룹에만 "· 오늘" 을 붙인다', () => {
    render(
      <TransactionGroupList
        groups={groups}
        todayKey="2026-09-15"
        emptyMessage="내역이 없어요"
      />,
    );

    expect(screen.getByText('9월 15일 화요일 · 오늘')).toBeInTheDocument();
    expect(screen.getByText('2건')).toBeInTheDocument();
    expect(screen.getByText('9월 14일 월요일')).toBeInTheDocument();
    expect(screen.getByText('1건')).toBeInTheDocument();
  });

  it('행에 제목·카테고리와 결제수단·부호 붙은 금액을 보여준다', () => {
    render(
      <TransactionGroupList
        groups={groups}
        todayKey="2026-09-15"
        emptyMessage="내역이 없어요"
      />,
    );

    const group = screen.getByRole('region', { name: /9월 15일 화요일/ });
    expect(within(group).getByText('스타벅스')).toBeInTheDocument();
    expect(within(group).getByText('카페 · 신한카드')).toBeInTheDocument();
    expect(within(group).getByText('−5,500원')).toBeInTheDocument();
    expect(within(group).getByText('+3,420,000원')).toBeInTheDocument();
  });

  it('그룹이 없으면 안내 문구만 보여준다', () => {
    render(
      <TransactionGroupList
        groups={[]}
        todayKey="2026-09-15"
        emptyMessage="입금 내역이 없어요"
      />,
    );

    expect(screen.getByText('입금 내역이 없어요')).toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
