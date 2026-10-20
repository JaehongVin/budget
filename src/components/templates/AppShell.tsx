import type { ReactNode } from 'react';
import { BottomNav } from '@/components/organisms/BottomNav';

interface AppShellProps {
  children: ReactNode;
}

//* 모든 화면의 골격 — 본문 + 하단 탭. 폭은 모바일(390)에 맞추고 하단 탭은 스크롤과 무관하게 붙는다
export const AppShell = ({ children }: AppShellProps) => (
  <div className="mx-auto flex min-h-dvh max-w-390 flex-col">
    <main className="flex flex-1 flex-col">{children}</main>
    <div className="sticky bottom-0">
      <BottomNav />
    </div>
  </div>
);
