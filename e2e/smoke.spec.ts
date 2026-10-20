import { expect, test } from '@playwright/test';

test('홈 화면이 렌더링된다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '내 가계부' })).toBeVisible();
});

test('하단 탭으로 홈·캘린더·내역을 오간다', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: '캘린더' }).click();
  await expect(page).toHaveURL(/\/calendar/);
  await expect(page.getByRole('heading', { name: '캘린더' })).toBeVisible();
  await expect(page.getByRole('link', { name: '캘린더' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.getByRole('link', { name: '내역' }).click();
  await expect(page).toHaveURL(/\/history/);
  await expect(
    page.getByRole('heading', { name: '입금·지출 내역' }),
  ).toBeVisible();

  await page.getByRole('link', { name: '홈' }).click();
  await expect(page.getByRole('heading', { name: '내 가계부' })).toBeVisible();
});

test('잘못된 search 값은 기본값으로 떨어져 화면이 깨지지 않는다', async ({
  page,
}) => {
  await page.goto('/calendar?month=2026-13&date=abc');
  await expect(page.getByRole('heading', { name: '캘린더' })).toBeVisible();
});
