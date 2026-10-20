import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';

interface IconProps extends Omit<LucideProps, 'ref'> {
  icon: LucideIcon;
  size: number;
}

//* Figma 의 lucide 아이콘은 크기와 상관없이 선 굵기가 1.8px 이다. 색은 currentColor 로 부모 글자색을 따른다
export const Icon = ({
  icon: LucideComponent,
  size,
  className,
  ...props
}: IconProps) => (
  <LucideComponent
    size={size}
    strokeWidth={1.8}
    absoluteStrokeWidth
    aria-hidden="true"
    className={cn('shrink-0', className)}
    {...props}
  />
);
