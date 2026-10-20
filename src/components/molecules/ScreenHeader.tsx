import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/atoms/Icon';

interface ScreenHeaderProps {
  title: string;
  icon: LucideIcon;
  //* 아이콘만 있는 버튼이라 접근 가능한 이름이 필수다
  iconLabel: string;
}

//* Figma App header — H66 · 좌우 24 · 제목 24/700 · 아이콘 22. 터치 타깃 44 를 위해 버튼을 키우고 음수 마진으로 시각 위치를 맞춘다
export const ScreenHeader = ({ title, icon, iconLabel }: ScreenHeaderProps) => (
  <header className="flex h-66 items-center justify-between bg-surface px-24">
    <h1 className="font-bold text-24 text-content-primary">{title}</h1>
    <button
      type="button"
      aria-label={iconLabel}
      className="-mr-11 flex size-44 items-center justify-center text-content-secondary focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon icon={icon} size={22} />
    </button>
  </header>
);
