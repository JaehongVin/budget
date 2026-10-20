export const TRANSACTION_TYPE = {
  INCOME: 'income',
  EXPENSE: 'expense',
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const TYPE_FILTER = {
  ALL: 'all',
  ...TRANSACTION_TYPE,
} as const;

export type TypeFilter = (typeof TYPE_FILTER)[keyof typeof TYPE_FILTER];

export const CATEGORY = {
  SALARY: '급여',
  CAFE: '카페',
  MEAL: '식비',
  GROCERY: '장보기',
  SHOPPING: '쇼핑',
  TRANSPORT: '교통',
  HOUSING: '주거',
  MEDICAL: '의료',
  CULTURE: '문화',
} as const;

export type Category = (typeof CATEGORY)[keyof typeof CATEGORY];

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  category: Category;
  paymentMethod: string;
  //* 원 단위 0 이상 정수. 입금/지출은 type 으로 구분한다
  amount: number;
  //* 로컬 날짜 YYYY-MM-DD
  date: string;
}
