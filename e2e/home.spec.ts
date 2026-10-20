import { expect, test } from '@playwright/test';

test.describe('홈 화면 (오늘 = 2026-09-15)', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 8, 15, 12));
    await page.goto('/');
  });

  test('시안의 남은 돈·총 입금·총 지출을 보여 준다', async ({ page }) => {
    await expect(page.getByText('민지님, 반가워요')).toBeVisible();
    await expect(page.getByText('9월 15일 화요일')).toBeVisible();

    const balance = page.getByRole('region', { name: '9월 남은 돈' });
    await expect(balance.getByText('1,842,500원')).toBeVisible();
    await expect(balance.getByText('3,420,000원')).toBeVisible();
    await expect(balance.getByText('1,577,500원')).toBeVisible();
  });

  test('생활비 예산 79% 사용과 422,500원 남음을 보여 준다', async ({
    page,
  }) => {
    const budget = page.getByRole('region', { name: '9월 생활비 예산' });

    await expect(budget.getByText('79% 사용')).toBeVisible();
    await expect(budget.getByText('422,500원 남음')).toBeVisible();
  });

  test('최근 내역 3건과 지난달 대비 12% 덜 썼다는 배너를 보여 준다', async ({
    page,
  }) => {
    const recent = page.getByRole('region', { name: '최근 내역' });

    await expect(recent.getByRole('listitem')).toHaveCount(3);
    await expect(recent.getByText('스타벅스')).toBeVisible();
    await expect(recent.getByText('월급')).toBeVisible();
    await expect(recent.getByText('지하철 충전')).toBeVisible();
    await expect(page.getByText('지난달보다 12% 덜 썼어요')).toBeVisible();
  });

  test('전체 보기를 누르면 내역 화면으로 이동한다', async ({ page }) => {
    await page.getByRole('link', { name: '전체 보기' }).click();

    await expect(page).toHaveURL(/\/history/);
    await expect(
      page.getByRole('heading', { name: '입금·지출 내역' }),
    ).toBeVisible();
  });
});
