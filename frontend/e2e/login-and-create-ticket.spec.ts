import { expect, test } from '@playwright/test';

test('user can log in and sees the dashboard', async ({ page }) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'e2e-token', role: 'Agent', full_name: 'IT Admin' }),
    });
  });
  await page.route('**/api/dashboard/sla-metrics', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/api/tickets', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.goto('/login');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: /sla dashboard/i })).toBeVisible();
});

test('empty ticket title shows a red validation error', async ({ page }) => {
  await page.route('**/api/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'e2e-token', role: 'Employee', full_name: 'Employee' }),
    });
  });

  await page.goto('/login');
  await page.locator('input[type="text"]').fill('nv01');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/my-tickets$/);

  await page.goto('/tickets/new');
  await page.locator('button[type="submit"]').click();

  const error = page.locator('.bg-red-50');
  await expect(error).toBeVisible();
  await expect(error).toHaveCSS('color', 'rgb(185, 28, 28)');
});