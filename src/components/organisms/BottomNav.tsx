import { cva } from 'class-variance-authority';
import { CalendarDays, House, List } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: House },
  { key: 'calendar', label: '캘린더', icon: CalendarDays },
  { key: 'history', label: '내역', icon: List },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

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

interface BottomNavProps {
  active: NavKey;
  onSelect: (key: NavKey) => void;
}

//* Figma DS/Bottom navigation — 3개 탭 · 아이콘 23 · 라벨 11.
//* Figma 의 Home indicator 막대는 OS 가 그리는 요소라 구현하지 않고 safe-area 여백으로 대신한다
export const BottomNav = ({ active, onSelect }: BottomNavProps) => (
  <nav
    aria-label="주요 메뉴"
    className="border-border border-t bg-surface pt-12 pb-[max(8px,env(safe-area-inset-bottom))]"
  >
    <ul className="flex">
      {NAV_ITEMS.map(({ key, label, icon }) => {
        const isActive = key === active;
        return (
          <li key={key} className="flex-1">
            <button
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelect(key)}
              className={cn(navItemVariants({ active: isActive }))}
            >
              <Icon icon={icon} size={23} />
              {label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
