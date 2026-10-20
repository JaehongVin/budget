import { screen } from '@testing-library/react';
import { transactionsQuery } from '@/queries/transactionQueries';
import type { Transaction } from '@/types/transaction';
import { renderRoute } from './renderRoute';

const TRANSACTION: Transaction = {
  id: 'only',
  type: 'expense',
  title: '테스트 거래',
  category: '식비',
  paymentMethod: '신한카드',
  amount: 1000,
  date: '2026-09-15',
};

describe('renderRoute', () => {
  it('넘긴 경로의 화면을 그린다', async () => {
    await renderRoute('/history');

    expect(
      await screen.findByRole('heading', { name: '입금·지출 내역' }),
    ).toBeInTheDocument();
  });

  it('transactions 를 넘기면 쿼리 캐시가 그 값이다', async () => {
    const { queryClient } = await renderRoute('/', {
      transactions: [TRANSACTION],
    });

    expect(queryClient.getQueryData(transactionsQuery().queryKey)).toEqual([
      TRANSACTION,
    ]);
  });
});
