import {
  buildDateKey,
  getDayOfMonth,
  getDaysInMonth,
  shiftMonth,
  toMonthKey,
} from '@/lib/date';
import type { Category, Transaction } from '@/types/transaction';
import { CATEGORY, TRANSACTION_TYPE } from '@/types/transaction';

export const MOCK_USER_NAME = '민지';

const CARD = '신한카드';
const BANK = '국민은행';

//* 템플릿의 마지막 날(오늘에 해당하는 날). 템플릿은 1~15일이고 오늘이 15일에 놓인다
const TEMPLATE_TODAY = 15;

interface TemplateItem
  extends Pick<
    Transaction,
    'type' | 'title' | 'category' | 'paymentMethod' | 'amount'
  > {
  templateDay: number;
}

const expense = (
  templateDay: number,
  title: string,
  category: Category,
  amount: number,
  paymentMethod = CARD,
): TemplateItem => ({
  templateDay,
  type: TRANSACTION_TYPE.EXPENSE,
  title,
  category,
  paymentMethod,
  amount,
});

const income = (
  templateDay: number,
  title: string,
  category: Category,
  amount: number,
  paymentMethod = BANK,
): TemplateItem => ({
  templateDay,
  type: TRANSACTION_TYPE.INCOME,
  title,
  category,
  paymentMethod,
  amount,
});

//* Figma 시안(오늘 = 9월 15일)의 이번 달. 일별 지출 합계가 시안 캘린더와 같다
const THIS_MONTH_TEMPLATE: TemplateItem[] = [
  expense(1, '월세', CATEGORY.HOUSING, 600_000, BANK),
  expense(1, '관리비', CATEGORY.HOUSING, 50_000, BANK),
  expense(2, '정형외과 진료', CATEGORY.MEDICAL, 58_000),
  expense(3, '영화 관람', CATEGORY.CULTURE, 24_000),
  expense(4, '저녁 모임', CATEGORY.MEAL, 42_000),
  expense(5, '쿠팡', CATEGORY.SHOPPING, 86_000),
  expense(6, '블루보틀', CATEGORY.CAFE, 18_000),
  expense(7, '택시', CATEGORY.TRANSPORT, 35_000),
  expense(8, '무신사', CATEGORY.SHOPPING, 120_000),
  expense(9, '배달의민족', CATEGORY.MEAL, 32_000),
  expense(10, '마켓컬리', CATEGORY.GROCERY, 45_500),
  expense(11, '점심 식사', CATEGORY.MEAL, 19_000),
  expense(12, '뮤지컬 티켓', CATEGORY.CULTURE, 98_000),
  expense(13, '코스트코', CATEGORY.GROCERY, 125_000),
  expense(14, '이마트', CATEGORY.GROCERY, 154_500),
  expense(15, '스타벅스', CATEGORY.CAFE, 5_500),
  income(15, '월급', CATEGORY.SALARY, 3_420_000),
  expense(15, '지하철 충전', CATEGORY.TRANSPORT, 50_000),
  expense(15, '점심 식사', CATEGORY.MEAL, 15_000),
];

//* 지난달 같은 기간(1~15일) 지출 1,792,500원 → 이번 달(1,577,500원)이 12% 덜 쓴 것이 된다.
//* 입금이 지출보다 적어 남은 돈이 음수이고, 5일은 입금만 있는 날이다
const LAST_MONTH_TEMPLATE: TemplateItem[] = [
  expense(1, '월세', CATEGORY.HOUSING, 600_000, BANK),
  expense(2, '관리비', CATEGORY.HOUSING, 52_000, BANK),
  expense(3, '홈플러스', CATEGORY.GROCERY, 132_000),
  expense(4, '치과 진료', CATEGORY.MEDICAL, 210_000),
  income(5, '월급', CATEGORY.SALARY, 1_500_000),
  expense(6, '쿠팡', CATEGORY.SHOPPING, 189_000),
  expense(7, '점심 식사', CATEGORY.MEAL, 12_500),
  expense(8, '택시', CATEGORY.TRANSPORT, 28_000),
  expense(9, '무신사', CATEGORY.SHOPPING, 245_000),
  expense(10, '콘서트 티켓', CATEGORY.CULTURE, 165_000),
  expense(11, '스타벅스', CATEGORY.CAFE, 11_500),
  expense(13, '이마트', CATEGORY.GROCERY, 147_500),
];

//* 템플릿 15일이 오늘에 오도록 평행 이동한다. 1일보다 앞으로 밀려나는 거래는 생략한다.
//* 지난달은 말일을 넘으면 말일에 모은다 (오늘이 31일이고 지난달이 30일까지인 경우)
const placeTemplate = (
  template: TemplateItem[],
  monthKey: string,
  todayDay: number,
) =>
  template.flatMap(({ templateDay, ...item }) => {
    const day = todayDay - (TEMPLATE_TODAY - templateDay);
    if (day < 1) return [];
    return [
      {
        ...item,
        date: buildDateKey(monthKey, Math.min(day, getDaysInMonth(monthKey))),
      },
    ];
  });

//* 오늘이 15일이면 Figma 시안과 숫자가 정확히 같다. 오늘 이후 날짜에는 거래를 두지 않는다
export const createMockTransactions = (today: string): Transaction[] => {
  const todayDay = getDayOfMonth(today);
  const thisMonth = toMonthKey(today);

  return [
    ...placeTemplate(LAST_MONTH_TEMPLATE, shiftMonth(thisMonth, -1), todayDay),
    ...placeTemplate(THIS_MONTH_TEMPLATE, thisMonth, todayDay),
  ].map((item, index) => ({ ...item, id: `mock-${index + 1}` }));
};
