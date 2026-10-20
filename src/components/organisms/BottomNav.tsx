import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { CalendarDays, House, List } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/', label: '홈', icon: House },
  { to: '/calendar', label: '캘린더', icon: CalendarDays },
  { to: '/history', label: '내역', icon: List },
] as const;

const navItemVariants = cva(
  'flex min-h-48 w-full flex-col items-center gap-4 text-11 focus-visible:outline-2 focus-visible:outline-accent',
  {
    variants: {
      active: {
        true: 'font-bold text-accent',
        false: 'font-medium text-content-muted',
      },
    },
  },
);

//* Figma DS/Bottom navigation — 3개 탭 · 아이콘 23 · 라벨 11. 탭은 라우터 링크이고 현재 경로가 곧 활성 탭이다.
//* Figma 의 Home indicator 막대는 OS 가 그리는 요소라 구현하지 않고 safe-area 여백으로 대신한다
export const BottomNav = () => (
  <nav
    aria-label="주요 메뉴"
    className="border-border border-t bg-surface pt-12 pb-[max(8px,env(safe-area-inset-bottom))]"
  >
    <ul className="flex">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <li key={to} className="flex-1">
          <Link
            to={to}
            //* 탭 이동은 쿼리스트링 없이 / 만 비교한다. 안 그러면 / 가 모든 경로에서 활성이 된다
            activeOptions={{ exact: true, includeSearch: false }}
            className={cn(navItemVariants({ active: false }))}
            activeProps={{ className: cn(navItemVariants({ active: true })) }}
          >
            <Icon icon={icon} size={23} />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);
