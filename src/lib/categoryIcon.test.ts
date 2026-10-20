import {
  Building2,
  Coffee,
  ShoppingBag,
  TrainFront,
  Utensils,
} from 'lucide-react';
import { CATEGORY } from '@/types/transaction';
import { getCategoryIcon } from './categoryIcon';

describe('getCategoryIcon', () => {
  it('시안의 카테고리 아이콘과 같다', () => {
    expect(getCategoryIcon(CATEGORY.CAFE)).toBe(Coffee);
    expect(getCategoryIcon(CATEGORY.SALARY)).toBe(Building2);
    expect(getCategoryIcon(CATEGORY.TRANSPORT)).toBe(TrainFront);
    expect(getCategoryIcon(CATEGORY.MEAL)).toBe(Utensils);
    expect(getCategoryIcon(CATEGORY.GROCERY)).toBe(ShoppingBag);
  });

  it('모든 카테고리에 아이콘이 있다', () => {
    for (const category of Object.values(CATEGORY)) {
      expect(getCategoryIcon(category), category).toBeDefined();
    }
  });
});
