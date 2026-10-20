import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { createAppRouter } from '@/app/router';
import { transactionsQuery } from '@/queries/transactionQueries';
import type { Transaction } from '@/types/transaction';

interface RenderRouteOptions {
  //* 넘기면 목 데이터 대신 이 거래 목록을 캐시에 넣어 쓴다
  transactions?: Transaction[];
}

//* 라우터(메모리 history) + 새 QueryClient 로 앱 전체를 렌더한다. 페이지 테스트는 이걸로 경로를 지정해 렌더한다.
//* 라우트 매칭이 비동기라 await 해야 하고, 이후 화면은 findBy* 로 기다린다
export const renderRoute = async (
  path = '/',
  { transactions }: RenderRouteOptions = {},
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  if (transactions) {
    queryClient.setQueryData(transactionsQuery().queryKey, transactions);
  }
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  await router.load();

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router, queryClient };
};
