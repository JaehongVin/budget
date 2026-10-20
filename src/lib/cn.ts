import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

//* theme.css 의 커스텀 토큰을 알려주지 않으면 text-15(크기)와 text-content-primary(색)를 같은 종류로 보고 하나를 지운다
const FONT_SIZES = [
  '8',
  '10',
  '11',
  '12',
  '13',
  '15',
  '18',
  '20',
  '24',
  '28',
  '32',
];
const RADII = ['3', '8', '12', '14', '16', '18', '20'];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      rounded: [{ rounded: RADII }],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
