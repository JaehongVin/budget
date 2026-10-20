import { expect, test } from '@playwright/test';

const TODAY = new Date(2026, 8, 15, 12);

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: TODAY });
  await page.goto('/calendar');
});

test('캘린더가 시안의 합계와 오늘 내역을 보여준다', async ({ page }) => {
  await expect(page.getByText('2026년 9월')).toBeVisible();
  await expect(page.getByText('3,420,000원').first()).toBeVisible();
  await expect(page.getByText('1,577,500원')).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: '9월 15일 화요일, 입금 3,420,000원, 지출 70,500원',
    }),
  ).toBeVisible();
});

test('오늘 내역은 2건만 보이고 더 보기로 나머지를 펼친다', async ({ page }) => {
  const dayTransactions = page.getByRole('region', { name: /9월 15일/ });
  await expect(dayTransactions.getByText('4건')).toBeVisible();
  await expect(dayTransactions.getByRole('listitem')).toHaveCount(2);

  await page.getByRole('button', { name: '내역 2건 더 보기' }).click();

  await expect(dayTransactions.getByRole('listitem')).toHaveCount(4);
});

test('다른 날짜를 누르면 그 날의 내역을 보여준다', async ({ page }) => {
  await page.getByRole('button', { name: /^9월 14일/ }).click();

  await expect(page).toHaveURL(/date=2026-09-14/);
  await expect(page.getByText('9월 14일 월요일')).toBeVisible();
  await expect(page.getByText('이마트')).toBeVisible();
});

test('이전 달로 이동하면 남은 돈이 음수인 달의 합계를 보여주고 오늘 버튼으로 돌아온다', async ({
  page,
}) => {
  await page.getByRole('button', { name: '이전 달' }).click();

  await expect(page.getByText('2026년 8월')).toBeVisible();
  await expect(page.getByText('1,500,000원').first()).toBeVisible();
  await expect(page.getByText('1,792,500원')).toBeVisible();

  await page.getByRole('button', { name: '오늘', exact: true }).click();

  await expect(page.getByText('2026년 9월')).toBeVisible();
  await expect(page.getByText('9월 15일 화요일')).toBeVisible();
});
