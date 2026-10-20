import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 8, 15, 12) });
});

test('내역 화면이 시안의 합계와 날짜별 목록을 보여준다', async ({ page }) => {
  await page.goto('/history');

  await expect(page.getByText('2026년 9월')).toBeVisible();
  const summary = page.getByRole('region', { name: '월 합계' });
  await expect(summary.getByText('3,420,000원')).toBeVisible();
  await expect(summary.getByText('1,577,500원')).toBeVisible();
  await expect(summary.getByText('1,842,500원')).toBeVisible();

  const today = page.getByRole('region', { name: /9월 15일 화요일 · 오늘/ });
  await expect(today.getByText('4건')).toBeVisible();
  const yesterday = page.getByRole('region', { name: /9월 14일 월요일/ });
  await expect(yesterday.getByText('이마트')).toBeVisible();
});

test('입금 필터를 누르면 월급만 보이고 URL 에 반영된다', async ({ page }) => {
  await page.goto('/history');

  await page.getByRole('radio', { name: '입금' }).click();

  await expect(page).toHaveURL(/type=income/);
  await expect(page.getByText('월급')).toBeVisible();
  await expect(page.getByText('스타벅스')).toHaveCount(0);
});

test('이전 달로 이동하면 남은 돈이 음수로 보인다', async ({ page }) => {
  await page.goto('/history');

  await page.getByRole('button', { name: '이전 달' }).click();

  await expect(page).toHaveURL(/month=2026-08/);
  await expect(page.getByText('2026년 8월')).toBeVisible();
  await expect(page.getByText('−292,500원')).toBeVisible();
});

test('URL 로 들어와도 같은 화면이 나온다', async ({ page }) => {
  await page.goto('/history?month=2026-08&type=expense');

  await expect(page.getByText('2026년 8월')).toBeVisible();
  await expect(page.getByRole('radio', { name: '지출' })).toBeChecked();
});
