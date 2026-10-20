import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

//* Figma DS/Button — H52 · Radius 12 · 라벨 15/700. pressed 는 :active, disabled 는 disabled 속성으로 표현한다
const buttonVariants = cva(
  'inline-flex h-52 items-center justify-center gap-8 rounded-12 px-20 font-bold text-15 transition-colors focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-content-muted',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-content-on-accent active:bg-accent-pressed',
        secondary: 'bg-accent-subtle text-accent-pressed',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  ref?: Ref<HTMLButtonElement>;
}

export const Button = ({
  className,
  variant,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={cn(buttonVariants({ variant }), className)}
    {...props}
  />
);
