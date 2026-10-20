import { queryOptions } from '@tanstack/react-query';
import { getTodayKey } from '@/lib/date';
import { createMockTransactions } from '@/mocks/transactions';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (today: string) => [...transactionKeys.all, today] as const,
};

//* 지금은 목 데이터. 저장소가 생기면 queryFn 만 바꾼다. 목 데이터가 오늘 기준이라 오늘을 키에 넣는다
export const transactionsQuery = () => {
  const today = getTodayKey();
  return queryOptions({
    queryKey: transactionKeys.list(today),
    queryFn: async () => createMockTransactions(today),
  });
};
