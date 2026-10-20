import type { RouterHistory } from '@tanstack/react-router';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { AppShell } from '@/components/templates/AppShell';
import { CalendarPage } from '@/pages/CalendarPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { HomePage } from '@/pages/HomePage';
import { calendarSearchSchema, historySearchSchema } from './searchSchemas';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  validateSearch: calendarSearchSchema,
  component: CalendarPage,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  validateSearch: historySearchSchema,
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  calendarRoute,
  historyRoute,
]);

//* history 를 넘기지 않으면 브라우저 history 를 쓴다. 테스트는 메모리 history 를 넘긴다
export const createAppRouter = (history?: RouterHistory) =>
  createRouter({ routeTree, history });

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
