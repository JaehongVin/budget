import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  Coffee,
  House,
  Shirt,
  ShoppingBag,
  Stethoscope,
  Ticket,
  TrainFront,
  Utensils,
} from 'lucide-react';
import type { Category } from '@/types/transaction';
import { CATEGORY } from '@/types/transaction';

//* 카테고리가 늘면 컴파일러가 여기서 누락을 잡는다 (Record 가 모든 키를 요구한다)
const CATEGORY_ICON: Record<Category, LucideIcon> = {
  [CATEGORY.SALARY]: Building2,
  [CATEGORY.CAFE]: Coffee,
  [CATEGORY.MEAL]: Utensils,
  [CATEGORY.GROCERY]: ShoppingBag,
  [CATEGORY.SHOPPING]: Shirt,
  [CATEGORY.TRANSPORT]: TrainFront,
  [CATEGORY.HOUSING]: House,
  [CATEGORY.MEDICAL]: Stethoscope,
  [CATEGORY.CULTURE]: Ticket,
};

export const getCategoryIcon = (category: Category) => CATEGORY_ICON[category];
