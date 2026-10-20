import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

//* Figma DS/Filter chip — H36 · Pill · 라벨 13
const chipVariants = cva(
  'inline-flex h-36 shrink-0 items-center gap-4 rounded-full px-15 text-13 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:font-medium disabled:text-content-muted',
  {
    variants: {
      selected: {
        true: 'bg-accent-subtle font-bold text-accent-pressed',
        false: 'bg-surface-subtle font-medium text-content-secondary',
      },
    },
    defaultVariants: {
      selected: false,
    },
  },
);

interface ChipProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
  ref?: Ref<HTMLButtonElement>;
}

export const Chip = ({
  className,
  selected,
  type = 'button',
  ...props
}: ChipProps) => (
  <button
    type={type}
    className={cn(chipVariants({ selected }), className)}
    {...props}
  />
);
