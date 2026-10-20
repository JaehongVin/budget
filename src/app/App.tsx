import { Building2, Coffee, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';
import { CalendarDay } from '@/components/molecules/CalendarDay';
import { FilterChipGroup } from '@/components/molecules/FilterChipGroup';
import { TransactionRow } from '@/components/molecules/TransactionRow';
import type { NavKey } from '@/components/organisms/BottomNav';
import { BottomNav } from '@/components/organisms/BottomNav';
import { BudgetProgressCard } from '@/components/organisms/BudgetProgressCard';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'expense', label: '지출' },
  { value: 'category', label: '카테고리', disabled: true },
] as const;

type Filter = (typeof FILTER_OPTIONS)[number]['value'];

//* 화면을 만들기 전까지 쓰는 DS 미리보기. Figma 3:3079 의 Components 섹션과 같은 데이터를 쓴다
export const App = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [month, setMonth] = useState(9);
  const [selectedDay, setSelectedDay] = useState(15);
  const [nav, setNav] = useState<NavKey>('home');

  return (
    <div className="mx-auto flex min-h-dvh max-w-390 flex-col">
      <main className="flex flex-1 flex-col gap-28 px-20 py-24">
        <h1 className="font-bold text-24">가계부</h1>

        <section className="flex flex-col gap-12">
          <h2 className="font-bold text-18">Button</h2>
          <Button>
            <Icon icon={Plus} size={18} />
            내역 추가
          </Button>
          <Button variant="secondary">전체 보기</Button>
          <Button disabled>저장하기</Button>
        </section>

        <section className="flex flex-col gap-12">
          <h2 className="font-bold text-18">Filter chip</h2>
          <FilterChipGroup
            label="내역 필터"
            options={FILTER_OPTIONS}
            value={filter}
            onValueChange={setFilter}
          />
        </section>

        <section className="flex flex-col gap-12">
          <h2 className="font-bold text-18">Budget progress card</h2>
          <BudgetProgressCard
            title="9월 생활비 예산"
            spent={1577500}
            limit={2000000}
          />
          <BudgetProgressCard
            title="9월 외식비 예산"
            spent={325000}
            limit={300000}
          />
        </section>

        <section className="flex flex-col gap-12 rounded-20 bg-surface p-20">
          <h2 className="font-bold text-18">Transaction row</h2>
          <ul>
            <li>
              <TransactionRow
                type="expense"
                title="스타벅스"
                description="카페 · 신한카드"
                amount={5500}
                icon={Coffee}
              />
            </li>
            <li>
              <TransactionRow
                type="income"
                title="월급"
                description="급여 · 국민은행"
                amount={3420000}
                icon={Building2}
              />
            </li>
          </ul>
        </section>

        <section className="flex flex-col gap-12 rounded-20 bg-surface p-20">
          <h2 className="font-bold text-18">Calendar day</h2>
          <p className="font-bold text-15">{month}월</p>
          <div className="grid grid-cols-4 gap-8">
            <CalendarDay
              day={14}
              expense={154500}
              selected={selectedDay === 14}
              onSelect={() => setSelectedDay(14)}
            />
            <CalendarDay
              day={15}
              income={3420000}
              expense={70500}
              today
              selected={selectedDay === 15}
              onSelect={() => setSelectedDay(15)}
            />
            <CalendarDay
              day={16}
              selected={selectedDay === 16}
              onSelect={() => setSelectedDay(16)}
            />
            {/* 다음 달 1일. 누르면 그 달로 이동한다 */}
            <CalendarDay
              day={1}
              outsideMonth
              onSelect={() => setMonth((current) => (current % 12) + 1)}
            />
          </div>
        </section>
      </main>

      <div className="sticky bottom-0">
        <BottomNav active={nav} onSelect={setNav} />
      </div>
    </div>
  );
};
