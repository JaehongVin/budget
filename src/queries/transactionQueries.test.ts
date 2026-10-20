import { QueryClient } from '@tanstack/react-query';
import { transactionKeys, transactionsQuery } from './transactionQueries';

describe('transactionsQuery', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('목 데이터 거래 목록을 돌려준다', async () => {
    vi.useFakeTimers({ now: new Date(2026, 8, 15, 12), toFake: ['Date'] });
    const client = new QueryClient();

    const transactions = await client.fetchQuery(transactionsQuery());

    expect(transactions.some(({ title }) => title === '월급')).toBe(true);
    expect(transactions.every(({ date }) => date <= '2026-09-15')).toBe(true);
  });

  it('queryKey 에 오늘 날짜가 들어가 날짜가 바뀌면 다시 만든다', () => {
    vi.useFakeTimers({ now: new Date(2026, 8, 15, 12), toFake: ['Date'] });
    const before = transactionsQuery().queryKey;
    vi.setSystemTime(new Date(2026, 8, 16, 12));
    const after = transactionsQuery().queryKey;

    expect(before).toEqual([...transactionKeys.all, '2026-09-15']);
    expect(after).toEqual([...transactionKeys.all, '2026-09-16']);
  });
});
